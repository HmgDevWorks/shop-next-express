/*
  Warnings:

  - Added the required column `unit` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `quantity` on the `RecipeIngredient` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `unit` to the `RecipeStepIngredient` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `quantity` on the `RecipeStepIngredient` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'MODERATOR', 'CHEF');

-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "unit" TEXT NOT NULL,
DROP COLUMN "quantity",
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RecipeStep" ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "RecipeStepIngredient" ADD COLUMN     "unit" TEXT NOT NULL,
DROP COLUMN "quantity",
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
