import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'yusuf', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    example: 'Yusuf',
    description: 'Display name shown in UI',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    example: 'Buy groceries',
    description: 'Optional first todo created alongside the user',
  })
  @IsOptional()
  @IsString()
  firstTodoTitle?: string;
}
