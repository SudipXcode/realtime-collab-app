

// import crypto from "crypto";
// import { Request, Response, NextFunction } from "express";
// import { Errors } from "../errors/customeError.errors";

// /* ---------------------- GENERATE CSRF TOKEN ---------------------- */
// export const generateCsrfToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.cookies["CSRF-TOKEN"]) {
//     const token = crypto.randomUUID();

//     res.cookie("CSRF-TOKEN", token, {
//       httpOnly: false,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//     });
//   }

//   return next();
// };

// /* ---------------------- VERIFY CSRF TOKEN ---------------------- */
// export const verifyCsrfToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const csrfCookie = req.cookies["CSRF-TOKEN"];
//   const csrfHeader = req.headers["x-csrf-token"];

//   if (!csrfCookie || !csrfHeader) {
//     return next(Errors.FORBIDDEN("CSRF_INVALID"));
//   }

//   const cookieBuffer = Buffer.from(csrfCookie);
//   const headerBuffer = Buffer.from(String(csrfHeader));

//   if (cookieBuffer.length !== headerBuffer.length) {
//     return next(Errors.FORBIDDEN("CSRF_INVALID"));
//   }

//   if (!crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
//     return next(Errors.FORBIDDEN("CSRF_INVALID"));
//   }

//   return next();
// };

import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { Errors } from "../errors/customeError.errors";

/* ---------------------- GENERATE CSRF TOKEN ---------------------- */
export const generateCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.cookies["CSRF-TOKEN"]) {
    const token = crypto.randomUUID();

    res.cookie("CSRF-TOKEN", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  return next();
};

/* ---------------------- VERIFY CSRF TOKEN ---------------------- */
export const verifyCsrfToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const csrfCookie = req.cookies["CSRF-TOKEN"];
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader) {
    return next(
      Errors.FORBIDDEN({
        code: "CSRF_INVALID",
        message: "CSRF token missing or invalid",
      })
    );
  }

  const cookieBuffer = Buffer.from(csrfCookie);
  const headerBuffer = Buffer.from(String(csrfHeader));

  if (cookieBuffer.length !== headerBuffer.length) {
    return next(
      Errors.FORBIDDEN({
        code: "CSRF_INVALID",
        message: "CSRF token mismatch",
      })
    );
  }

  if (!crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
    return next(
      Errors.FORBIDDEN({
        code: "CSRF_INVALID",
        message: "CSRF token verification failed",
      })
    );
  }

  return next();
};