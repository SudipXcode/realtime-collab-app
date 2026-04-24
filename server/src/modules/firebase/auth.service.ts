// import { prisma } from "../../core/lib/prisma";
// import { AuthProvider, Prisma } from "@prisma/client";
// import {
//   generateAccessToken,
//   generateRefreshToken,
// } from "../../core/utils/jwt";
// import { LoginServiceInputDTO, RefreshTokenResult } from "../../dto/auth.dto";
// import { Errors } from "../../core/errors/customeError.errors";

// // export const login = async (input: LoginServiceInputDTO) => {
// //   const { id, email, name, provider, providerId, picture } = input;

// //   if (!email) {
// //     throw Errors.BAD_REQUEST("Email not found in authentication token");
// //   }

// //   const user = await prisma.$transaction(
// //     async (tx: Prisma.TransactionClient) => {
// //       const existingUser = await tx.user.findUnique({
// //         where: { email },
// //       });

// //       const userRecord = await tx.user.upsert({
// //         where: { email },
// //         update: {
// //           name: name ?? undefined,
// //           picture: existingUser?.picture ?? picture ?? undefined, // 🔥 key logic
// //         },
// //         create: {
// //           email,
// //           name: name ?? email.split("@")[0],
// //           picture: picture ?? undefined, // ✅ save on first login
// //         },
// //       });

// //       await tx.account.upsert({
// //         where: {
// //           provider_providerId: {
// //             provider: provider as AuthProvider,
// //             providerId: providerId ?? id,
// //           },
// //         },
// //         update: {
// //           firebaseId: id,
// //         },
// //         create: {
// //           firebaseId: id,
// //           provider: provider as AuthProvider,
// //           providerId: providerId ?? id,
// //           userId: userRecord.id,
// //         },
// //       });

// //       return userRecord;
// //     },
// //   );

// //   const accessToken = generateAccessToken(user.id, user.email);
// //   const refreshToken = generateRefreshToken(user.id, user.email);

// //   await prisma.refreshToken.create({
// //     data: {
// //       token: refreshToken,
// //       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
// //       userId: user.id,
// //     },
// //   });

// //   return {
// //     id: user.id,
// //     email: user.email,
// //     picture: user.picture, // optional return
// //     accessToken,
// //     refreshToken,
// //   };
// // };
// import { RequestHandler } from "express";
// import { LoginResponseSchema } from "../../dto/auth.dto";
// import * as authService from "./auth.service";
// import { setAuthCookies, clearAuthCookies } from "../../core/utils/authCookie";
// import { Errors } from "../../core/errors/customeError.errors";
// import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
// import { mapFirebaseProvider } from "../../core/utils/providerMapper";
// import { sendSuccess } from "../../core/utils/sendResponse";

// export const login: RequestHandler = asyncHandler(async (req, res) => {
//   if (!req.user) {
//     throw Errors.UNAUTHORIZED("Authenticated user not found");
//   }

//   const firebase = req.user.firebase;
//   const rawProvider = firebase?.sign_in_provider;

//   if (!rawProvider || rawProvider === "password") {
//     throw Errors.BAD_REQUEST("OAuth provider required");
//   }

//   const provider = mapFirebaseProvider(rawProvider);

//   const providerId = firebase.identities?.[rawProvider]?.[0];
//   if (!providerId) {
//     throw Errors.BAD_REQUEST("Provider identity missing");
//   }

//   const result = await authService.login({
//     id: req.user.uid,
//     name: req.user.name ?? "",
//     email: req.user.email ?? null,
//     provider,
//     providerId,
//     picture: req.user.picture ?? null,
//   });

//   setAuthCookies(res, result.accessToken, result.refreshToken);

//   // 🔥 ONLY SEND VALIDATED RESPONSE
//   return sendSuccess(
//     res,
//     LoginResponseSchema,
//     {
//       id: result.id,
//       email: result.email,
//     },
//     "User login successful"
//   );
// });

// export const logoutService = async (
//   refreshToken: string,
//   id: string,
// ): Promise<void> => {
//   await prisma.refreshToken.deleteMany({
//     where: {
//       token: refreshToken,
//       userId: id,
//     },
//   });
// };

// export const refreshTokenService = async (
//   refreshToken: string,
//   userId: string,
// ): Promise<RefreshTokenResult> => {
//   // 🔍 1. Find token (strict match)
//   const dbToken = await prisma.refreshToken.findUnique({
//     where: { token: refreshToken },
//   });

//   // ❌ Token not found → possible reuse attack
//   if (!dbToken || dbToken.userId !== userId) {
//     throw Errors.UNAUTHORIZED("REFRESH_TOKEN_INVALID");
//   }

//   // ⏰ 2. Check expiry
//   if (dbToken.expiresAt < new Date()) {
//     await prisma.refreshToken.delete({
//       where: { token: refreshToken },
//     });

//     throw Errors.UNAUTHORIZED("REFRESH_TOKEN_EXPIRED");
//   }

//   // 👤 3. Get user (minimal fields)
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       email: true,
//     },
//   });

//   if (!user) {
//     throw Errors.UNAUTHORIZED("REFRESH_TOKEN_INVALID");
//   }

//   // 🔐 4. Generate new tokens
//   const newAccessToken = generateAccessToken(user.id, user.email);
//   const newRefreshToken = generateRefreshToken(user.id, user.email);

//   // 🔁 5. Rotate refresh token (atomic)
//   await prisma.$transaction([
//     prisma.refreshToken.delete({
//       where: { token: refreshToken },
//     }),
//     prisma.refreshToken.create({
//       data: {
//         token: newRefreshToken,
//         userId: user.id,
//         expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       },
//     }),
//   ]);

//   return {
//     accessToken: newAccessToken,
//     refreshToken: newRefreshToken,
//   };
// };

import { RequestHandler } from "express";
import { prisma } from "../../core/lib/prisma";
import { AuthProvider, Prisma } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../core/utils/jwt";
import {
  loginRequestDTO,
  LoginResultDTO,
  RefreshTokenResultDTO,
} from "../../dto/auth.dto";
import { Errors } from "../../core/errors/customeError.errors";
import { setAuthCookies } from "../../core/utils/authCookie";
import { z } from "zod";

export const loginService = async (
  input: loginRequestDTO,
): Promise<LoginResultDTO> => {
  const { id, email, name, provider, providerId, picture } = input;

  if (!email) {
    throw Errors.BAD_REQUEST({
      code: "EMAIL_MISSING",
      message: "Email not found in authentication token",
    });
  }

  const user = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      const userRecord = await tx.user.upsert({
        where: { email },
        update: {
          name: name ?? undefined,
          picture: existingUser?.picture ?? picture ?? undefined,
        },
        create: {
          email,
          name: name ?? email.split("@")[0],
          picture: picture ?? undefined,
        },
      });

      await tx.account.upsert({
        where: {
          provider_providerId: {
            provider: provider as AuthProvider,
            providerId: providerId ?? id,
          },
        },
        update: {
          firebaseId: id,
        },
        create: {
          firebaseId: id,
          provider: provider as AuthProvider,
          providerId: providerId ?? id,
          userId: userRecord.id,
        },
      });

      return userRecord;
    },
  );

  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, user.email);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: user.id,
    },
  });

  return {
    id: user.id,
    email: user.email,
    accessToken,
    refreshToken,
  };
};

export const logoutService = async (
  refreshToken: string,
  userId: string,
): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: {
      token: refreshToken,
      userId,
    },
  });
};

export const refreshTokenService = async (
  refreshToken: string,
  userId: string,
): Promise<RefreshTokenResultDTO> => {
  const dbToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!dbToken || dbToken.userId !== userId) {
    throw Errors.UNAUTHORIZED({
      code: "REFRESH_TOKEN_INVALID",
      message: "Invalid refresh token",
    });
  }

  if (dbToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
    throw Errors.UNAUTHORIZED({
      code: "REFRESH_TOKEN_EXPIRED",
      message: "Refresh token expired",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw Errors.UNAUTHORIZED({
      code: "REFRESH_TOKEN_INVALID",
      message: "Invalid refresh token",
    });
  }

  const newAccessToken = generateAccessToken(user.id, user.email);
  const newRefreshToken = generateRefreshToken(user.id, user.email);

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { token: refreshToken } }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
