// disini adalah kumpulan logic, bukan tempat mengembalikan respon

import { PrismaClient, Thread } from "@prisma/client";
import { CreateThreadDTO, UpdateThreadDTO } from "../dto/thread-dto";
import { createThreadSchemaJoi } from "../validators/thread-schema";
import { error } from "console";
import { v2 as cloudinary } from "cloudinary";
import thread from "../controllers/thread-controller";
import { editProfileDTO } from "../dto/auth-dto";

const prisma = new PrismaClient();

async function find(userId: Number) {
  try {
    const data = await prisma.thread.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            photoProfile: true,
            userName: true,
          },
        },
        likes: true,
        replies: true,
      },
    });

    return data.map((thread) => {
      return {
        ...thread,
        TotalLikes: thread.likes.length,
        isLiked: thread.likes.some((like) => like.userId === userId),
        TotalReplies: thread.replies.length,
        isReplied: thread.replies.some((replies) => replies.userId === userId),
      };
    });
  } catch (error) {
    return error;
  }
}

async function findOne(id: number) {
  try {
    const thread = await prisma.thread.findFirst({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            photoProfile: true,
            userName: true,
          },
        },
        likes: true,
        replies: true,
      },
    });

    if (!thread) throw new String("Thread not found!");

    return thread;
  } catch (error) {
    throw new String(error);
  }
}

// async function findDetailThread(id: number, userId: number) {
//   try {
//     const data = await prisma.thread.findUnique({
//       where: {
//         id,
//       },
//       include: {
//         user: {
//           select: {
//             fullName: true,
//             photoProfile: true,
//             userName: true,
//           },
//         },
//         likes: true,
//         replies: true,
//       },
//     });

//       return {
//         ...thread,
//         TotalLikes: thread.likes.length,
//         isLiked: thread.likes.some((like) => like.userId === userId),
//         TotalReplies: thread.replies.length,
//         isReplied: thread.replies.some((replies) => replies.userId === userId),
//       };

//   } catch (error) {
//     throw new String(error);
//   }
// }

async function findDetailThread(id: number, userId: number) {
  try {
    const thread = await prisma.thread.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            fullName: true,
            photoProfile: true,
            userName: true,
          },
        },
        likes: true,
        replies: {
          select: {
            id: true,
            userId: true,
            content: true,
            image: true,
            createdAt: true,
            user: {
              select: {
                likes: {
                  select: {
                    id: true,
                    userId: true,
                    threadId: true,
                    createdAt: true,
                    updateAt: true,
                  },
                },
                fullName: true,
                userName: true,
                createdAt: true,
                photoProfile: true,
              },
            },
          },
        },
      },
    });

    if (!thread) {
      return null;
    }

    return {
      ...thread,
      TotalLikes: thread.likes.length,
      isLiked: thread.likes.some((like) => like.userId === userId),
      TotalReplies: thread.replies.length,
      isReplied: thread.replies.some((replies) => replies.userId === userId),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function findManyProfile(userId: number) {
  try {
    const data = await prisma.thread.findMany({
      where: { userId },
      include: {
        user: true,
        likes: true,
        replies: true,
      },
    });

    if (!thread) throw new String("Thread not found!");

    return data.map((thread) => {
      return {
        ...thread,
        TotalLikes: thread.likes.length,
        isLiked: thread.likes.some((like) => like.userId === userId),
        TotalReplies: thread.replies.length,
        isReplied: thread.replies.some((replies) => replies.userId === userId),
      };
    });
  } catch (error) {
    throw new String(error);
  }
}

async function create(dto: CreateThreadDTO, userId: number) {
  try {
    const validate = createThreadSchemaJoi.validate(dto);

    if (validate.error) {
      throw new String(validate.error.message);
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (dto.image) {
      const upload = await cloudinary.uploader.upload(dto.image, {
        upload_preset: "b54circle",
      });
      dto.image = upload.secure_url;
    }

    return await prisma.thread.create({
      data: { ...dto, userId: userId },
    });
  } catch (error) {
    throw new String(error);
  }
}

async function update(id: number, dto: UpdateThreadDTO, userId: number) {
  try {
    const thread = await prisma.thread.findFirst({
      where: { id: Number(id) },
    });

    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    // ini 👇 cara bacanya : kalau misalkan gaada berarti gausah di update, kalau ada baru diupdate
    if (dto.content) {
      thread.content = dto.content;
    }

    if (dto.image) {
      thread.image = dto.image;
    }

    if (thread.userId !== user.id) {
      throw new Error("You can't update thread other people");
    } else {
      return await prisma.thread.update({
        where: { id: Number(id) },
        data: { ...thread },
      });
    }
  } catch (error) {
    throw new String(error);
  }
}

async function remove(id: number, userId: number) {
  try {
    const thread = await prisma.thread.findFirst({
      where: { id: Number(id) },
    });

    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    if (thread.userId !== user.id) {
      throw new Error("You can't delete thread other people");
    } else {
      return await prisma.thread.delete({
        where: { id: Number(id) },
      });
    }
  } catch (error) {
    throw new String(error);
  }
}

export default {
  find,
  findOne,
  create,
  update,
  remove,
  findManyProfile,
  findDetailThread,
};
