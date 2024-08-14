import { Request, Response } from "express";
import AuthService from "../service/auth-service";
import jwt from "jsonwebtoken";
import { transporter } from "../libs/nodemailer";
import userService from "../service/user-service";
import authService from "../service/auth-service";
// import { transporter } from "../libs/nodemailer";

async function login(req: Request, res: Response) {
  /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                       $ref: "#/components/schemas/LoginDTO"
                    }  
                }
            }
        } 
    */

  try {
    const user = await AuthService.login(req.body);

    res.json(user);
  } catch (error) {
    res.json({
      message: error,
    });
  }
}

async function register(req: Request, res: Response) {
  // day 15
  /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                       $ref: "#/components/schemas/RegisterDTO"
                    }  
                }
            }
        } 
    */

  try {
    const user = await AuthService.register(req.body);

    const token = jwt.sign(user.id.toString(), process.env.JWT_SECRET); // : eyskjfnskjfnskf
    const fullUrl = req.protocol + "://" + req.get("host");

    const info = await transporter.sendMail({
      from: '"Circle" <muhammadirfan2823@gmail.com>', // sender address
      to: user.email, // list of receivers
      subject: "Verification Link", // Subject line
      html: `<a href="${fullUrl}/api/v1/auth/verify-email?token=${token}">Klik untuk verifikasi email!</a>`, // html body a
    });

    console.log("Message sent: %s", info.messageId);

    await AuthService.createVerification(token, "EMAIL");

    res.status(201).json(user);
  } catch (error) {
    res.json({
      message: error,
    });
  }
}

async function verifyEmail(req: Request, res: Response) {
  try {
    const token = req.query.token as string;
    await AuthService.verify(token);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/login`);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function check(req: Request, res: Response) {
  try {
    res.json(res.locals.user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    const body = req.body;
    const getUser = await AuthService.reset(req.body);

    const token = jwt.sign(getUser.id.toString(), process.env.JWT_SECRET);
    const fullUrl = req.protocol + "://" + req.get("host");

    const info = await transporter.sendMail({
      from: '"Circle" <muhammadirfan2823@gmail.com>',
      to: getUser.email,
      subject: "Verification Link",
      html: `<a href="${fullUrl}/api/v1/auth/verify-email-reset-password?token=${token}">Klik untuk verifikasi email!</a>`,
    });

    console.log("Message sent: %s", info.messageId);

    await AuthService.createVerification(token, "FORGOT_PASSWORD");

    const user = await authService.reset(body);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
}

async function ResetPassword(req: Request, res: Response) {
  try {
    const reset = await AuthService.reset(req.body);

    res.status(200).json(reset);
  } catch (error) {
    console.log(error);
  }
}

async function verifyEmailForForgotPassword(req: Request, res: Response) {
  try {
    const token = req.query.token as string;
    await AuthService.verifyEmailForForgotPassword(token);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/reset-password`);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export default {
  login,
  register,
  check,
  verifyEmail,
  resetPassword,
  ResetPassword,
  verifyEmailForForgotPassword,
};
