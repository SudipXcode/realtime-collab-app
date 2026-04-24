import { ZodError, ZodTypeAny } from "zod";
import { clearAuthCookies } from "../utils/authCookie";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt";
import { Errors } from "../errors/customeError.errors";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const validate =
  (schema: ZodTypeAny, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          Errors.BAD_REQUEST({
            code: "VALIDATION_ERROR",
            message: "Request validation failed",
            details: { issues: error.issues },
          }),
        );
      }
      next(error);
    }
  };

export const validateRefreshToken: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return next(
      Errors.UNAUTHORIZED({
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token missing",
      }),
    );
  }

  try {
    const payload = verifyRefreshToken(token);
    req.auth = payload;
    return next();
  } catch (err: any) {
    clearAuthCookies(res);

    if (err.name === "TokenExpiredError") {
      return next(
        Errors.UNAUTHORIZED({
          code: "REFRESH_TOKEN_EXPIRED",
          message: "Refresh token expired",
        }),
      );
    }

    return next(
      Errors.UNAUTHORIZED({
        code: "REFRESH_TOKEN_INVALID",
        message: "Invalid refresh token",
      }),
    );
  }
};

export const validateAccessToken: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(
      Errors.UNAUTHORIZED({
        code: "ACCESS_TOKEN_MISSING",
        message: "Access token missing",
      }),
    );
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    return next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(
        Errors.UNAUTHORIZED({
          code: "ACCESS_TOKEN_EXPIRED",
          message: "Access token expired",
        }),
      );
    }

    return next(
      Errors.UNAUTHORIZED({
        code: "ACCESS_TOKEN_INVALID",
        message: "Invalid access token",
      }),
    );
  }
};
