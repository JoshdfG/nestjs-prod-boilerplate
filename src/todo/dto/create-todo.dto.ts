import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: 'Learn NestJS' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Go through the official docs' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isComplete?: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID of the user this todo belongs to',
  })
  @IsInt()
  userId: number;
}
