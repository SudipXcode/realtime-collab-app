import { AppError } from "./appError.errors";

type ErrorInput = {
  code: string;
  message: string;
  details?: Record<string, any>;
};

export const Errors = {
  BAD_REQUEST: ({ code, message, details }: ErrorInput) =>
    new AppError(message, 400, code, details),

  UNAUTHORIZED: ({ code, message, details }: ErrorInput) =>
    new AppError(message, 401, code, details),

  FORBIDDEN: ({ code, message, details }: ErrorInput) =>
    new AppError(message, 403, code, details),

  NOT_FOUND: ({ code, message, details }: ErrorInput) =>
    new AppError(message, 404, code, details),

  CONFLICT: ({ code, message, details }: ErrorInput) =>
    new AppError(message, 409, code, details),

  VALIDATION: ({ code, message, details }: ErrorInput) =>
    new AppError(message, 422, code, details),

  INTERNAL: ({ code, message, details }: ErrorInput) =>
    new AppError(message, 500, code, details),
};