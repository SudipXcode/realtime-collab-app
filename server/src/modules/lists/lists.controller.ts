import { Request, Response } from "express";
import { Errors } from "../../core/errors/customeError.errors";
import { sendSuccess } from "../../core/utils/responseHelper";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
import * as listService from "./lists.service";
import { ListResponseDTO, ListResponseSchema } from "../../dto/lists.dto";

export const postList = asyncHandler(async (req: Request, res: Response) => {
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
  const list = await listService.createListService(id, req.body);

  const response: ListResponseDTO = {
    id: list.id,
    name: list.name,
    type: list.type.toLowerCase() as any,
    color: list.color ?? "#4772FA",
  };

  return sendSuccess(
    res,
    ListResponseSchema,
    response,
    "User profile fetched successfully",
    201,
  );
});

export const getLists = asyncHandler(async (req: Request, res: Response) => {
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
  const response = await listService.getListService(id);

  return sendSuccess(
    res,
    ListResponseSchema.array(), // ✅ correct
    response,
    "Lists fetched successfully",
    200,
  );
});
