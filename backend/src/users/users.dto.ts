import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class UsersDto {
  @IsString()
  USERNAME: string;

  @IsString()
  PASSWORD: string;

  @IsString()
  ROLE: string;

  @IsString()
  EMAIL: string;
}
