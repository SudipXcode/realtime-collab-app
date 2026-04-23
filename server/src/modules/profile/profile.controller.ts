import { Request, Response, RequestHandler } from "express";
import {
  UserProfileResponseSchema,
  UserProfileResponseDTO,
} from "../../dto/profile.dto";
import * as profileService from "./profile.service";
import { Errors } from "../../core/errors/customeError.errors";
import { sendSuccess } from "../../core/utils/responseHelper";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";

export const getProfile: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const authPayload = req.auth;

    if (!authPayload) {
      throw Errors.UNAUTHORIZED("Authentication required");
    }

    const id = authPayload.id as string;

    if (!id) {
      throw Errors.BAD_REQUEST("Invalid user id in token");
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

// export const updateProfile = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const authPayload = req.auth;

//     if (!authPayload) {
//       return next(Errors.UNAUTHORIZED("Authentication required"));
//     }

//     const id = authPayload.id as string;

//     if (!id) {
//       return next(Errors.BAD_REQUEST("Invalid user id in token"));
//     }

//     const { name } = req.body;
//     const file = req.file as Express.Multer.File | undefined;

//     let imageUrl: string | undefined;
//     let newPublicId: string | undefined;

//     if (file) {
//       imageUrl = file.path;
//       newPublicId = file.filename;
//     }

//     try {
//       // ✅ ONLY call service
//       const updatedUser = await profileService.updateProfileService({
//         id,
//         name,
//         imageUrl,
//         pictureId: newPublicId,
//       });

//       res
//         .status(200)
//         .json(
//           successResponse(updatedUser, "Profile updated successfully", 200),
//         );
//     } catch (error) {
//       // ✅ ONLY cleanup new uploaded image if something fails
//       if (newPublicId) {
//         try {
//           await cloudinary.uploader.destroy(newPublicId);
//         } catch (cleanupError) {
//           console.error("Failed to delete orphan image:", cleanupError);
//         }
//       }

//       return next(error);
//     }
//   },
// );

// export const deleteAccount = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const authPayload = req.auth;
//     if (!authPayload) {
//       return next(Errors.UNAUTHORIZED("Authentication required"));
//     }
//     const id = authPayload.id as string;
//     if (!id) {
//       return next(Errors.BAD_REQUEST("Invalid user id in token"));
//     }
//     await profileService.deleteAccountService(id);

//     clearAuthCookies(res);
//     res
//       .status(200)
//       .set("Cache-Control", "no-store, private") // no caching
//       .json(successResponse({}, "your account deleted successfully", 200));
//   },
// );
