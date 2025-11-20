import { PartialType } from '@nestjs/swagger';
import { CreateRecipeStepDto } from './create-recipe-step.dto';

export class UpdateRecipeStepDto extends PartialType(CreateRecipeStepDto) {}
