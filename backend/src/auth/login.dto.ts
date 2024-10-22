// src/auth/login.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  EMAIL: string;

  @IsNotEmpty()
  @IsString()
  PASSWORD: string;
}
