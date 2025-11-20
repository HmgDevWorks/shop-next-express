import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginDto,
  LoginResponseDto,
  LogoutDto,
  LogoutResponseDto,
  RefreshResponseDto,
  RefreshDto,
  RegisterDto,
  RegisterResponseDto,
  MeDto,
  MeResponseDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  ResetPasswordResponseDto,
  ResetPasswordDto,
  VerifyEmailResponseDto,
  VerifyEmailDto,
  ChangePasswordDto,
  ChangePasswordResponseDto,
  SendVerificationEmailDto,
  SendVerificationEmailResponseDto,
} from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { TokenType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.password !== loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const refreshToken = await this.createRefreshToken(user.id);
    const jwt = await this.jwt.signAsync({ userId: user.id });

    return {
      token: jwt,
      refreshToken: refreshToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });

    const refreshToken = await this.createRefreshToken(user.id);
    const jwt = await this.jwt.signAsync({ userId: user.id });

    return {
      token: jwt,
      refreshToken: refreshToken,
    };
  }

  async createRefreshToken(userId: string): Promise<string> {
    const refreshValue = randomUUID();
    const refreshToken = await this.prisma.token.create({
      data: {
        userId: userId,
        type: TokenType.REFRESH,
        token: await hash(refreshValue, 10),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      },
    });
    return refreshToken.token;
  }

  async logout(logoutDto: LogoutDto): Promise<LogoutResponseDto> {
    return {
      message: 'Logout successful',
    };
  }

  async refresh(refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return {
      token: 'refreshToken',
      refreshToken: 'refreshToken',
    };
  }

  async me(meDto: MeDto): Promise<MeResponseDto> {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    return {
      message: 'Forgot password successful',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    return {
      message: 'Reset password successful',
    };
  }

  //   async verifyEmail(
  //     verifyEmailDto: VerifyEmailDto,
  //   ): Promise<VerifyEmailResponseDto> {
  //     const user = await this.prisma.user.findUnique({
  //       where: { verificationCode: verifyEmailDto.code },
  //     });
  //     if (!user) {
  //       throw new UnauthorizedException('Invalid credentials');
  //     }
  //     return {
  //       message: 'Email verified successfully',
  //     };
  //   }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    return {
      message: 'Change password successful',
    };
  }

  async sendVerificationEmail(
    sendVerificationEmailDto: SendVerificationEmailDto,
  ): Promise<SendVerificationEmailResponseDto> {
    return {
      message: 'Send verification email successful',
    };
  }
}
