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
      html: `
      <div style="background-color: #FFF; margin: auto; width: 50%; text-align: center; padding: 1rem; border-radius: 12px; font-family: Arial, Helvetica, sans-serif; color: black;">
          <H1 style="color: #04A51E; font-weight: bold;">Circle App</H1>
          <p style="font-size: 0.8rem;">Welcome to Circle!<br> Click the button below to verify your account</p>
          <Button style="background-color: #04A51E; border: none; border-radius: 12px; height: 40px; margin: 1rem;"><a style="text-decoration: none; color: white; margin: 0.5rem; font-size: 1rem;" href="${fullUrl}/api/v1/auth/verify-email?token=${token}">Verify</a></Button>
          <p style="font-size: 0.8rem;">Please ignore this message if you feel that you are not registering to our services.</p>
          <p style="font-size: 0.8rem; margin-top: 0.33rem;"> Thank you for using our services.</p>
      </div>
      `,
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
    const getUser = await AuthService.user(req.body);

    const token = jwt.sign(getUser.id.toString(), process.env.JWT_SECRET);
    const fullUrl = req.protocol + "://" + req.get("host");

    const info = await transporter.sendMail({
      from: '"Circle" <muhammadirfan2823@gmail.com>',
      to: getUser.email,
      subject: "Verification Link",
      html: `
      <div style="background-color: #FFF; margin: auto; width: 50%; text-align: center; padding: 1rem; border-radius: 12px; font-family: Arial, Helvetica, sans-serif; color: black;">
          <H1 style="color: #04A51E; font-weight: bold;">Circle App</H1>
          <p style="font-size: 0.8rem;">Welcome to Circle!<br> Click the button below to verify your email</p>
          <Button style="background-color: #04A51E; border: none; border-radius: 12px; height: 40px; margin: 1rem;"><a style="text-decoration: none; color: white; margin: 0.5rem; font-size: 1rem;" href="${fullUrl}/api/v1/auth/verify-email-reset-password?token=${token}">Verify</a></Button>
          <p style="font-size: 0.8rem;">Please ignore this message if you feel that you are not registering to our services.</p>
          <p style="font-size: 0.8rem; margin-top: 0.33rem;"> Thank you for using our services.</p>
      </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);

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
