import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: {
    create: jest.Mock;
    findOne: jest.Mock;
    findTodos: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findOne: jest.fn(),
      findTodos: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: service }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to UserService.create with the DTO and returns its result', async () => {
      const dto = { username: 'yusuf', displayName: 'Yusuf' };
      const created = { id: 1, ...dto, todos: [] };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findOne', () => {
    it('delegates to UserService.findOne with the parsed numeric id', async () => {
      const user = { id: 1, username: 'yusuf', todos: [] };
      service.findOne.mockResolvedValue(user);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('findTodos', () => {
    it('delegates to UserService.findTodos with the parsed numeric id', async () => {
      const todos = [{ id: 1, title: 'Learn NestJS', userId: 1 }];
      service.findTodos.mockResolvedValue(todos);

      const result = await controller.findTodos(1);

      expect(service.findTodos).toHaveBeenCalledWith(1);
      expect(result).toEqual(todos);
    });
  });
});
