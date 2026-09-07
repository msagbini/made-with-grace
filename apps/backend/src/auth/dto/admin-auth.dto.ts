import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class AdminRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;
}

export class AdminAuthResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
}
