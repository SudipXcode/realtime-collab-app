import { Request, Response } from "express";
import { Errors } from "../../core/errors/customeError.errors";
import { sendSuccess } from "../../core/utils/responseHelper";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
import * as listService from "./lists.service";
import {
  addMemberSchema,
  listDetailResponseSchema,
  ListResponseDTO,
  ListResponseSchema,
} from "../../dto/lists.dto";

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

export const getSingleList = asyncHandler(
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

    const { listId } = req.params as { listId: string };

    const response = await listService.listDetailsService(id, listId);

    return sendSuccess(
      res,
      listDetailResponseSchema,
      response,
      "Lists fetched successfully",
      200,
    );
  },
);

export const updateListsMembers = asyncHandler(
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
    const { listId, memberId } = req.body;

    const response = await listService.addMemberService(listId, memberId, id);

    return sendSuccess(
      res,
      addMemberSchema,
      response,
      "Memebr added successfully",
      201,
    );
  },
);

export const deleteMember = asyncHandler(
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

    const { listId, memberId } = req.params as {
      listId: string;
      memberId: string;
    };

    const response = await listService.memberDeleteService(
      listId,
      memberId,
      id,
    );

    return sendSuccess(
      res,
      addMemberSchema,
      response,
      "Memebr added successfully",
      201,
    );
  },
);
