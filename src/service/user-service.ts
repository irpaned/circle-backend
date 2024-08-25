import { PrismaClient } from "@prisma/client";
import { editProfileDTO } from "../dto/auth-dto";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

//  masukkan ke parameter (query string step 2)
async function find(search: string, userId: number) {
  try {
    const data = await prisma.user.findMany({
      where: {
        userName: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: {
        followers: true,
        followeds: true,
      },
    });

    return data.map((profile) => {
      return {
        ...profile,
        TotalFollowers: profile.followers.length,
        isFollower: profile.followers.some(
          (followers) => followers.followerId === userId
        ),
      };
    });
  } catch (error) {
    throw new Error(error.message || "Failed to retrieve users");
  }
}

async function findMany() {
  try {
    const user = await prisma.user.findMany();
    return user;
  } catch (error) {}
}

async function findOneProfile(id: number) {
  try {
    const profile = await prisma.user.findFirst({
      where: { id },
      include: {
        followers: true,
        followeds: true,
      },
    });

    if (!profile) {
      throw new Error("Profile not found!");
    }

    return {
      ...profile,
      TotalFollowers: profile.followers.length,
      isFollower: profile.followers.some(
        (follower) => follower.followerId === id
      ),
      TotalFolloweds: profile.followeds.length,
      isFollowed: profile.followeds.some(
        (followed) => followed.followedId === id
      ),
    };
  } catch (error) {
    throw new String(error);
  }
}

async function updateProfile(id: number, dto: editProfileDTO) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: Number(id) },
    });

    if (dto.fullName) {
      user.fullName = dto.fullName;
    }

    if (dto.userName) {
      user.userName = dto.userName;
    }

    if (dto.bio) {
      user.bio = dto.bio;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (dto.photoProfile) {
      const upload = await cloudinary.uploader.upload(dto.photoProfile, {
        upload_preset: "b54circle",
      });
      user.photoProfile = dto.photoProfile = upload.secure_url;
    }
    return await prisma.user.update({
      where: { id: Number(id) },
      data: { ...user },
    });
  } catch (error) {
    throw new String(error);
  }
}

export default { find, updateProfile, findOneProfile, findMany };
