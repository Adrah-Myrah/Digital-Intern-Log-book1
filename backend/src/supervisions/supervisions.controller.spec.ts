import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionsController } from './supervisions.controller';

describe('SupervisionsController', () => {
  let controller: SupervisionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisionsController],
    }).compile();

    controller = module.get<SupervisionsController>(SupervisionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
