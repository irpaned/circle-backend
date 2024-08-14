import { PrismaClient, VerificationType } from "@prisma/client";

import { LoginDTO, registerDTO, ResetDTO } from "../dto/auth-dto";
import { loginSchema, registerSchema } from "../validators/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../libs/nodemailer";

const prisma = new PrismaClient();

async function login(dto: LoginDTO) {
  try {
    const validate = loginSchema.validate(dto);

    if (validate.error) {
      throw new String(validate.error.message);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        followeds: true,
        followers: true,
      },
    });

    if (!user.isVerified) throw new Error("User is not verified");
    if (!user) throw new String("User not found!");

    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) throw new Error("User not found!");

    delete user.password;

    const jwtSecret = process.env.JWT_SECRET;

    const token = jwt.sign(user, jwtSecret);

    return { token, user };
  } catch (error) {
    throw new String(error);
  }
}

async function register(dto: registerDTO) {
  try {
    const validate = registerSchema.validate(dto);

    const salt = 10;
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    dto.password = hashedPassword;

    if (validate.error) {
      throw new String("User not found!");
    }

    return await prisma.user.create({
      data: { ...dto },
    });
  } catch (error) {
    throw new String(error);
  }
}

async function createVerification(token: string, type: VerificationType) {
  try {
    return await prisma.verification.create({
      data: {
        token,
        type,
      },
    });
  } catch (error) {
    throw new Error(error.message || "Failed to retrieve users");
  }
}

async function verify(token: string) {
  try {
    const verification = await prisma.verification.findUnique({
      where: { token },
    });
    const userId = jwt.verify(verification.token, process.env.JWT_SECRET);

    if (verification.type === "FORGOT_PASSWORD") {
      return await prisma.user.update({
        data: {
          isVerifiedEmail: true,
        },
        where: {
          id: Number(userId),
        },
      });
    } else {
      return await prisma.user.update({
        data: {
          isVerified: true,
        },
        where: {
          id: Number(userId),
        },
      });
    }
  } catch (error) {
    throw new Error(error.message || "Failed to verify email");
  }
}

async function verifyEmailForForgotPassword(token: string) {
  try {
    const verification = await prisma.verification.findUnique({
      where: { token },
    });
    const userId = jwt.verify(verification.token, process.env.JWT_SECRET);

    // if (verification.type === "FORGOT_PASSWORD") {
    //   return await prisma.user.update;
    // }

    return await prisma.user.update({
      data: {
        isVerifiedEmail: true,
      },
      where: {
        id: Number(userId),
      },
    });
  } catch (error) {
    throw new Error(error.message || "Failed to verify email");
  }
}
async function reset(dto: ResetDTO) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: String(dto.email),
        isVerifiedEmail: true,
      },
    });

    if (dto.password) {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(dto.password, salt);
      user.password = hashedPassword;
    }

    return await prisma.user.update({
      where: { email: String(dto.email) },
      data: {
        password: user.password,
        isVerifiedEmail: false,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export default {
  login,
  register,
  verify,
  createVerification,
  reset,
  verifyEmailForForgotPassword,
};
