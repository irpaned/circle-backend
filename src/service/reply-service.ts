import { PrismaClient } from "@prisma/client";
import { replyThreadSchemaJoi } from "../validators/reply-thread-schema";
import { ReplyThreadDTO } from "../dto/reply-thread";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

async function ReplyThread(
  threadId: number,
  userId: number,
  dto: ReplyThreadDTO
) {
  try {
    // validate
    const validate = replyThreadSchemaJoi.validate(dto);

    if (validate.error) {
      console.log("error");

      throw new String(validate.error.message);
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (dto.image) {
      //   ini mksdnya di upload di folder b54circle yg ada di cloudinary
      const upload = await cloudinary.uploader.upload(dto.image, {
        upload_preset: "b54circle",
      });
      dto.image = upload.secure_url; // secure_url untuk apa?
    }

    // cari thread yang mau di komen
    const thread = await prisma.thread.findFirst({
      where: {
        id: threadId,
      },
    });

    if (!thread) throw new Error("Thread not found!");

    // user yang mau komen
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new Error("Thread not found!");

    return await prisma.reply.create({
      data: {
        ...dto,
        threadId,
        userId,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

export default { ReplyThread };
