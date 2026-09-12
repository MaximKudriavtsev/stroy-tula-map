import { Test, TestingModule } from '@nestjs/testing';
import { ObjectController } from './object.controller';
import { ObjectService } from './object.service';

describe('ObjectController', () => {
  let controller: ObjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectController],
      providers: [
        {
          provide: ObjectService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ObjectController>(ObjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
