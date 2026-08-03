import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        displayName: createUserDto.displayName,
        todos: createUserDto.firstTodoTitle
          ? { create: [{ title: createUserDto.firstTodoTitle }] }
          : undefined,
      },
      include: { todos: true },
    });
    return user; // nothing to invalidate yet — this user isn't cached until first read
  }

  async findAll() {
    return this.prisma.user.findMany({ include: { todos: true } });
  }

  async findOne(id: number) {
    const cacheKey = `user:${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { todos: true },
    });
    if (user) await this.cache.set(cacheKey, user, 60_000);
    return user;
  }

  async findTodos(userId: number) {
    const cacheKey = `user:${userId}:todos`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const todos = await this.prisma.userTodo.findMany({ where: { userId } });
    await this.cache.set(cacheKey, todos, 30_000);
    return todos;
  }
}
