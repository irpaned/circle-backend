import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import ThreadController from "./controllers/thread-controller";
import UserController from "./controllers/user-controller";
import AuthController from "./controllers/auth-controller";
import dotenv from "dotenv";
import { upload } from "./middlewares/upload-file";
import { authenticate } from "./middlewares/authenticate";
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "../swagger/swagger-output.json";
import { createClient } from "redis";
import { initializeRedisClient, redisClient } from "./libs/redis";
import { transporter } from "./libs/nodemailer";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

// kita eksekusi default
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const routerv1 = express.Router();
const routerv2 = express.Router();

app.use(cors()); //fungsi : agar frontend bisa terhubung ke backend
app.use(express.json());
app.use("/api/v1", routerv1);
app.use("/api/v2", routerv2);
app.use("/uploads", express.static("uploads"));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);

app.get("/", async (req: Request, res: Response) => {
  const info = await transporter.sendMail({
    from: '"Circle" <muhammadirfan2823@gmail.com>', // sender address
    to: "muhammadirfann6644@gmail.com", // list of receivers
    subject: "Kamu berhasil masuk ke halaman yang tidak berguna!", // Subject line
    text: "apa ini? asdadsadaldka dadqlidqi hq", // plain text body
    html: "<b>Follow instagram @irpaned</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  res.send("Hello welcome to circle");
});

// v1
routerv1.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to v1");
});

// THREADS
routerv1.get(
  "/threads",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    next();
  },
  ThreadController.find
);
routerv1.get("/threads/:id", authenticate, ThreadController.findOne);
routerv1.get(
  "/threads/profile/:id",
  authenticate,
  ThreadController.findManyProfile
);
routerv1.delete("/threads/:id", authenticate, ThreadController.remove);
routerv1.post(
  "/threads",
  authenticate,
  upload.single("image"),
  ThreadController.create
);
routerv1.patch("/threads/:id", authenticate, ThreadController.update);
routerv1.post(
  "/threads/:id",
  authenticate,
  upload.single("image"),
  ThreadController.reply
);

// LIKE
routerv1.post("/like/:id", authenticate, ThreadController.like);
routerv1.delete("/unlike/:id", authenticate, ThreadController.unlike);

// FOLLOW
routerv1.post("/follow/:id", authenticate, UserController.follow);
routerv1.get(
  "/get-followings/:id",
  authenticate,
  UserController.getDataFollowings
);
routerv1.get(
  "/get-followers/:id",
  authenticate,
  UserController.getDataFollowers
);
routerv1.get(
  "/count-follow/:id",
  authenticate,
  UserController.CountDataFollowers
);

// AUTH
routerv1.post("/auth/login", AuthController.login);
routerv1.post("/auth/check", authenticate, AuthController.check);
routerv1.post("/auth/register", AuthController.register);
routerv1.post("/auth/reset-password", AuthController.resetPassword);
routerv1.patch("/auth/resetpassword", AuthController.ResetPassword);
routerv1.get("/auth/verify-email", AuthController.verifyEmail);
routerv1.get(
  "/auth/verify-email-reset-password",
  AuthController.verifyEmailForForgotPassword
);

// USER
routerv1.get("/user/:id", UserController.findOneProfile);
routerv1.get("/users", authenticate, UserController.find);
routerv1.patch(
  "/user/:id",
  upload.single("photoProfile"),
  UserController.updateProfile
);

// v2
routerv2.get("/", (req: Request, res: Response) => {
  res.send("Welcome to v2");
});

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});
