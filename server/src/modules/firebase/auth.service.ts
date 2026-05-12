

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
