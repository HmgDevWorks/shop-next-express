import { Module } from '@nestjs/common';
import { RecipeStepsService } from './recipe-steps.service';
import { RecipeStepsController } from './recipe-steps.controller';

@Module({
  controllers: [RecipeStepsController],
  providers: [RecipeStepsService],
})
export class RecipeStepsModule {}
