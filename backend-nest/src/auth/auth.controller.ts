import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RegisterResponseDto,
  LogoutDto,
  RefreshDto,
  MeDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ChangePasswordDto,
  SendVerificationEmailDto,
  LogoutResponseDto,
  RefreshResponseDto,
  MeResponseDto,
  ForgotPasswordResponseDto,
  ResetPasswordResponseDto,
  VerifyEmailResponseDto,
  ChangePasswordResponseDto,
  SendVerificationEmailResponseDto,
} from './dto/auth.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Register' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: RegisterResponseDto })
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  logout(@Body() logoutDto: LogoutDto): Promise<LogoutResponseDto> {
    return this.authService.logout(logoutDto);
  }

  @Post('refresh')
  refresh(@Body() refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshDto);
  }

  @Post('me')
  me(@Body() meDto: MeDto): Promise<MeResponseDto> {
    return this.authService.me(meDto);
  }

  @Post('forgot-password')
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // @Post('verify-email')
  // verifyEmail(
  //   @Body() verifyEmailDto: VerifyEmailDto,
  // ): Promise<VerifyEmailResponseDto> {
  //   return this.authService.verifyEmail(verifyEmailDto);
  // }

  @Post('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    return this.authService.changePassword(changePasswordDto);
  }

  @Post('send-verification-email')
  sendVerificationEmail(
    @Body() sendVerificationEmailDto: SendVerificationEmailDto,
  ): Promise<SendVerificationEmailResponseDto> {
    return this.authService.sendVerificationEmail(sendVerificationEmailDto);
  }
}
