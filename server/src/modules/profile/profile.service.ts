import { prisma } from "../../core/lib/prisma";
import { Prisma, SubscriptionPlan } from "@prisma/client";
import admin from "../../core/lib/firebase"; // ✅ your existing setup
import { Errors } from "../../core/errors/customeError.errors";
import { UserProfileResponseDTO } from "../../dto/profile.dto";

/* ================= GET PROFILE ================= */

export const getProfileService = async (
  id: string,
): Promise<UserProfileResponseDTO> => {
  if (!id) {
    throw Errors.BAD_REQUEST("Invalid user id");
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
    throw Errors.NOT_FOUND("User not found");
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

// export const updateProfileService = async ({
//   id,
//   name,
//   imageUrl,
//   pictureId,
// }: {
//   id: string;
//   name?: string;
//   imageUrl?: string;
//   pictureId?: string;
// }): Promise<UserProfileUpdateResult> => {
//   if (!id) {
//     throw Errors.BAD_REQUEST("Invalid user id");
//   }

//   const user = await prisma.user.findUnique({
//     where: { id },
//     select: { pictureId: true },
//   });

//   if (!user) {
//     throw Errors.NOT_FOUND("User not found");
//   }

//   const data: Prisma.UserUpdateInput = {};

//   if (name && name.trim().length >= 3) {
//     data.name = name.trim();
//   }

//   if (imageUrl && pictureId) {
//     data.picture = imageUrl;
//     data.pictureId = pictureId;
//   }

//   if (Object.keys(data).length === 0) {
//     throw Errors.BAD_REQUEST("Nothing to update");
//   }

//   const updatedUser = await prisma.user.update({
//     where: { id },
//     data,
//   });

//   // ✅ Delete OLD image safely (non-blocking)
//   if (pictureId && user.pictureId) {
//     cloudinary.uploader
//       .destroy(user.pictureId)
//       .catch((err) =>
//         console.error("Cloudinary old image delete failed:", err)
//       );
//   }

//   return {
//     name: updatedUser.name,
//     picture: updatedUser.picture,
//   };
// };
// /* ================= DELETE ACCOUNT ================= */

// export const deleteAccountService = async (id: string): Promise<void> => {
//   if (!id) {
//     throw Errors.BAD_REQUEST("Invalid user id");
//   }

//   const user = await prisma.user.findUnique({
//     where: { id },
//     select: {
//       pictureId: true,
//       accounts: {
//         select: {
//           firebaseId: true,
//         },
//       },
//     },
//   });

//   if (!user) {
//     throw Errors.NOT_FOUND("User not found");
//   }

//   /* ================= DELETE FIREBASE ================= */

//   const firebaseId = user.accounts.find((acc) => acc.firebaseId)?.firebaseId;

//   if (firebaseId) {
//     try {
//       await admin.auth().deleteUser(firebaseId);
//     } catch (err: any) {
//       if (err.code === "auth/user-not-found") {
//         console.warn("Firebase user already deleted:", firebaseId);
//       } else {
//         console.error("Firebase delete failed:", err);
//         // ✅ DO NOT throw (external dependency)
//       }
//     }
//   }

//   /* ================= DELETE USER (DB) ================= */

//   // Cascades to Account, RefreshToken, Subscription, List memberships etc.
//   await prisma.user.delete({
//     where: { id },
//   });

//   /* ================= DELETE CLOUDINARY ================= */

//   if (user.pictureId) {
//     cloudinary.uploader
//       .destroy(user.pictureId)
//       .catch((err) => console.error("Cloudinary delete failed:", err));
//   }
// };
