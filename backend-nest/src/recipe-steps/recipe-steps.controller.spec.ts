import { Test, TestingModule } from '@nestjs/testing';
import { RecipeStepsController } from './recipe-steps.controller';
import { RecipeStepsService } from './recipe-steps.service';

describe('RecipeStepsController', () => {
  let controller: RecipeStepsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeStepsController],
      providers: [RecipeStepsService],
    }).compile();

    controller = module.get<RecipeStepsController>(RecipeStepsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
