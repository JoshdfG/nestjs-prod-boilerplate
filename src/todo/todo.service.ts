import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectPinoLogger(TodoService.name) private readonly logger: PinoLogger,
  ) {}

  async create(createTodoDto: CreateTodoDto) {
    const todo = await this.prisma.userTodo.create({ data: createTodoDto });
    await this.cache.del(`user:${todo.userId}:todos`);
    this.logger.info({ todoId: todo.id, userId: todo.userId }, 'Todo created');
    return todo;
  }

  async findAll(userId?: number) {
    if (!userId) {
      return this.prisma.userTodo.findMany();
    }
    const cacheKey = `user:${userId}:todos`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const todos = await this.prisma.userTodo.findMany({ where: { userId } });
    await this.cache.set(cacheKey, todos, 30_000);
    return todos;
  }

  async findOne(id: number) {
    const todo = await this.prisma.userTodo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const existing = await this.findOne(id);
    const todo = await this.prisma.userTodo.update({
      where: { id },
      data: updateTodoDto,
    });
    await this.cache.del(`user:${existing.userId}:todos`);
    return todo;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const todo = await this.prisma.userTodo.delete({ where: { id } });
    await this.cache.del(`user:${existing.userId}:todos`);
    this.logger.warn({ todoId: id, userId: existing.userId }, 'Todo deleted');
    return todo;
  }
}
