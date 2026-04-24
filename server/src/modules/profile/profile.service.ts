import { prisma } from "../../core/lib/prisma";
import { Prisma, SubscriptionPlan } from "@prisma/client";
import admin from "../../core/lib/firebase"; // ✅ your existing setup
import { Errors } from "../../core/errors/customeError.errors";
import { UserProfileResponseDTO } from "../../dto/profile.dto";
import cloudinary from "../../core/lib/cloudinary";

/* ================= GET PROFILE ================= */

export const getProfileService = async (
  id: string,
): Promise<UserProfileResponseDTO> => {
  if (!id) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      accounts: {
        select: {
          provider: true,
        },
      },
      subscriptions: {
        where: {
          plan: SubscriptionPlan.PRO,
          endDate: {
            gt: new Date(), // ✅ only active subscriptions
          },
        },
        select: {
          plan: true,
          endDate: true,
        },
        orderBy: {
          endDate: "desc", // ✅ get the latest one
        },
        take: 1,
      },
    },
  });

  if (!user) {
    throw Errors.NOT_FOUND({
      code: "USER_NOT_FOUND",
      message: "User not found",
    });
  }

  const activeSubscription = user.subscriptions[0] ?? null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    providers: user.accounts.map((acc) => acc.provider),
    isPro: !!activeSubscription, // ✅ true if active PRO
    proExpiresAt: activeSubscription?.endDate ?? null, // ✅ when it expires
  };
};

/* ================= UPDATE PROFILE ================= */

export const updateProfileService = async ({
  id,
  name,
  imageUrl,
  pictureId,
}: {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
  pictureId?: string | null;
}): Promise<UserProfileResponseDTO> => {
  if (!id) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  /* ================= GET EXISTING USER ================= */
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { pictureId: true },
  });

  if (!existingUser) {
    throw Errors.NOT_FOUND({
      code: "USER_NOT_FOUND",
      message: "User not found",
    });
  }

  /* ================= BUILD UPDATE DATA ================= */
  const data: Prisma.UserUpdateInput = {};

  // ✅ NAME (already validated by Zod)
  if (typeof name === "string") {
    data.name = name; // already trimmed + validated
  }

  // ✅ IMAGE (only if both exist)
  if (typeof imageUrl === "string" && typeof pictureId === "string") {
    data.picture = imageUrl;
    data.pictureId = pictureId;
  }

  if (Object.keys(data).length === 0) {
    throw Errors.BAD_REQUEST({
      code: "NOTHING_TO_UPDATE",
      message: "Nothing to update",
    });
  }

  /* ================= UPDATE USER ================= */
  let updatedUser;

  try {
    updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: {
        accounts: {
          select: { provider: true },
        },
        subscriptions: {
          where: {
            plan: SubscriptionPlan.PRO,
            endDate: { gt: new Date() },
          },
          select: { endDate: true },
          orderBy: { endDate: "desc" },
          take: 1,
        },
      },
    });
  } catch (err) {
    console.error("❌ Update failed:", err);
    throw Errors.INTERNAL({
      code: "PROFILE_UPDATE_FAILED",
      message: "Failed to update profile",
    });
  }

  /* ================= DELETE OLD IMAGE ================= */
  if (
    typeof pictureId === "string" &&
    existingUser.pictureId &&
    existingUser.pictureId !== pictureId
  ) {
    cloudinary.uploader
      .destroy(existingUser.pictureId)
      .catch((err) => console.error("❌ Old image delete failed:", err));
  }

  /* ================= FORMAT RESPONSE ================= */
  const activeSubscription = updatedUser.subscriptions[0] ?? null;

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    picture: updatedUser.picture,
    providers: updatedUser.accounts.map((acc) => acc.provider),
    isPro: !!activeSubscription,
    proExpiresAt: activeSubscription?.endDate ?? null,
  };
};

// /* ================= DELETE ACCOUNT ================= */

export const deleteAccountService = async (id: string): Promise<void> => {
  if (!id) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  /* ================= GET USER ================= */
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      pictureId: true,
      accounts: {
        select: {
          firebaseId: true,
        },
      },
    },
  });

  if (!user) {
    throw Errors.NOT_FOUND({
      code: "USER_NOT_FOUND",
      message: "User not found",
    });
  }

  /* ================= DELETE FIREBASE ================= */

  const firebaseId = user.accounts.find((acc) => acc.firebaseId)?.firebaseId;

  if (firebaseId) {
    try {
      await admin.auth().deleteUser(firebaseId);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        console.warn("⚠️ Firebase user already deleted:", firebaseId);
      } else {
        console.error("❌ Firebase delete failed:", err);
        // ❗ Do NOT throw → external system should not break DB consistency
      }
    }
  }

  /* ================= DELETE USER (DB - TRANSACTION SAFE) ================= */

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({
        where: { id },
      });
    });
  } catch (err) {
    console.error("❌ DB delete failed:", err);
    throw Errors.INTERNAL({
      code: "ACCOUNT_DELETE_FAILED",
      message: "Failed to delete account",
    });
  }

  /* ================= DELETE CLOUDINARY (ASYNC CLEANUP) ================= */

  if (user.pictureId) {
    cloudinary.uploader
      .destroy(user.pictureId)
      .then(() => {
        console.log("✅ Cloudinary image deleted:", user.pictureId);
      })
      .catch((err) => {
        console.error("❌ Cloudinary delete failed:", err);
      });
  }
};
