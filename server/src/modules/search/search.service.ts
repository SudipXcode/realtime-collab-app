import { prisma } from "../../core/lib/prisma";
import { Errors } from "../../core/errors/customeError.errors";
import { searchMembersResultDTO } from "../../dto/search.dto";

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