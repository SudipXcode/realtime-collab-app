import { Request, Response, NextFunction } from "express";
import { Errors } from "../errors/customeError.errors";

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(
    Errors.NOT_FOUND("Route not found", {
      method: req.method,
      url: req.originalUrl,
    })
  );
};