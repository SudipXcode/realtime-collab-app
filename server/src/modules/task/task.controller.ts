import { Request, RequestHandler, Response } from "express";
import { Errors } from "../../core/errors/customeError.errors";
import { sendSuccess } from "../../core/utils/responseHelper";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
import * as taskService from "./task.service";
import {
  taskMoveSchema,
  taskResponseSchema,
  taskUpdateSchema,
} from "../../dto/task.dto";
import z from "zod";
import { listDetailResponseSchema } from "../../validation/listvalidation";
const EmptyResponseSchema = z.object({});

export const postTask: RequestHandler = asyncHandler(
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

    const response = await taskService.createTaskService(id, req.body);

    return sendSuccess(
      res,
      taskResponseSchema,
      response,
      "Task posted successfully",
      201,
    );
  },
);

export const updateTask: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const authPayload = req.auth;

    if (!authPayload) {
      throw Errors.UNAUTHORIZED({
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
    }

    const userId = authPayload.id as string;

    if (!userId) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_USER_ID",
        message: "Invalid user id in token",
      });
    }
    const parsed = taskUpdateSchema.safeParse(req.body);
    const { id } = req.params as { id: string };

    if (!parsed.success) {
      throw Errors.VALIDATION({
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: parsed.error.flatten(),
      });
    }
    const result = await taskService.updateTaskService(id, userId, parsed.data);
    return sendSuccess(
      res,
      taskResponseSchema, // ✅ correct schema
      result,
      "task updated successfully", // ✅ correct message
      200,
    );
  },
);

export const moveTask: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const authPayload = req.auth;

    if (!authPayload) {
      throw Errors.UNAUTHORIZED({
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
    }

    const userId = authPayload.id as string;

    if (!userId) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_USER_ID",
        message: "Invalid user id in token",
      });
    }
    const parsed = taskMoveSchema.safeParse(req.body);
    const { id } = req.params as { id: string };

    if (!parsed.success) {
      throw Errors.VALIDATION({
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: parsed.error.flatten(),
      });
    }
    const result = await taskService.moveTaskService(id, userId, parsed.data);
    return sendSuccess(
      res,
      taskResponseSchema, // ✅ correct schema
      result,
      "task moved successfully", // ✅ correct message
      200,
    );
  },
);

export const deleteTask: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const authPayload = req.auth;

    if (!authPayload) {
      throw Errors.UNAUTHORIZED({
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
    }

    const userId = authPayload.id as string;

    if (!userId) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_USER_ID",
        message: "Invalid user id in token",
      });
    }

    const { listId, id } = req.params as {
      listId: string;
      id: string;
    };

    await taskService.deleteTaskService(id, listId, userId);

    return sendSuccess(
      res,
      EmptyResponseSchema,
      {},
      "Task deleted successfully",
      200,
    );
  },
);

export const todayTask: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const authPayload = req.auth;

    if (!authPayload) {
      throw Errors.UNAUTHORIZED({
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
    }

    const userId = authPayload.id as string;

    if (!userId) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_USER_ID",
        message: "Invalid user id in token",
      });
    }

    const result = await taskService.todayTaskService(userId);

    return sendSuccess(
      res,
      listDetailResponseSchema.array(),
      result,
      "Today task fetch successfully",
      200,
    );
  },
);

export const inboxTask: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const authPayload = req.auth;

    if (!authPayload) {
      throw Errors.UNAUTHORIZED({
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
    }

    const userId = authPayload.id as string;

    if (!userId) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_USER_ID",
        message: "Invalid user id in token",
      });
    }

    const result = await taskService.inboxTaskService(userId);

    return sendSuccess(
      res,
      listDetailResponseSchema.array(),
      result,
      "Today task fetch successfully",
      200,
    );
  },
);

export const postInboxTask: RequestHandler = asyncHandler(
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

    const response = await taskService.createInboxTaskService(id, req.body);

    return sendSuccess(
      res,
      taskResponseSchema,
      response,
      "Inbox task posted successfully",
      201,
    );
  },
);
