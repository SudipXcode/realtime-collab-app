import { prisma } from "../../core/lib/prisma";
import { Errors } from "../../core/errors/customeError.errors";
import { searchMembersResultDTO } from "../../dto/search.dto";
import { CollabStatus } from "@prisma/client";
import { listDetailResponseDTO } from "../../dto/lists.dto";
/* ================= SEARCH MEMBERS ================= */

export const getMembers = async (
  userId: string,
  query: string,
): Promise<searchMembersResultDTO[]> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const cleanQuery = query?.trim();

  if (!cleanQuery || cleanQuery.length < 2) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      isActive: true,
      OR: [
        {
          name: {
            contains: cleanQuery, // 🔥 better than startsWith
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: cleanQuery,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
    },
    take: 5,
    orderBy: {
      name: "asc", // optional but nice UX
    },
  });

  return users;
};

export const getSearchTask = async (
  userId: string,
  query: string,
): Promise<listDetailResponseDTO[]> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery || cleanQuery.length < 2) {
    return [];
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
    },

    include: {
      owner: true,

      members: {
        include: {
          user: true,
        },
      },

      tasks: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  return lists
    .map((list) => {
      const listMatched = list.title.toLowerCase().includes(cleanQuery);

      const matchedTasks = list.tasks.filter((task) =>
        task.title.toLowerCase().includes(cleanQuery),
      );

      if (!listMatched && matchedTasks.length === 0) {
        return null;
      }

      const visibleTasks = listMatched ? list.tasks : matchedTasks;

      const isOwner = list.ownerId === userId;

      return {
        id: list.id,
        name: list.title,
        createdAt: list.createdAt,
        isActive: list.isActive,
        isFavourite: list.isFavourite,

        owner: {
          id: list.owner.id,
          name: list.owner.name ?? "Unknown",
          email: list.owner.email,
          picture: list.owner.picture ?? "Unknown",
        },

        isOwner,

        isShared: list.members.some(
          (m) => m.status === CollabStatus.ACCEPTED,
        ),

        members: list.members.map((m) => ({
          id: m.user.id,
          name: m.user.name ?? "Unknown",
          email: m.user.email,
          status: m.status,
          picture: m.user.picture ?? "Unknown",
        })),

        tasks: visibleTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description ?? undefined,
          dueDate: task.dueDate
            ? task.dueDate.toISOString()
            : undefined,
          priority:
            (task.priority.charAt(0) +
              task.priority.slice(1).toLowerCase()) as
              | "Low"
              | "Medium"
              | "High"
              | "None",
          isChecked: task.isChecked,
          createdAt: task.createdAt,
        })),
      };
    })
    .filter(Boolean) as listDetailResponseDTO[];
};