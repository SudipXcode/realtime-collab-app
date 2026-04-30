

import { prisma } from "../../core/lib/prisma";
import { Errors } from "../../core/errors/customeError.errors";
import { ListType, SubscriptionPlan, CollabStatus } from "@prisma/client";
import {
  addMemberSchemaDTO,
  listDetailResponseDTO,
  ListResponseDTO,
  listSchemaRequestDTO,
} from "../../dto/lists.dto";

/* =========================================================
   CREATE LIST (🔥 FIXED WITH TRANSACTION)
========================================================= */
export const createListService = async (
  userId: string,
  data: listSchemaRequestDTO,
): Promise<ListResponseDTO> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const { name, type, color, emoji, memberId } = data;
  const normalizedName = name.trim().toLowerCase();

  if (normalizedName === "inbox") {
    throw Errors.BAD_REQUEST({
      code: "RESERVED_LIST_NAME",
      message: `"Inbox" is a reserved system list name`,
    });
  }

  return await prisma.$transaction(async (tx: any) => {
    const subscription = await tx.subscription.findUnique({
      where: { userId },
    });

    const isPro =
      subscription?.plan === SubscriptionPlan.PRO &&
      (!subscription?.endDate || subscription.endDate > new Date());

    const listCount = await tx.list.count({
      where: { ownerId: userId, isActive: true },
    });

    const limit = isPro ? 10 : 5;

    if (listCount >= limit) {
      throw Errors.BAD_REQUEST({
        code: "LIST_LIMIT_REACHED",
        message: `You can only create up to ${limit} lists`,
      });
    }

    const list = await tx.list.create({
      data: {
        title: emoji ? `${emoji} ${name}` : name,
        ownerId: userId,
        type: type.toUpperCase() as ListType,
        color,
      },
    });

    if (memberId) {
      await tx.member.create({
        data: {
          listId: list.id,
          userId: memberId,
          invitedById: userId,
          status: "PENDING",
        },
      });
    }

    return {
      id: list.id,
      name,
      type,
      color: list.color ?? "#4772FA",
      ...(memberId && { memberId }),
    };
  });
};

/* =========================================================
   GET LISTS (optimized, safe)
========================================================= */
// export const getListService = async (
//   userId: string,
// ): Promise<ListResponseDTO[]> => {
//   if (!userId) {
//     throw Errors.BAD_REQUEST({
//       code: "INVALID_USER_ID",
//       message: "Invalid user id",
//     });
//   }

//   const lists = await prisma.list.findMany({
//     where: {
//       OR: [
//         { ownerId: userId },
//         {
//           members: {
//             some: {
//               userId,
//               status: CollabStatus.ACCEPTED,
//             },
//           },
//         },
//       ],
//     },
//     select: {
//       id: true,
//       title: true,
//       type: true,
//       color: true,
//       members: {
//         select: { userId: true },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return lists.map((list) => ({
//     id: list.id,
//     name: list.title,
//     type: (list.type ?? "PERSONAL").toLowerCase() as ListResponseDTO["type"],
//     color: list.color ?? "#4772FA",
//     ...(list.members?.[0]?.userId && {
//       memberId: list.members[0].userId,
//     }),
//   }));
// };
export const getListService = async (
  userId: string,
): Promise<ListResponseDTO[]> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const lists = await prisma.list.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              status: CollabStatus.ACCEPTED,
            },
          },
        },
      ],
      title: {
        not: "Inbox",
      },
    },
    select: {
      id: true,
      title: true,
      type: true,
      color: true,
      members: {
        select: { userId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return lists.map((list: any) => ({
    id: list.id,
    name: list.title,
    type: (list.type ?? "PERSONAL").toLowerCase() as ListResponseDTO["type"],
    color: list.color ?? "#4772FA",
    ...(list.members?.[0]?.userId && {
      memberId: list.members[0].userId,
    }),
  }));
};
/* =========================================================
   LIST DETAILS (safe, no change needed)
========================================================= */
export const listDetailsService = async (
  userId: string,
  listId: string,
): Promise<listDetailResponseDTO> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      owner: true,
      members: { include: { user: true } },
      tasks: true,
    },
  });

  if (!list || !list.isActive) {
    throw Errors.NOT_FOUND({
      code: "LIST_NOT_FOUND",
      message: "List not found",
    });
  }

  const isOwner = list.ownerId === userId;

  const isAcceptedMember = list.members.some(
    (m: any) => m.userId === userId && m.status === "ACCEPTED",
  );

  if (!isOwner && !isAcceptedMember) {
    throw Errors.FORBIDDEN({
      code: "ACCESS_DENIED",
      message: "Access denied",
    });
  }

  return {
    id: list.id,
    name: list.title,
    createdAt: list.createdAt,
    isActive: list.isActive,
    isFavourite: list.isFavourite,

    owner: {
      id: list.owner.id,
      name: list.owner.name ?? "Unknown",
      email: list.owner.email ?? "Unknown",
      picture: list.owner.picture ?? "Unknown",
    },

    isOwner,
    isShared: list.members.some((m: any) => m.status === "ACCEPTED"),

    members: list.members.map((m: any) => ({
      id: m.user.id,
      name: m.user.name ?? "Unknown",
      email: m.user.email,
      status: m.status,
      picture: m.user.picture ?? "Unknown",
    })),

    tasks: list.tasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? "",
      dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
      priority: (t.priority.charAt(0) + t.priority.slice(1).toLowerCase()) as
        | "Low"
        | "Medium"
        | "High"
        | "None",
      isChecked: t.isChecked,
      createdAt: t.createdAt,
    })),
  };
};

/* =========================================================
   ADD MEMBER (🔥 TRANSACTION SAFE)
========================================================= */
export const addMemberService = async (
  listId: string,
  memberId: string,
  currentUserId: string,
): Promise<addMemberSchemaDTO> => {
  return await prisma.$transaction(async (tx: any) => {
    if (!listId || !memberId) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_INPUT",
        message: "Invalid input",
      });
    }

    const list = await tx.list.findUnique({
      where: { id: listId },
      select: { ownerId: true },
    });

    if (!list) {
      throw Errors.NOT_FOUND({
        code: "LIST_NOT_FOUND",
        message: "List not found",
      });
    }

    if (list.ownerId !== currentUserId) {
      throw Errors.FORBIDDEN({
        code: "NOT_ALLOWED",
        message: "Only owner can invite",
      });
    }

    const existing = await tx.member.findUnique({
      where: {
        listId_userId: { listId, userId: memberId },
      },
    });

    if (existing) {
      if (existing.status === "PENDING") {
        throw Errors.CONFLICT({
          code: "REQUEST_ALREADY_SENT",
          message: "Invite already sent",
        });
      }

      if (existing.status === "ACCEPTED") {
        throw Errors.CONFLICT({
          code: "ALREADY_MEMBER",
          message: "Already member",
        });
      }

      if (existing.status === "REJECTED") {
        const updated = await tx.member.update({
          where: { id: existing.id },
          data: { status: "PENDING", invitedById: currentUserId },
        });

        return { listId: updated.listId, memberId: updated.userId };
      }
    }

    const member = await tx.member.create({
      data: {
        listId,
        userId: memberId,
        invitedById: currentUserId,
        status: "PENDING",
      },
    });

    return { listId: member.listId, memberId: member.userId };
  });
};

/* =========================================================
   DELETE MEMBER (safe)
========================================================= */
export const memberDeleteService = async (
  listId: string,
  memberId: string,
  userId: string,
): Promise<{ listId: string; memberId: string }> => {
  if (!listId || !memberId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_INPUT",
      message: "Invalid input",
    });
  }

  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { ownerId: true },
  });

  if (!list) {
    throw Errors.NOT_FOUND({
      code: "LIST_NOT_FOUND",
      message: "List not found",
    });
  }

  if (list.ownerId !== userId) {
    throw Errors.FORBIDDEN({
      code: "NOT_ALLOWED",
      message: "Only owner can remove members",
    });
  }

  if (memberId === userId) {
    throw Errors.BAD_REQUEST({
      code: "CANNOT_REMOVE_OWNER",
      message: "Owner cannot remove themselves",
    });
  }

  const member = await prisma.member.findUnique({
    where: {
      listId_userId: { listId, userId: memberId },
    },
  });

  if (!member) {
    throw Errors.NOT_FOUND({
      code: "MEMBER_NOT_FOUND",
      message: "Member not found",
    });
  }

  await prisma.member.delete({
    where: { id: member.id },
  });

  return { listId, memberId };
};
