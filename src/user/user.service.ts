import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        displayName: createUserDto.displayName,
        todos: createUserDto.firstTodoTitle
          ? { create: [{ title: createUserDto.firstTodoTitle }] }
          : undefined,
      },
      include: { todos: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({ include: { todos: true } });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { todos: true },
    });
  }
}
