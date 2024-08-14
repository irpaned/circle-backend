import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function like(threadId: number, userId: number) {
  try {
    // 1. cek dulu ada ga threadnya
    const thread = await prisma.thread.findUnique({
      where: {
        id: threadId,
      },
    });

    if (!thread) throw new Error("Thread not found");

    // 2. cek ada atau ngga user yang ngelike
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const isLike = await prisma.like.findFirst({
      where: {
        threadId: thread.id,
        userId: user.id,
      },
    });

    if (isLike) {
      return await prisma.like.deleteMany({
        where: {
          threadId,
          userId,
        },
      });
    } else {
      return await prisma.like.create({
        data: {
          threadId,
          userId,
        },
      });
    }
  } catch (error) {
    throw Error;
  }
}

async function unlike(threadId: number, userId: number) {
  try {
    // cek dulu ada ga threadnya
    const thread = await prisma.thread.findUnique({
      where: {
        id: threadId,
      },
    });

    if (!thread) throw new Error("Thread not found");

    // cek ada atau ngga user yang ngelike
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new Error("User not found");

    // return
    return await prisma.like.deleteMany({
      where: {
        threadId,
        userId,
      },
    });
  } catch (error) {
    throw Error;
  }
}

// async function GetLike

export default { like, unlike };
