import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password: string;
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

@Exclude({ toPlainOnly: true })
export class ResponseUserDto {
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @Expose()
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
  @Expose()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @Expose()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}

@Exclude({ toPlainOnly: true })
export class UserSimpleResponseDto {
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @Expose()
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
