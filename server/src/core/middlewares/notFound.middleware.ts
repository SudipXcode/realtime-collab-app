import { Request, Response, NextFunction } from "express";
import { Errors } from "../errors/customeError.errors";

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(
    Errors.NOT_FOUND({
      code: "ROUTE_NOT_FOUND",
      message: "Route not found",
      details: {
        method: req.method,
        url: req.originalUrl,
      },
    })
  );
};