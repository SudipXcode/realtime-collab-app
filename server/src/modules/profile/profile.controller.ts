import { z } from "zod";
import { Request, Response, RequestHandler } from "express";
import {
  UserProfileResponseSchema,
  UserProfileResponseDTO,
  UserProfileUpdateSchema,
} from "../../dto/profile.dto";
import * as profileService from "./profile.service";
import { Errors } from "../../core/errors/customeError.errors";
import { sendSuccess } from "../../core/utils/responseHelper";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
import { clearAuthCookies } from "../../core/utils/authCookie";

const EmptyResponseSchema = z.object({});
export const getProfile: RequestHandler = asyncHandler(
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

    const profile = await profileService.getProfileService(id);

    const response: UserProfileResponseDTO = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      providers: profile.providers,
      isPro: profile.isPro,
      proExpiresAt: profile.proExpiresAt,
    };

    return sendSuccess(
      res,
      UserProfileResponseSchema,
      response,
      "User profile fetched successfully",
      200,
    );
  },
);

export const updateProfile: RequestHandler = asyncHandler(
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
    const parsed = UserProfileUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw Errors.VALIDATION({
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: parsed.error.flatten(),
      });
    }

    const { name } = parsed.data;
    const file = req.file as Express.Multer.File | undefined;

    /* ================= NOTHING CHECK ================= */
    if (name === undefined && !file) {
      throw Errors.BAD_REQUEST({
        code: "NOTHING_TO_UPDATE",
        message: "Nothing to update",
      });
    }

    /* ================= HANDLE FILE ================= */
    let imageUrl: string | undefined;
    let newPublicId: string | undefined;

    if (file) {
      imageUrl = file.path; // Cloudinary URL
      newPublicId = file.filename; // Cloudinary public_id
    }

    /* ================= SERVICE ================= */
    const updatedUser = await profileService.updateProfileService({
      id,
      name,
      imageUrl,
      pictureId: newPublicId,
    });

    /* ================= RESPONSE ================= */
    const result: UserProfileResponseDTO = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      picture: updatedUser.picture,
      providers: updatedUser.providers,
      isPro: updatedUser.isPro,
      proExpiresAt: updatedUser.proExpiresAt,
    };

    return sendSuccess(
      res,
      UserProfileResponseSchema, // ✅ correct schema
      result,
      "Profile updated successfully", // ✅ correct message
      200,
    );
  },
);

export const deleteAccount: RequestHandler = asyncHandler(
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

    await profileService.deleteAccountService(id);

    // 🔥 clear cookies after deletion
    clearAuthCookies(res);

    return sendSuccess(
      res,
      EmptyResponseSchema,
      {}, // empty payload
      "Your account deleted successfully",
      200,
    );
  },
);
