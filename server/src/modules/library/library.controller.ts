import { Request, Response, NextFunction } from "express";
import { Errors } from "../../core/errors/customeError.errors";
import { sendSuccess } from "../../core/utils/responseHelper";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
import * as listLibraryService from "./library.service";
import {
  approvalSchemaResponse,
  deleteListsResponse,
  deleteListsSchema,
  favouriteListsResponse,
  libraryResponseSchema,
} from "../../dto/library.dto";

export const getListsLibrary = asyncHandler(
  async (req: Request, res: Response) => {
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

    const { tab = "Recent", sort = "Date" } = req.query as {
      tab?: string;
      sort?: string;
    };

    const response = await listLibraryService.getListLibraryService({
      id,
      tab,
      sort,
    });
    return sendSuccess(
      res,
      libraryResponseSchema,
      response,
      "User profile fetched successfully",
      200,
    );
  },
);

export const deleteLists = asyncHandler(async (req: Request, res: Response) => {
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

  const { listId } = req.body as { listId: string[] };

  // ✅ FIX: throw instead of next()
  if (!listId || !Array.isArray(listId) || listId.length === 0) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_LIST_IDS",
      message: "List ids are required",
    });
  }

  const response = await listLibraryService.deleteListsService({
    id,
    listId,
  });

  // ✅ FIX: use same response helper
  return sendSuccess(
    res,
    deleteListsResponse,
    response,
    "Lists deleted successfully",
    200,
  );
});

export const updateFavouriteLists = asyncHandler(
  async (req: Request, res: Response) => {
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

    const { listId } = req.body as { listId: string };

    const response = await listLibraryService.toggleFavouriteService({
      id,
      listId,
    });

    return sendSuccess(
      res,
      favouriteListsResponse,
      response,
      "Lists updated successfully",
      200,
    );
  },
);

export const updateApprovalLists = asyncHandler(
  async (req: Request, res: Response) => {
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

    const { listId, isApproved } = req.body as {
      listId: string;
      isApproved: boolean;
    };

    const response = await listLibraryService.updateApprovalService({
      id,
      listId,
      isApproved,
    });

    return sendSuccess(
      res,
      approvalSchemaResponse,
      response,
      "Lists updated successfully",
      200,
    );
  },
);
