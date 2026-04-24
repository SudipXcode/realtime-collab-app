
// import { Request, Response, NextFunction } from "express";
// import { AppError } from "../errors/appError.errors";
// import { sendError } from "../utils/responseHelper";

// export const globalErrorHandler = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let error = err;

//   // 🔥 Normalize unknown errors
//   if (!(error instanceof AppError)) {
//     error = new AppError(
//       error.message || "Unknown error",
//       500,
//       "INTERNAL_ERROR",
//       {},
//       false
//     );
//   }

//   const isDev = process.env.NODE_ENV === "development";

//   // 🔥 DEV: full details
//   if (isDev) {
//     return sendError(
//       res,
//       error.message,
//       error.statusCode,
//       error.errorCode,
//       {
//         ...error.details,
//         stack: error.stack,
//       }
//     );
//   }

//   // 🔥 PROD: safe errors only
//   if (error.isOperational) {
//     return sendError(
//       res,
//       error.message,
//       error.statusCode,
//       error.errorCode,
//       error.details
//     );
//   }

//   // 🔥 Unknown crash (hide details)
//   console.error("💥 UNEXPECTED ERROR:", error);

//   return sendError(
//     res,
//     "Something went wrong",
//     500,
//     "INTERNAL_ERROR"
//   );
// };

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.errors";
import { sendError } from "../utils/responseHelper";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Normalize unknown errors
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Unknown error",
      500,
      "INTERNAL_ERROR",
      {},
      false
    );
  }

  const isDev = process.env.NODE_ENV === "development";

  // DEV: full details
  if (isDev) {
    return sendError(res, {
      code: error.errorCode || "INTERNAL_ERROR",
      message: error.message,
      statusCode: error.statusCode,
      details: {
        ...error.details,
        stack: error.stack,
      },
    });
  }

  // PROD: operational errors
  if (error.isOperational) {
    return sendError(res, {
      code: error.errorCode || "INTERNAL_ERROR",
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });
  }

  // PROD: unknown crash
  console.error("💥 UNEXPECTED ERROR:", error);

  return sendError(res, {
    code: "INTERNAL_ERROR",
    message: "Something went wrong",
    statusCode: 500,
  });
};