import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function follow(followedId: number, followerId: number) {
  try {
    const targetUser = await prisma.user.findUnique({
      where: {
        id: followedId,
      },
    });

    const myUser = await prisma.user.findUnique({
      where: {
        id: followerId,
      },
    });

    if (targetUser === myUser) throw new Error("You can't follow yourself!");

    if (!targetUser || !myUser) throw new Error("User not found!");

    const isFollowing = await prisma.follow.findFirst({
      where: {
        followedId: targetUser.id,
        followerId: myUser.id,
      },
    });
    if (isFollowing) {
      return await prisma.follow.deleteMany({
        where: {
          followerId,
          followedId,
        },
      });
    } else {
      return await prisma.follow.create({
        data: {
          followedId,
          followerId,
        },
      });
    }
  } catch (error) {
    throw Error;
  }
}

export default { follow };
