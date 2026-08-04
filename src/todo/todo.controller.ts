import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoResponseDto } from './dto/todo-response.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('todos')
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiResponse({ status: 201, type: TodoResponseDto })
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'List todos, optionally filtered by user' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  findAll(@Query('userId') userId?: string) {
    return this.todoService.findAll(userId ? +userId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single todo by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.remove(id);
  }
}
