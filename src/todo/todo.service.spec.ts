import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getLoggerToken } from 'nestjs-pino';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TodoService', () => {
  let service: TodoService;
  let prisma: {
    userTodo: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let logger: {
    info: jest.Mock;
    error: jest.Mock;
    warn: jest.Mock;
    debug: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      userTodo: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
        { provide: getLoggerToken(TodoService.name), useValue: logger },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a todo, invalidates the user todo-list cache, and logs it', async () => {
      const dto = { title: 'Learn NestJS', userId: 1 };
      const created = { id: 1, ...dto, description: null, isComplete: false };
      prisma.userTodo.create.mockResolvedValue(created);

      const result = await service.create(dto as any);

      expect(prisma.userTodo.create).toHaveBeenCalledWith({ data: dto });
      expect(cache.del).toHaveBeenCalledWith('user:1:todos');
      expect(logger.info).toHaveBeenCalledWith(
        { todoId: created.id, userId: dto.userId },
        'Todo created',
      );
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('returns every todo, uncached, when no userId is given', async () => {
      const todos = [{ id: 1, title: 'Learn NestJS', userId: 1 }];
      prisma.userTodo.findMany.mockResolvedValue(todos);

      const result = await service.findAll();

      expect(prisma.userTodo.findMany).toHaveBeenCalledWith();
      expect(cache.get).not.toHaveBeenCalled();
      expect(result).toEqual(todos);
    });

    it('returns cached todos for a given userId on a cache hit', async () => {
      const cached = [{ id: 1, title: 'Learn NestJS', userId: 1 }];
      cache.get.mockResolvedValue(cached);

      const result = await service.findAll(1);

      expect(cache.get).toHaveBeenCalledWith('user:1:todos');
      expect(prisma.userTodo.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(cached);
    });

    it('queries Postgres and populates the cache for a given userId on a cache miss', async () => {
      const dbTodos = [{ id: 1, title: 'Learn NestJS', userId: 1 }];
      cache.get.mockResolvedValue(undefined);
      prisma.userTodo.findMany.mockResolvedValue(dbTodos);

      const result = await service.findAll(1);

      expect(prisma.userTodo.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(cache.set).toHaveBeenCalledWith(
        'user:1:todos',
        dbTodos,
        5 * 60_000,
      );
      expect(result).toEqual(dbTodos);
    });
  });

  describe('findOne', () => {
    it('returns the todo when found', async () => {
      const todo = { id: 1, title: 'Learn NestJS', userId: 1 };
      prisma.userTodo.findUnique.mockResolvedValue(todo);

      const result = await service.findOne(1);

      expect(prisma.userTodo.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(todo);
    });

    it('throws NotFoundException when the todo does not exist', async () => {
      prisma.userTodo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Todo #999 not found');
    });
  });

  describe('update', () => {
    it("updates the todo and invalidates the owning user's todo-list cache", async () => {
      const existing = { id: 1, title: 'Old title', userId: 1 };
      const updated = { ...existing, title: 'New title' };
      prisma.userTodo.findUnique.mockResolvedValue(existing);
      prisma.userTodo.update.mockResolvedValue(updated);

      const result = await service.update(1, { title: 'New title' } as any);

      expect(prisma.userTodo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'New title' },
      });
      expect(cache.del).toHaveBeenCalledWith('user:1:todos');
      expect(logger.info).toHaveBeenCalledWith(
        { todoId: 1, userId: existing.userId },
        'Todo updated',
      );
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException and never writes when the todo does not exist', async () => {
      prisma.userTodo.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, { title: 'Anything' } as any),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.userTodo.update).not.toHaveBeenCalled();
      expect(cache.del).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the todo, invalidates the cache, and logs it', async () => {
      const existing = { id: 1, title: 'Learn NestJS', userId: 1 };
      prisma.userTodo.findUnique.mockResolvedValue(existing);
      prisma.userTodo.delete.mockResolvedValue(existing);

      const result = await service.remove(1);

      expect(prisma.userTodo.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(cache.del).toHaveBeenCalledWith('user:1:todos');
      expect(logger.warn).toHaveBeenCalledWith(
        { todoId: 1, userId: existing.userId },
        'Todo deleted',
      );
      expect(result).toEqual(existing);
    });

    it('throws NotFoundException and never deletes when the todo does not exist', async () => {
      prisma.userTodo.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(prisma.userTodo.delete).not.toHaveBeenCalled();
    });
  });
});
