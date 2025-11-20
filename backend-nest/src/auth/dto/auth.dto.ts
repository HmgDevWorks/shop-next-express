import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { MessageResponseDto } from 'src/shared/dto/message-response.dto';

export class LoginDto {
  @ApiProperty({ description: 'Email del usuario' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

@Exclude()
export class LoginResponseDto {
  @ApiProperty({ description: 'Token de acceso' })
  @Expose()
  @IsString()
  token: string;
  @ApiProperty({ description: 'Token de refresco' })
  @Expose()
  @IsString()
  refreshToken: string;
}

export class LoginTokenDto {
  @ApiProperty({ description: 'Token de acceso' })
  @IsNotEmpty()
  @IsString()
  token: string;
  @ApiProperty({ description: 'Token de refresco' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'Nombre del usuario' })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ description: 'Email del usuario' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

@Exclude()
export class RegisterResponseDto {
  @ApiProperty({ description: 'Token de acceso' })
  @Expose()
  @IsString()
  token: string;
  @ApiProperty({ description: 'Token de refresco' })
  @Expose()
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({ description: 'Token de acceso' })
  @IsNotEmpty()
  @IsString()
  token: string;
}

@Exclude()
export class LogoutResponseDto extends MessageResponseDto {}

export class RefreshDto {
  @ApiProperty({ description: 'Token de refresco' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

@Exclude()
export class RefreshResponseDto {
  @ApiProperty({ description: 'Token de acceso' })
  @Expose()
  @IsString()
  token: string;
  @ApiProperty({ description: 'Token de refresco' })
  @Expose()
  @IsString()
  refreshToken: string;
}

export class MeDto {
  @ApiProperty({ description: 'Token de acceso' })
  @IsNotEmpty()
  @IsString()
  token: string;
}

@Exclude()
export class MeResponseDto {
  @ApiProperty({ description: 'Nombre del usuario' })
  @Expose()
  @IsString()
  name: string;
  @ApiProperty({ description: 'Email del usuario' })
  @Expose()
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email del usuario' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

@Exclude()
export class ForgotPasswordResponseDto extends MessageResponseDto {}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de acceso' })
  @IsNotEmpty()
  @IsString()
  token: string;
  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

@Exclude()
export class ResetPasswordResponseDto extends MessageResponseDto {}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Código de verificación' })
  @IsNotEmpty()
  @IsString()
  code: string;
}

@Exclude()
export class VerifyEmailResponseDto extends MessageResponseDto {}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Contraseña actual' })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;
  @ApiProperty({ description: 'Nueva contraseña' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

@Exclude()
export class ChangePasswordResponseDto extends MessageResponseDto {}

export class SendVerificationEmailDto {
  @ApiProperty({ description: 'Email del usuario' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

@Exclude()
export class SendVerificationEmailResponseDto extends MessageResponseDto {}
