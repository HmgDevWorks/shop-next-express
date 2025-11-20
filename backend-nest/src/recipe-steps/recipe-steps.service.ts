import { Injectable } from '@nestjs/common';
import { CreateRecipeStepDto } from './dto/create-recipe-step.dto';
import { UpdateRecipeStepDto } from './dto/update-recipe-step.dto';

@Injectable()
export class RecipeStepsService {
  create(createRecipeStepDto: CreateRecipeStepDto) {
    return 'This action adds a new recipeStep';
  }

  findAll() {
    return `This action returns all recipeSteps`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recipeStep`;
  }

  update(id: number, updateRecipeStepDto: UpdateRecipeStepDto) {
    return `This action updates a #${id} recipeStep`;
  }

  remove(id: number) {
    return `This action removes a #${id} recipeStep`;
  }
}
