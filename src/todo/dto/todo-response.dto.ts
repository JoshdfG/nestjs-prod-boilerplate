import { ApiProperty } from '@nestjs/swagger';

export class TodoResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() isComplete: boolean;
  @ApiProperty() userId: number;
}
