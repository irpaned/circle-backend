// // Halaman ini berfungsi seperti membuat batas bagi orang yang tidak login, jadi mereka tidak bisa melihat thread, membuat post, update dan delete post

// import { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken";

// //  next untuk melanjutkan fungsi selanjutnya
// export function authenticate(req: Request, res: Response, next: NextFunction) {
//   // 👇 ini bukan sembarangan command, ini berguna
//   /*
//   #swagger.security = [{
//             "bearerAuth": []
//     }]
//   */

//   // untuk ambil data dari tokennya
//   const authorizationHeader = req.headers.authorization; // output : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJpcmZhbkBnbWFpbC5jb20iLCJ1c2VyTmFtZSI6ImlyZmFuIiwiZnVsbE5hbWUiOiJNdWhhbW1hZCBJcmZhbiIsInBob3RvUHJvZmlsZSI6bnVsbCwiYmlvIjpudWxsLCJjcmVhdGVkQXQiOiIyMDI0LTA2LTAyVDEwOjAyOjM5LjMyMloiLCJ1cGRhdGVBdCI6IjIwMjQtMDYtMDJUMTA6MDI6MzkuMzIyWiIsImlhdCI6MTcxNzMyMjY1MH0.PBPcGqNTW5T2eEMqlhETM2yVWMGT6SPxU2Uh1xAIAm8

//   // jika authorizationHeader gaada || atau authorizationHeader-nya tidak di awali "Bearer" 👇
//   if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
//     // maka mengembalikan/me-return respon error
//     return res.status(401).json({
//       error: "Unauthorized!",
//     });
//   }

//   //   cara bacanya split itu memisahkan berdasarkan spasi dan diubah menjadi array, setelah itu diambil index ke 1, contoh : BearereyJhbblabla... -> Bearer eyJhbblabla... -> ["Bearer", "eyJhbblabla..."] -> dan di ambil hanya index ke 1 yaitu tokennya "eyJhbblabla..."
//   const token = authorizationHeader.split(" ")[1];

//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET);

//     res.locals.user = user;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       error: "Unauthorized!",
//     });
//   }
// }

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  /* 
  #swagger.security = [{
            "bearerAuth": []
    }] 
  */

  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
    return res.status(401).json({
      error: "Unauthorized!",
    });
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    res.locals.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized!",
    });
  }
}
