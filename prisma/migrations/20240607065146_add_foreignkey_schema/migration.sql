/*
  Warnings:

  - You are about to drop the column `content` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `updateBy` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `replies` table. All the data in the column will be lost.
  - You are about to drop the column `updateBy` on the `replies` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfLike` on the `threads` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfReplies` on the `threads` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfShare` on the `threads` table. All the data in the column will be lost.
  - You are about to drop the `following` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "following" DROP CONSTRAINT "following_userId_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "replies" DROP CONSTRAINT "replies_userId_fkey";

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "content",
DROP COLUMN "createdBy",
DROP COLUMN "image",
DROP COLUMN "updateBy",
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "threadId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "replies" DROP COLUMN "createdBy",
DROP COLUMN "updateBy",
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "threadId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "threads" DROP COLUMN "numberOfLike",
DROP COLUMN "numberOfReplies",
DROP COLUMN "numberOfShare";

-- DropTable
DROP TABLE "following";

-- CreateTable
CREATE TABLE "follows" (
    "id" SERIAL NOT NULL,
    "followedId" INTEGER,
    "followerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "replies" ADD CONSTRAINT "replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replies" ADD CONSTRAINT "replies_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
