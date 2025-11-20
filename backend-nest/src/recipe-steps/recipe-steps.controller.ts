import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecipeStepsService } from './recipe-steps.service';
import { CreateRecipeStepDto } from './dto/create-recipe-step.dto';
import { UpdateRecipeStepDto } from './dto/update-recipe-step.dto';

@Controller('recipe-steps')
export class RecipeStepsController {
  constructor(private readonly recipeStepsService: RecipeStepsService) {}

  @Post()
  create(@Body() createRecipeStepDto: CreateRecipeStepDto) {
    return this.recipeStepsService.create(createRecipeStepDto);
  }

  @Get()
  findAll() {
    return this.recipeStepsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipeStepsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecipeStepDto: UpdateRecipeStepDto) {
    return this.recipeStepsService.update(+id, updateRecipeStepDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipeStepsService.remove(+id);
  }
}
