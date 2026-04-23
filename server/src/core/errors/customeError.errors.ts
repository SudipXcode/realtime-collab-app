// // src/core/errors/customeError.errors.ts
// import { AppError } from "./appError.errors";

// export const Errors = {
//   BAD_REQUEST: (msg = "Bad request", details?: unknown) =>
//     new AppError(msg, 400, "BAD_REQUEST", details),

//   // 🔥 IMPORTANT FIX
//   UNAUTHORIZED: (code = "UNAUTHORIZED", details?: unknown) =>
//     new AppError(code, 401, code, details),

//   FORBIDDEN: (msg = "Forbidden") =>
//     new AppError(msg, 403, "FORBIDDEN"),

//   NOT_FOUND: (msg = "Resource not found") =>
//     new AppError(msg, 404, "NOT_FOUND"),

//   CONFLICT: (msg = "Conflict") =>
//     new AppError(msg, 409, "CONFLICT"),

//   INTERNAL: (msg = "Internal server error") =>
//     new AppError(msg, 500, "INTERNAL_ERROR"),
// };
import { AppError } from "./appError.errors";

export const Errors = {
  BAD_REQUEST: (msg = "Bad request", details?: Record<string, any>) =>
    new AppError(msg, 400, "BAD_REQUEST", details),

  UNAUTHORIZED: (msg = "Unauthorized", details?: Record<string, any>) =>
    new AppError(msg, 401, "UNAUTHORIZED", details),

  FORBIDDEN: (msg = "Forbidden", details?: Record<string, any>) =>
    new AppError(msg, 403, "FORBIDDEN", details),

  NOT_FOUND: (msg = "Resource not found", details?: Record<string, any>) =>
    new AppError(msg, 404, "NOT_FOUND", details),

  CONFLICT: (msg = "Conflict", details?: Record<string, any>) =>
    new AppError(msg, 409, "CONFLICT", details),

  VALIDATION: (msg = "Validation error", details?: Record<string, any>) =>
    new AppError(msg, 422, "VALIDATION_ERROR", details),

  INTERNAL: (msg = "Internal server error", details?: Record<string, any>) =>
    new AppError(msg, 500, "INTERNAL_ERROR", details),
};