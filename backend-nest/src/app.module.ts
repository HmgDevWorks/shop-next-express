import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipeStepsModule } from './recipe-steps/recipe-steps.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BooksModule } from './books/books.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    UsersModule,
    RecipesModule,
    IngredientsModule,
    RecipeStepsModule,
    ReviewsModule,
    BooksModule,
    BookmarksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
