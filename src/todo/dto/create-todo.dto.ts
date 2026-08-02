import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isComplete?: boolean;

  @IsInt()
  userId: number;
}
