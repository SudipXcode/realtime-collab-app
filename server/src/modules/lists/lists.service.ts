import { prisma } from "../../core/lib/prisma";
import { Errors } from "../../core/errors/customeError.errors";
import { ListType, SubscriptionPlan } from "@prisma/client";
import {
  addMemberSchemaDTO,
  listDetailResponseDTO,
  ListResponseDTO,
  listSchemaRequestDTO,
} from "../../dto/lists.dto";
import { CollabStatus } from "@prisma/client";
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

  /* ================= SUBSCRIPTION ================= */
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const isPro =
    subscription?.plan === SubscriptionPlan.PRO &&
    (!subscription?.endDate || subscription.endDate > new Date());

  /* ================= LIMIT CHECK ================= */
  const listCount = await prisma.list.count({
    where: { ownerId: userId, isActive: true },
  });

  const limit = isPro ? 10 : 5;

  if (listCount >= limit) {
    throw Errors.BAD_REQUEST({
      code: "LIST_LIMIT_REACHED",
      message: `You can only create up to ${limit} lists`,
    });
  }

  /* ================= CREATE LIST ================= */
  const list = await prisma.list.create({
    data: {
      title: emoji ? `${emoji} ${name}` : name,
      ownerId: userId,
      type: type.toUpperCase() as ListType,
      color,
    },
  });

  /* ================= ADD MEMBER ================= */
  if (memberId) {
    await prisma.member.create({
      data: {
        listId: list.id,
        userId: memberId,
        invitedById: userId,
        status: "PENDING",
      },
    });
  }

  /* ================= RESPONSE ================= */
  return {
    id: list.id,
    name, // clean (without emoji)
    type,
    color: list.color ?? "#4772FA",
    ...(memberId && { memberId }),
  };
};

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
              status: CollabStatus.ACCEPTED, // ✅ correct
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      type: true,
      color: true,
      members: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return lists.map((list) => ({
    id: list.id,
    name: list.title,
    type: (list.type ?? "PERSONAL").toLowerCase() as ListResponseDTO["type"],
    color: list.color ?? "#4772FA",
    ...(list.members?.[0]?.userId && {
      memberId: list.members[0].userId,
    }),
  }));
};

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
      members: {
        include: { user: true },
      },
      tasks: true,
    },
  });

  if (!list || !list.isActive) {
    throw Errors.NOT_FOUND({
      code: "LIST_NOT_FOUND",
      message: "List not found",
    });
  }

  /* ================= ACCESS ================= */
  const isOwner = list.ownerId === userId;

  const isAcceptedMember = list.members.some(
    (m) => m.userId === userId && m.status === "ACCEPTED",
  );

  if (!isOwner && !isAcceptedMember) {
    throw Errors.FORBIDDEN({
      code: "ACCESS_DENIED",
      message: "Access denied",
    });
  }

  /* ================= FORMAT ================= */
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

    isShared: list.members.some((m) => m.status === "ACCEPTED"),

    members: list.members.map((m) => ({
      id: m.user.id,
      name: m.user.name ?? "Unknown",
      email: m.user.email,
      status: m.status,
      picture: m.user.picture ?? "Unknown",
    })),

    tasks: list.tasks.map((t) => ({
      title: t.title,

      // ✅ null → undefined
      description: t.description ?? undefined,

      // ✅ Date → string | undefined
      dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,

      // ✅ ENUM FIX (CRITICAL)
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

export const addMemberService = async (
  listId: string,
  memberId: string,
  currentUserId: string,
): Promise<addMemberSchemaDTO> => {
  /* ================= VALIDATION ================= */
  if (!listId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_LIST_ID",
      message: "Invalid list id",
    });
  }

  if (!memberId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  /* ================= CHECK LIST ================= */
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { id: true, ownerId: true },
  });

  if (!list) {
    throw Errors.NOT_FOUND({
      code: "LIST_NOT_FOUND",
      message: "List not found",
    });
  }

  /* ================= ONLY OWNER ================= */
  if (list.ownerId !== currentUserId) {
    throw Errors.FORBIDDEN({
      code: "NOT_ALLOWED",
      message: "Only owner can invite members",
    });
  }

  /* ================= CHECK USER ================= */
  const user = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true },
  });

  if (!user) {
    throw Errors.NOT_FOUND({
      code: "USER_NOT_FOUND",
      message: "User not found",
    });
  }

  /* ================= EXISTING CHECK ================= */
  const existing = await prisma.member.findUnique({
    where: {
      listId_userId: {
        listId,
        userId: memberId,
      },
    },
  });

  if (existing) {
    if (existing.status === "PENDING") {
      throw Errors.CONFLICT({
        code: "REQUEST_ALREADY_SENT",
        message: "Invite already sent to this user",
      });
    }

    if (existing.status === "ACCEPTED") {
      throw Errors.CONFLICT({
        code: "ALREADY_MEMBER",
        message: "User is already a member",
      });
    }

    if (existing.status === "REJECTED") {
      const updated = await prisma.member.update({
        where: { id: existing.id },
        data: {
          status: "PENDING",
          invitedById: currentUserId,
        },
      });

      return {
        listId: updated.listId,
        memberId: updated.userId,
      };
    }
  }

  /* ================= CREATE WITH SAFETY ================= */
  try {
    const member = await prisma.member.create({
      data: {
        listId,
        userId: memberId,
        invitedById: currentUserId,
        status: "PENDING",
      },
    });

    return {
      listId: member.listId,
      memberId: member.userId,
    };
  } catch (err: any) {
    // 🔥 Handle race condition (duplicate insert)
    if (err.code === "P2002") {
      throw Errors.CONFLICT({
        code: "ALREADY_MEMBER",
        message: "User already exists in this list",
      });
    }

    throw err;
  }
};


 
export const memberDeleteService = async (
  listId: string,
  memberId: string,
  userId: string,
): Promise<{ listId: string; memberId: string }> => {

  /* ================= VALIDATION ================= */
  if (!listId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_LIST_ID",
      message: "Invalid list id",
    });
  }

  if (!memberId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_MEMBER_ID",
      message: "Invalid member id",
    });
  }

  /* ================= CHECK LIST ================= */
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { id: true, ownerId: true },
  });

  if (!list) {
    throw Errors.NOT_FOUND({
      code: "LIST_NOT_FOUND",
      message: "List not found",
    });
  }

  /* ================= ONLY OWNER ================= */
  if (list.ownerId !== userId) {
    throw Errors.FORBIDDEN({
      code: "NOT_ALLOWED",
      message: "Only owner can remove members",
    });
  }

  /* ================= PREVENT OWNER REMOVE ================= */
  if (memberId === userId) {
    throw Errors.BAD_REQUEST({
      code: "CANNOT_REMOVE_OWNER",
      message: "Owner cannot remove themselves",
    });
  }

  /* ================= CHECK MEMBER ================= */
  const member = await prisma.member.findUnique({
    where: {
      listId_userId: {
        listId,
        userId: memberId,
      },
    },
  });

  if (!member) {
    throw Errors.NOT_FOUND({
      code: "MEMBER_NOT_FOUND",
      message: "Member not found in this list",
    });
  }

  /* ================= DELETE ================= */
  await prisma.member.delete({
    where: { id: member.id },
  });

  /* ================= RESPONSE ================= */
  return {
    listId,
    memberId,
  };
};
