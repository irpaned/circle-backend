/*
  Warnings:

  - You are about to drop the column `avatar` on the `threads` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userName]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "threads" DROP COLUMN "avatar",
ALTER COLUMN "numberOfReplies" DROP NOT NULL,
ALTER COLUMN "numberOfLike" DROP NOT NULL,
ALTER COLUMN "numberOfShare" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_userName_key" ON "user"("userName");
