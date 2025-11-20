import { Difficulty } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsString()
  @IsOptional()
  imageUrl: string;
  @IsString()
  @IsOptional()
  videoUrl: string;
  @IsNumber()
  @IsOptional()
  prepTime: number;
  @IsNumber()
  @IsOptional()
  cookingTime: number;
  @IsNumber()
  @IsOptional()
  servings: number;
  @IsEnum(Difficulty)
  @IsNotEmpty({ message: 'Difficulty is required' })
  difficulty: Difficulty;
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  categories: string[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientInput)
  ingredients: IngredientInput[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructionInput)
  instructions: InstructionInput[];
}

class IngredientInput {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
  @IsString()
  @IsNotEmpty()
  unit: string;
}

class InstructionInput {
  @IsString()
  @IsNotEmpty()
  instruction: string;
  @IsNumber()
  @IsNotEmpty()
  step: number;
  @IsString()
  @IsOptional()
  imageUrl: string;
  @IsString()
  @IsOptional()
  videoUrl: string;
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StepIngredientInput)
  stepIngredients: StepIngredientInput[];
}

class StepIngredientInput {
  @IsString()
  @IsNotEmpty()
  recipeIngredientId: string;
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
  @IsString()
  @IsNotEmpty()
  unit: string;
  @IsString()
  @IsOptional()
  observation?: string;
}
