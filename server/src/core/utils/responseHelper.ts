// import { Response } from "express";
// import { ZodSchema } from "zod";
// import { successResponse, errorResponse } from "./response";

// export const sendSuccess = <T>(
//   res: Response,
//   schema: ZodSchema<T>, // 🔥 enforce response shape
//   data: T,
//   message = "Success",
//   statusCode = 200
// ) => {
//   const validated = schema.parse(data); // 🔥 response validation

//   return res
//     .status(statusCode)
//     .json(successResponse(validated, message, statusCode));
// };

// export const sendError = (
//   res: Response,
//   message = "Something went wrong",
//   statusCode = 500,
//   errorCode?: string,
//   details?: unknown
// ) => {
//   return res
//     .status(statusCode)
//     .json(errorResponse(message, statusCode, errorCode, details));
// };
import { Response } from "express";
import { ZodSchema } from "zod";
import { successResponse, errorResponse } from "./response";

/* ================= SUCCESS ================= */

export const sendSuccess = <T>(
  res: Response,
  schema: ZodSchema<T>,
  data: T,
  message = "Success",
  statusCode = 200
) => {
  const validated = schema.parse(data);

  return res.status(statusCode).json(
    successResponse(validated, message)
  );
};

/* ================= ERROR ================= */

export const sendError = (
  res: Response,
  {
    code,
    message,
    statusCode = 500,
    details,
  }: {
    code: string;
    message: string;
    statusCode?: number;
    details?: unknown;
  }
) => {
  return res.status(statusCode).json(
    errorResponse(code, message, details)
  );
};