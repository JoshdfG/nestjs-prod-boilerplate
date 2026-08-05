import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

describe('TodoController', () => {
  let controller: TodoController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: service }],
    }).compile();

    controller = module.get<TodoController>(TodoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to TodoService.create with the DTO and returns its result', async () => {
      const dto = { title: 'Learn NestJS', userId: 1 };
      const created = { id: 1, ...dto, description: null, isComplete: false };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('passes undefined to the service when no userId query param is given', async () => {
      const todos = [{ id: 1, title: 'Learn NestJS', userId: 1 }];
      service.findAll.mockResolvedValue(todos);

      const result = await controller.findAll(undefined);

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(todos);
    });

    it('parses the userId query string into a number before delegating', async () => {
      const todos = [{ id: 1, title: 'Learn NestJS', userId: 1 }];
      service.findAll.mockResolvedValue(todos);

      const result = await controller.findAll('1');

      expect(service.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual(todos);
    });
  });

  describe('findOne', () => {
    it('delegates to TodoService.findOne with the parsed numeric id', async () => {
      const todo = { id: 1, title: 'Learn NestJS', userId: 1 };
      service.findOne.mockResolvedValue(todo);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(todo);
    });
  });

  describe('update', () => {
    it('delegates to TodoService.update with the parsed id and DTO', async () => {
      const updated = { id: 1, title: 'New title', userId: 1 };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, { title: 'New title' } as any);

      expect(service.update).toHaveBeenCalledWith(1, { title: 'New title' });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to TodoService.remove with the parsed numeric id', async () => {
      const removed = { id: 1, title: 'Learn NestJS', userId: 1 };
      service.remove.mockResolvedValue(removed);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(removed);
    });
  });
});
