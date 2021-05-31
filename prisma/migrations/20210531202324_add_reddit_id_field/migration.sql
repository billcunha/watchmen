/*
  Warnings:

  - A unique constraint covering the columns `[redditId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `redditId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "redditId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post.redditId_unique" ON "Post"("redditId");
