import { prisma } from "../../core/lib/prisma";
import { Errors } from "../../core/errors/customeError.errors";
import { ListType, SubscriptionPlan } from "@prisma/client";
import { ListResponseDTO, listSchemaRequestDTO } from "../../dto/lists.dto";
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
