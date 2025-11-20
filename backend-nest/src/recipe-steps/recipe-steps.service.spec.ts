import { Test, TestingModule } from '@nestjs/testing';
import { RecipeStepsService } from './recipe-steps.service';

describe('RecipeStepsService', () => {
  let service: RecipeStepsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeStepsService],
    }).compile();

    service = module.get<RecipeStepsService>(RecipeStepsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
