
// import { Request, Response, NextFunction } from "express";
// import { AppError } from "../errors/appError.errors";

// export const errorMiddleware = (
//   err: Error | AppError,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const isAppError = err instanceof AppError;
//   const isDev = process.env.NODE_ENV === "development";

//   const statusCode = isAppError ? err.statusCode : 500;

//   // -----------------------------
//   // 🔐 SAFE MESSAGE HANDLING
//   // -----------------------------
//   const message = isAppError
//     ? err.message
//     : isDev
//     ? err.message
//     : "Internal Server Error";

//   // -----------------------------
//   // 🧾 ERROR CODE
//   // -----------------------------
//   const code = isAppError ? err.errorCode : "INTERNAL_ERROR";

//   // -----------------------------
//   // 🪵 LOGGING (ALWAYS FULL)
//   // -----------------------------
//   console.error("🔥 Error:", {
//     message: err.message,
//     stack: err.stack,
//     route: req.originalUrl,
//     method: req.method,
//   });

//   // -----------------------------
//   // 🚫 RESPONSE (SANITIZED)
//   // -----------------------------
//   res.status(statusCode).json({
//     success: false,
//     message,
//     code,
//     errors: isAppError ? err.details || null : null,

//     // only expose stack in development
//     ...(isDev && {
//       stack: err.stack,
//     }),
//   });
// };

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.errors";

const sendDevError = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: err.toJSON(),
    stack: err.stack,
  });
};

const sendProdError = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.toJSON(),
    });
  } else {
    console.error("💥 UNEXPECTED ERROR:", err);

    res.status(500).json({
      success: false,
      error: {
        message: "Something went wrong",
        errorCode: "INTERNAL_ERROR",
      },
    });
  }
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Unknown error",
      500,
      "INTERNAL_ERROR",
      {},
      false
    );
  }

  if (process.env.NODE_ENV === "development") {
    return sendDevError(error, res);
  } else {
    return sendProdError(error, res);
  }
};