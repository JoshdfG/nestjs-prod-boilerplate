import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getLoggerToken } from 'nestjs-pino';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    userTodo: {
      findMany: jest.Mock;
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
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      userTodo: {
        findMany: jest.fn(),
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
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
        { provide: getLoggerToken(UserService.name), useValue: logger },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a user without a first todo', async () => {
      const dto = { username: 'yusuf', displayName: 'Yusuf' };
      const created = { id: 1, ...dto, todos: [] };
      prisma.user.create.mockResolvedValue(created);

      const result = await service.create(dto as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'yusuf',
          displayName: 'Yusuf',
          todos: undefined,
        },
        include: { todos: true },
      });
      expect(logger.info).toHaveBeenCalledWith(
        { userId: created.id },
        'User created',
      );
      expect(result).toEqual(created);
    });

    it('creates a user with a nested first todo when firstTodoTitle is provided', async () => {
      const dto = {
        username: 'yusuf',
        displayName: 'Yusuf',
        firstTodoTitle: 'Buy groceries',
      };
      const created = {
        id: 2,
        username: 'yusuf',
        displayName: 'Yusuf',
        todos: [{ id: 1, title: 'Buy groceries' }],
      };
      prisma.user.create.mockResolvedValue(created);

      const result = await service.create(dto as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'yusuf',
          displayName: 'Yusuf',
          todos: { create: [{ title: 'Buy groceries' }] },
        },
        include: { todos: true },
      });
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('returns all users with their todos', async () => {
      const users = [{ id: 1, username: 'yusuf', todos: [] }];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: { todos: true },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('returns the cached user on a cache hit, without querying Postgres', async () => {
      const cachedUser = { id: 1, username: 'yusuf', todos: [] };
      cache.get.mockResolvedValue(cachedUser);

      const result = await service.findOne(1);

      expect(cache.get).toHaveBeenCalledWith('user:1');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        { userId: 1, cacheKey: 'user:1' },
        'Cache hit',
      );
      expect(result).toEqual(cachedUser);
    });

    it('queries Postgres and populates the cache on a cache miss', async () => {
      const dbUser = { id: 1, username: 'yusuf', todos: [] };
      cache.get.mockResolvedValue(undefined);
      prisma.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.findOne(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { todos: true },
      });
      expect(cache.set).toHaveBeenCalledWith('user:1', dbUser, 5 * 60_000);
      expect(logger.debug).toHaveBeenCalledWith(
        { userId: 1, cacheKey: 'user:1' },
        'Cache miss',
      );
      expect(result).toEqual(dbUser);
    });

    it('does not cache a null result when the user does not exist', async () => {
      cache.get.mockResolvedValue(undefined);
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(cache.set).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findTodos', () => {
    it('returns cached todos on a cache hit', async () => {
      const cachedTodos = [{ id: 1, title: 'Learn NestJS', userId: 1 }];
      cache.get.mockResolvedValue(cachedTodos);

      const result = await service.findTodos(1);

      expect(cache.get).toHaveBeenCalledWith('user:1:todos');
      expect(prisma.userTodo.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(cachedTodos);
    });

    it('queries Postgres and populates the cache on a cache miss', async () => {
      const dbTodos = [{ id: 1, title: 'Learn NestJS', userId: 1 }];
      cache.get.mockResolvedValue(undefined);
      prisma.userTodo.findMany.mockResolvedValue(dbTodos);

      const result = await service.findTodos(1);

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
});
