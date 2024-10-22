import {
  IsString,
  IsEnum,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class TaskDto {
  @IsString()
  @IsNotEmpty()
  TITLE: string;

  @IsString()
  @IsNotEmpty()
  STATUS: string;

  @IsMongoId()
  @IsOptional()
  PROJECT?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  ASSIGNEDTO?: Types.ObjectId;
}
