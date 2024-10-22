import { IsString, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class ProjectDto {
  @IsString()
  @IsNotEmpty()
  NAME: string;

  @IsArray()
  @IsOptional()
  TASKS?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  MEMBERS?: Types.ObjectId[];
}
