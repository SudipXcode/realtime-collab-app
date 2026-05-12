// import { z } from "zod";
// import { Request, Response, NextFunction, RequestHandler } from "express";
// import { LoginResponseSchema, LoginResponseDTO } from "../../dto/auth.dto";
// import * as authService from "./auth.service";
// import { setAuthCookies, clearAuthCookies } from "../../core/utils/authCookie";
// import { Errors } from "../../core/errors/customeError.errors";
// import { sendSuccess } from "../../core/utils/responseHelper";
// import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
// import { mapFirebaseProvider } from "../../core/utils/providerMapper";

// export const login: RequestHandler = asyncHandler(
//   async (req: Request, res: Response) => {
//     if (!req.user) {
//       throw Errors.UNAUTHORIZED({
//         code: "UNAUTHORIZED",
//         message: "Authentication required",
//       });
//     }

//     const firebase = req.user.firebase;
//     const rawProvider = firebase?.sign_in_provider;

//     if (!rawProvider || rawProvider === "password") {
//       throw Errors.BAD_REQUEST({
//         code: "OAUTH_PROVIDER_REQUIRED",
//         message: "OAuth provider is required",
//       });
//     }

//     const provider = mapFirebaseProvider(rawProvider);

//     const providerId = firebase.identities?.[rawProvider]?.[0];
//     if (!providerId) {
//       throw Errors.BAD_REQUEST({
//         code: "OAUTH_PROVIDER_REQUIRED",
//         message: "Provider identity missing",
//       });
//     }

//     const result = await authService.loginService({
//       id: req.user.uid,
//       name: req.user.name,
//       email: req.user.email,
//       provider,
//       providerId,
//       picture: req.user.picture,
//     });

//     setAuthCookies(res, result.accessToken, result.refreshToken);

//     const response: LoginResponseDTO = {
//       id: result.id,
//       email: result.email,
//     };

//     return sendSuccess(
//       res,
//       LoginResponseSchema,
//       response,
//       "User login successful",
//       200,
//     );
//   },
// );
// // export const logout = asyncHandler(
// //   async (req: Request, res: Response): Promise<void> => {
// //     const refreshToken = req.cookies?.refreshToken;
// //     const authPayload = req.auth;

// //     // ✅ Always clear cookies
// //     clearAuthCookies(res);

// //     // ✅ If missing → still success (idempotent logout)
// //     if (!refreshToken || !authPayload) {
// //       res.status(200).json(successResponse(null, "User logged out", 200));
// //       return;
// //     }

// //     const id = authPayload.id as string;

// //     if (id) {
// //       await authService.logoutService(refreshToken, id);
// //     }

// //     res.status(200).json(successResponse(null, "User logged out", 200));
// //   },
// // );
// export const logout: RequestHandler = asyncHandler(
//   async (req: Request, res: Response) => {
//     const refreshToken = req.cookies?.refreshToken;
//     const authPayload = req.auth;

//     clearAuthCookies(res);

//     if (refreshToken && authPayload?.id) {
//       await authService.logoutService(refreshToken, authPayload.id);
//     }

//     return sendSuccess(res, z.null(), null, "User logged out");
//   },
// );
// // export const refreshToken: RequestHandler = async (
// //   req: Request,
// //   res: Response,
// //   next: NextFunction,
// // ): Promise<void> => {
// //   const token = req.cookies?.refreshToken;
// //   const authPayload = req.auth;

// //   // ✅ validate input
// //   if (!token || !authPayload?.id) {
// //     clearAuthCookies(res);
// //     return next(Errors.UNAUTHORIZED("Authentication required"));
// //   }

// //   const id = authPayload.id as string; // ✅ UUID string

// //   try {
// //     const result = await authService.refreshTokenService(token, id);

// //     // ✅ set new tokens
// //     setAuthCookies(res, result.accessToken, result.refreshToken);

// //     res
// //       .status(200)
// //       .json(successResponse(null, "Token refreshed successfully", 200));
// //   } catch (error) {
// //     // ✅ revoke session on failure
// //     clearAuthCookies(res);
// //     return next(error);
// //   }
// // };
// export const refreshToken: RequestHandler = asyncHandler(
//   async (req: Request, res: Response) => {
//     try {
//       const token = req.cookies?.refreshToken;
//       const authPayload = req.auth;

//       if (!token || !authPayload?.id) {
//         clearAuthCookies(res);
//         throw Errors.UNAUTHORIZED({
//           code: "AUTHENTICATION_REQUIRED",
//           message: "Authentication required",
//         });
//       }

//       const result = await authService.refreshTokenService(
//         token,
//         authPayload.id,
//       );

//       setAuthCookies(res, result.accessToken, result.refreshToken);

//       return sendSuccess(res, z.null(), null, "Token refreshed successfully");
//     } catch (err) {
//       clearAuthCookies(res);
//       throw err; // important: still pass to error handler
//     }
//   },
// );
import { z } from "zod";
import { Request, Response, RequestHandler } from "express";
import { LoginResponseSchema, LoginResponseDTO } from "../../dto/auth.dto";
import * as authService from "./auth.service";
import { setAuthCookies, clearAuthCookies } from "../../core/utils/authCookie";
import { Errors } from "../../core/errors/customeError.errors";
import { sendSuccess } from "../../core/utils/responseHelper";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
import { mapFirebaseProvider } from "../../core/utils/providerMapper";

export const login: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw Errors.UNAUTHORIZED({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const firebase = req.user.firebase;
    const rawProvider = firebase?.sign_in_provider;

    if (!rawProvider || rawProvider === "password") {
      throw Errors.BAD_REQUEST({
        code: "OAUTH_PROVIDER_REQUIRED",
        message: "OAuth provider is required",
      });
    }

    const provider = mapFirebaseProvider(rawProvider);

    const providerId = firebase.identities?.[rawProvider]?.[0];
    if (!providerId) {
      throw Errors.BAD_REQUEST({
        code: "OAUTH_PROVIDER_REQUIRED",
        message: "Provider identity missing",
      });
    }

    const result = await authService.loginService({
      id: req.user.uid,
      name: req.user.name,
      email: req.user.email,
      provider,
      providerId,
      picture: req.user.picture,
    });

    setAuthCookies(res, result.accessToken, result.refreshToken);

    const response: LoginResponseDTO = {
      id: result.id,
      email: result.email,
    };

    return sendSuccess(
      res,
      LoginResponseSchema,
      response,
      "User login successful",
      200
    );
  }
);

export const logout: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    const authPayload = req.auth;

    clearAuthCookies(res);

    if (refreshToken && authPayload?.id) {
      await authService.logoutService(refreshToken, authPayload.id);
    }

    return sendSuccess(res, z.null(), null, "User logged out");
  }
);

export const refreshToken: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.refreshToken;
      const authPayload = req.auth;

      if (!token || !authPayload?.id) {
        clearAuthCookies(res);
        throw Errors.UNAUTHORIZED({
          code: "AUTHENTICATION_REQUIRED",
          message: "Authentication required",
        });
      }

      const result = await authService.refreshTokenService(
        token,
        authPayload.id
      );

      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(res, z.null(), null, "Token refreshed successfully");
    } catch (err) {
      clearAuthCookies(res);
      throw err;
    }
  }
);