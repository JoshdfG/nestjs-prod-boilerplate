import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTodoDto: CreateTodoDto) {
    return this.prisma.userTodo.create({
      data: createTodoDto, // { title, description?, isComplete?, userId }
    });
  }

  findAll() {
    return this.prisma.userTodo.findMany();
  }

  async findOne(id: number) {
    const todo = await this.prisma.userTodo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    await this.findOne(id); // 404s if missing
    return this.prisma.userTodo.update({
      where: { id },
      data: updateTodoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.userTodo.delete({ where: { id } });
  }
}
