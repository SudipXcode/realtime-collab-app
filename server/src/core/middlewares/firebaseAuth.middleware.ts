// // src/core/middlewares/firebaseAuth.middleware.ts
// import { Request, Response, NextFunction, RequestHandler } from "express";
// import type { DecodedIdToken } from "firebase-admin/auth";
// import admin from "../lib/firebase";
// import { Errors } from "../errors/customeError.errors";

// export const firebaseAuth: RequestHandler = async (
//   req: Request,
//   _res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return next(Errors.UNAUTHORIZED("Authorization token missing"));
//   }

//   const token = authHeader.slice("Bearer ".length).trim();

//   try {
//     const decodedToken: DecodedIdToken = await admin
//       .auth()
//       .verifyIdToken(token);
//     req.user = decodedToken;
//     next();
//   } catch (error) {
//     next(Errors.UNAUTHORIZED("Invalid or expired Firebase token"));
//   }
// };
import { Request, Response, NextFunction, RequestHandler } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import admin from "../lib/firebase";
import { Errors } from "../errors/customeError.errors";

export const firebaseAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      Errors.UNAUTHORIZED({
        code: "AUTH_HEADER_MISSING",
        message: "Authorization token missing",
      })
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decodedToken: DecodedIdToken = await admin
      .auth()
      .verifyIdToken(token);

    req.user = decodedToken;
    return next();
  } catch (error) {
    return next(
      Errors.UNAUTHORIZED({
        code: "FIREBASE_TOKEN_INVALID",
        message: "Invalid or expired Firebase token",
      })
    );
  }
};