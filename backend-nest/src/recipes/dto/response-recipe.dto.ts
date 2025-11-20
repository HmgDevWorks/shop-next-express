import { Difficulty } from '@prisma/client';

export class ResponseRecipeDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  prepTime: number;
  cookingTime: number;
  servings: number;
  difficulty: Difficulty;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  categories: ResponseRecipeCategoryDto[];
  steps: ResponseRecipeStepDto[];
  ingredients: ResponseRecipeIngredientDto[];
}

export class ResponseRecipeCategoryDto {
  id: string;
  name: string;
}

export class ResponseRecipeStepDto {
  id: string;
  step: number;
  instruction: string;
  imageUrl: string;
  videoUrl: string;
  stepIngredients: ResponseRecipeStepIngredientDto[];
}

export class ResponseRecipeStepIngredientDto {
  id: string;
  recipeIngredientId: string;
  quantity: number;
  unit: string;
  observation: string;
}

export class ResponseRecipeIngredientDto {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  observation: string;
}
