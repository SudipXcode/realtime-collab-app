
import { prisma } from "../../core/lib/prisma";
import { Errors } from "../../core/errors/customeError.errors";
import {
  approvalSchemaResponseDTO,
  deleteListsResponseDTO,
  deleteListsSchemaDTO,
  favouriteListsResponseDTO,
  libraryListResponseDTO,
} from "../../dto/library.dto";
import { CollabStatus } from "@prisma/client";

type Params = {
  id: string;
  tab?: string;
  sort?: string;
};

export const getListLibraryService = async ({
  id,
  tab = "Recent",
  sort = "Date",
}: Params): Promise<libraryListResponseDTO[]> => {
  if (!id) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  /* ================= BASE ACCESS ================= */
  const baseAccess = {
    OR: [
      { ownerId: id },
      {
        members: {
          some: {
            userId: id,
            status: CollabStatus.ACCEPTED,
          },
        },
      },
    ],
  };

  let where: any = {};

  /* ================= TABS ================= */
  if (tab === "Recent") {
    where = baseAccess;
  }

  if (tab === "Favourites") {
    where = {
      AND: [baseAccess, { isFavourite: true }],
    };
  }

  if (tab === "Collaboration") {
    where = {
      AND: [
        baseAccess,
        {
          members: {
            some: {
              status: CollabStatus.ACCEPTED,
            },
          },
        },
      ],
    };
  }

  if (tab === "Approval") {
    where = {
      OR: [
        // 👤 invited user
        {
          members: {
            some: {
              userId: id,
              status: CollabStatus.PENDING,
            },
          },
        },

        // 👑 owner (inviter implicitly)
        {
          ownerId: id,
          members: {
            some: {
              status: CollabStatus.PENDING,
            },
          },
        },
      ],
    };
  }

  /* ================= SORT ================= */
  let orderBy: any = { createdAt: "desc" };

  if (sort === "Time") orderBy = { createdAt: "asc" };
  if (sort === "Priority") orderBy = { type: "asc" };
  if (sort === "Tags") orderBy = { title: "asc" };

  /* ================= FETCH ================= */
  const lists = await prisma.list.findMany({
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      createdAt: true,
      isActive: true,
      isFavourite: true,

      owner: {
        select: {
          id: true,
          name: true,
        },
      },

      members: {
        select: {
          status: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  /* ================= FORMAT ================= */
  const formattedLists: libraryListResponseDTO[] = lists.map((list) => {
    const isOwner = list.owner.id === id;

    return {
      id: list.id,
      name: list.title,
      createdAt: list.createdAt,
      isActive: list.isActive,
      isFavourite: list.isFavourite,
      owner: {
        id: list.owner.id,
        name: list.owner.name ?? "Unknown",
      },

      isOwner,

      // ✅ FIX: only accepted members count as shared
      isShared: list.members.some((m) => m.status === CollabStatus.ACCEPTED),

      members: list.members.map((m) => ({
        id: m.user.id,
        name: m.user.name ?? "Unknown",
        email: m.user.email,
        status: m.status,
      })),
    };
  });

  return formattedLists;
};

type DeleteListsParams = {
  id: string;
  listId: string[];
};

export const deleteListsService = async ({
  id,
  listId,
}: DeleteListsParams): Promise<deleteListsResponseDTO> => {
  if (!listId.length) {
    return {
      deletedCount: 0,
      deletedIds: [],
    };
  }

  // 🔍 fetch lists
  const lists = await prisma.list.findMany({
    where: {
      id: { in: listId },
    },
    select: {
      id: true,
      ownerId: true,
      isSystem: true,
    },
  });

  if (!lists.length) {
    return {
      deletedCount: 0,
      deletedIds: [],
    };
  }

  // ✅ filter valid
  const validLists = lists.filter((l) => l.ownerId === id && !l.isSystem);

  const validIds = validLists.map((l) => l.id);

  if (!validIds.length) {
    throw Errors.FORBIDDEN({
      code: "FORBIDDEN",
      message: "You are not allowed to delete these lists",
    });
  }

  // 🧨 transaction
  await prisma.$transaction([
    prisma.member.deleteMany({
      where: {
        listId: { in: validIds },
      },
    }),

    prisma.list.deleteMany({
      where: {
        id: { in: validIds },
      },
    }),
  ]);

  return {
    deletedCount: validIds.length,
    deletedIds: validIds,
  };
};

export const toggleFavouriteService = async ({
  id,
  listId,
}: {
  id: string;
  listId: string;
}): Promise<favouriteListsResponseDTO> => {
  if (!id) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: {
      id: true,
      ownerId: true,
      isFavourite: true,
      members: {
        where: {
          userId: id,
          status: "ACCEPTED",
        },
        select: { id: true },
      },
    },
  });

  if (!list) {
    throw Errors.NOT_FOUND({
      code: "LIST_NOT_FOUND",
      message: "List not found",
    });
  }

  /* ================= ACCESS CHECK ================= */
  const isOwner = list.ownerId === id;
  const isAcceptedMember = list.members.length > 0;

  if (!isOwner && !isAcceptedMember) {
    throw Errors.FORBIDDEN({
      code: "NOT_ALLOWED",
      message: "You are not allowed to modify this list",
    });
  }

  /* ================= TOGGLE ================= */
  const updated = await prisma.list.update({
    where: { id: listId },
    data: {
      isFavourite: !list.isFavourite,
    },
    select: {
      id: true,
      isFavourite: true,
    },
  });

  return {
    listId: updated.id,
    isFavourite: updated.isFavourite,
  };
};

type UpdateApprovalParams = {
  id: string; // current user
  listId: string;
  isApproved: boolean;
};

export const updateApprovalService = async ({
  id,
  listId,
  isApproved,
}: UpdateApprovalParams): Promise<approvalSchemaResponseDTO> => {
  if (!id) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  /* ================= FIND MEMBER ================= */
  const member = await prisma.member.findFirst({
    where: {
      listId,
      status: "PENDING",
      OR: [
        { userId: id }, // invited user
      ],
    },
  });

  if (!member) {
    throw Errors.NOT_FOUND({
      code: "REQUEST_NOT_FOUND",
      message: "Approval request not found",
    });
  }

  /* ================= APPROVE ================= */
  if (isApproved) {
    await prisma.member.update({
      where: { id: member.id },
      data: { status: "ACCEPTED" },
    });

    return {
      listId,
      status: "ACCEPTED",
    };
  }

  /* ================= REJECT ================= */
  await prisma.member.delete({
    where: { id: member.id }, // ✅ delete immediately
  });

  return {
    listId,
    status: "REJECTED",
  };
};
