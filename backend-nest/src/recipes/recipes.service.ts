import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseRecipeDto } from './dto/response-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateSlug(name: string) {
    return name.toLowerCase().replace(/ /g, '-');
  }

  async create(
    createRecipeDto: CreateRecipeDto,
    userId: string,
  ): Promise<ResponseRecipeDto> {
    const slug = await this.generateSlug(createRecipeDto.name);
    const recipe = await this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          slug: slug,
          name: createRecipeDto.name,
          description: createRecipeDto.description,
          imageUrl: createRecipeDto.imageUrl,
          videoUrl: createRecipeDto.videoUrl,
          prepTime: createRecipeDto.prepTime,
          cookingTime: createRecipeDto.cookingTime,
          servings: createRecipeDto.servings,
          difficulty: createRecipeDto.difficulty,
          userId: userId,
          ingredients: {
            create: createRecipeDto.ingredients.map((ingredient) => ({
              ingredient: {
                connectOrCreate: {
                  where: {
                    name: ingredient.name.toLowerCase().trim(),
                  },
                  create: {
                    name: ingredient.name.toLowerCase().trim(),
                  },
                },
              },
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            })),
          },
        },
      });

      // Crear steps y sus ingredientes
      for (let i = 0; i < createRecipeDto.instructions.length; i++) {
        const instruction = createRecipeDto.instructions[i];
        const step = await tx.recipeStep.create({
          data: {
            recipeId: recipe.id,
            step: instruction.step,
            instruction: instruction.instruction,
            imageUrl: instruction.imageUrl,
            videoUrl: instruction.videoUrl,
          },
        });

        // Si esta instruction tiene stepIngredients, crearlos
        if (
          instruction.stepIngredients &&
          instruction.stepIngredients.length > 0
        ) {
          await tx.recipeStepIngredient.createMany({
            data: instruction.stepIngredients.map((stepIng) => ({
              recipeStepId: step.id,
              recipeIngredientId: stepIng.recipeIngredientId, // Ya viene del DTO
              quantity: stepIng.quantity,
              unit: stepIng.unit,
              observation: stepIng.observation,
            })),
          });
        }
      }

      const responseRecipe = await tx.recipe.findUnique({
        where: {
          id: recipe.id,
        },
        include: {
          ingredients: {
            include: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          instructions: {
            include: {
              recipeStepIngredients: {
                include: {
                  recipeIngredient: {
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!responseRecipe) {
        throw new BadRequestException('Error al crear la receta');
      }

      return this.toResponseDto(responseRecipe);
    });

    return recipe;
  }

  private toResponseDto(recipe: any): ResponseRecipeDto {
    return {
      id: recipe.id,
      slug: recipe.slug,
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      videoUrl: recipe.videoUrl,
      prepTime: recipe.prepTime,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      userId: recipe.userId,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      categories: recipe.categories.map((category: any) => ({
        id: category.category.id,
        name: category.category.name,
      })),
      steps: recipe.instructions.map((step: any) => ({
        id: step.id,
        step: step.step,
        instruction: step.instruction,
        imageUrl: step.imageUrl || '',
        videoUrl: step.videoUrl || '',
        stepIngredients: step.recipeStepIngredients.map((stepIng: any) => ({
          id: stepIng.id,
          recipeIngredientId: stepIng.recipeIngredientId,
          quantity: stepIng.quantity,
          unit: stepIng.unit,
          observation: stepIng.observation || '',
        })),
      })),
      ingredients: recipe.ingredients.map((ingredient: any) => ({
        id: ingredient.id,
        name: ingredient.ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
    };
  }

  findAll() {
    return `This action returns all recipes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recipe`;
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return `This action updates a #${id} recipe`;
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }
}
