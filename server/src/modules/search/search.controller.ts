import { Request, Response, NextFunction, RequestHandler } from "express";
import { Errors } from "../../core/errors/customeError.errors";
import { sendSuccess } from "../../core/utils/responseHelper";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
import * as searchService from "./search.service";
import { searchMembersResult } from "../../dto/search.dto";
import { listDetailResponseSchema } from "../../dto/lists.dto";
export const searchMembers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authPayload = req.auth;

    if (!authPayload) {
      throw Errors.UNAUTHORIZED({
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
    }

    const id = authPayload.id as string;
    if (!id) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_USER_ID",
        message: "Invalid user id in token",
      });
    }
    const { query } = req.query;

    const response = await searchService.getMembers(id, query as string);

    return sendSuccess(
      res,
      searchMembersResult.array(),
      response,
      "User profile fetched successfully",
      200,
    );
  },
);

export const searchTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authPayload = req.auth;

    if (!authPayload) {
      throw Errors.UNAUTHORIZED({
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
    }

    const id = authPayload.id as string;
    if (!id) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_USER_ID",
        message: "Invalid user id in token",
      });
    }
    const { query } = req.query;

    const response = await searchService.getSearchTask(id, query as string);

    return sendSuccess(
      res,
      listDetailResponseSchema.array(),
      response,
      "User profile fetched successfully",
      200,
    );
  },
);
