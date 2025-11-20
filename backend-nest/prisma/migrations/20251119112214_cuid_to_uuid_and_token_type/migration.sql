/*
  Warnings:

  - A unique constraint covering the columns `[token,type]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('REFRESH', 'PASSWORD_RESET', 'EMAIL_VERIFY');

-- DropIndex
DROP INDEX "public"."Token_userId_token_key";

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "type" "TokenType" NOT NULL;

-- CreateIndex
CREATE INDEX "Token_userId_type_idx" ON "Token"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_type_key" ON "Token"("token", "type");
