import { prisma } from "../../core/lib/prisma";
import { Errors } from "../../core/errors/customeError.errors";
import { Priority, CollabStatus, Task as PrismaTask, SystemListKey } from "@prisma/client";
import {
  taskMoveSchemaDTO,
  taskRequestDTO,
  taskResponseDTO,
  taskUpdateScheamDTO,
} from "../../dto/task.dto";
import { listDetailResponseDTO } from "../../dto/lists.dto";

export const createInboxTaskService = async (
  userId: string,
  data: taskRequestDTO,
): Promise<taskResponseDTO> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const { dueDate, priority, title } = data;

  return await prisma.$transaction(async (tx) => {
    /* ================= FIND / CREATE INBOX ================= */

    let inbox = await tx.list.findUnique({
      where: {
        ownerId_systemKey: {
          ownerId: userId,
          systemKey: SystemListKey.INBOX,
        },
      },
    });

    if (!inbox) {
      inbox = await tx.list.create({
        data: {
          title: "Inbox",
          ownerId: userId,
          isSystem: true,
          systemKey: SystemListKey.INBOX,
        },
      });
    }

    if (!inbox.isActive) {
      throw Errors.NOT_FOUND({
        code: "INBOX_NOT_FOUND",
        message: "Inbox not available",
      });
    }

    /* ================= CREATE TASK ================= */

    const task = await tx.task.create({
      data: {
        title,
        listId: inbox.id,
        priority: (priority?.toUpperCase() as Priority) || "NONE",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isChecked: false,
      },
    });

    /* ================= RESPONSE ================= */

    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      dueDate: task.dueDate?.toISOString(),
      priority: (task.priority.charAt(0) +
        task.priority.slice(1).toLowerCase()) as
        | "Low"
        | "Medium"
        | "High"
        | "None",
      isChecked: task.isChecked,
      createdAt: task.createdAt,
      listId: task.listId,
    };
  });
};
export const createTaskService = async (
  userId: string,
  data: taskRequestDTO,
): Promise<taskResponseDTO> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const { dueDate, listId, priority, title } = data;

  return await prisma.$transaction(async (tx) => {
    /* ================= CHECK LIST ================= */
    const list = await tx.list.findUnique({
      where: { id: listId },
      include: {
        members: true,
      },
    });

    if (!list || !list.isActive) {
      throw Errors.NOT_FOUND({
        code: "LIST_NOT_FOUND",
        message: "List not found",
      });
    }

    /* ================= ACCESS CONTROL ================= */
    const isOwner = list.ownerId === userId;

    const isAcceptedMember = list.members.some(
      (m) => m.userId === userId && m.status === CollabStatus.ACCEPTED,
    );

    if (!isOwner && !isAcceptedMember) {
      throw Errors.FORBIDDEN({
        code: "ACCESS_DENIED",
        message: "You cannot add tasks to this list",
      });
    }

    /* ================= CREATE TASK ================= */
    const task = await tx.task.create({
      data: {
        title,
        listId,
        priority: (priority?.toUpperCase() as Priority) || "NONE",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isChecked: false,
      },
    });

    /* ================= RESPONSE ================= */
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
      priority: (task.priority.charAt(0) +
        task.priority.slice(1).toLowerCase()) as
        | "Low"
        | "Medium"
        | "High"
        | "None",
      isChecked: task.isChecked,
      createdAt: task.createdAt,
      listId: task.listId,
    };
  });
};

export const updateTaskService = async (
  id: string, // taskId
  userId: string,
  data: taskUpdateScheamDTO,
): Promise<taskResponseDTO> => {
  /* ================= VALIDATION ================= */
  if (!userId || !id) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID_OR_TASK_ID",
      message: "Invalid user id or task id",
    });
  }

  const { title, description, dueDate, priority, isChecked, listId } = data;

  /* ================= FIND TASK ================= */
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      list: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!task) {
    throw Errors.NOT_FOUND({
      code: "TASK_NOT_FOUND",
      message: "Task not found",
    });
  }

  /* ================= ACCESS CONTROL ================= */
  const isOwner = task.list.ownerId === userId;

  const isMember = task.list.members.some(
    (m) => m.userId === userId && m.status === "ACCEPTED",
  );

  if (!isOwner && !isMember) {
    throw Errors.FORBIDDEN({
      code: "ACCESS_DENIED",
      message: "You cannot update this task",
    });
  }

  /* ================= BUILD UPDATE DATA ================= */
  const updateData: any = {};

  // ✅ only update if provided (not undefined / empty)
  if (title !== undefined && title.trim() !== "") {
    updateData.title = title.trim();
  }

  if (description !== undefined) {
    updateData.description = description.trim() === "" ? null : description;
  }

  if (dueDate !== undefined) {
    updateData.dueDate = dueDate ? new Date(dueDate) : null;
  }

  if (priority !== undefined) {
    updateData.priority = priority.toUpperCase();
  }

  if (typeof isChecked === "boolean") {
    updateData.isChecked = isChecked;
  }

  // ✅ optional: move task to another list
  if (listId !== undefined) {
    updateData.listId = listId;
  }

  /* ================= UPDATE ================= */
  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
  });

  /* ================= RESPONSE ================= */
  return {
    id: updatedTask.id,
    title: updatedTask.title,
    description: updatedTask.description ?? undefined,
    dueDate: updatedTask.dueDate
      ? updatedTask.dueDate.toISOString()
      : undefined,
    priority: (updatedTask.priority.charAt(0) +
      updatedTask.priority.slice(1).toLowerCase()) as
      | "Low"
      | "Medium"
      | "High"
      | "None",
    isChecked: updatedTask.isChecked,
    createdAt: updatedTask.createdAt,
    listId: updatedTask.listId,
  };
};

const formatTask = (task: PrismaTask): taskResponseDTO => ({
  id: task.id,
  title: task.title,
  description: task.description ?? undefined,
  dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
  priority: (task.priority.charAt(0) + task.priority.slice(1).toLowerCase()) as
    | "Low"
    | "Medium"
    | "High"
    | "None",
  isChecked: task.isChecked,
  createdAt: task.createdAt,
  listId: task.listId,
});

export const moveTaskService = async (
  id: string,
  userId: string,
  data: taskMoveSchemaDTO,
): Promise<taskResponseDTO> => {
  if (!userId || !id) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID_OR_TASK_ID",
      message: "Invalid user id or task id",
    });
  }

  const { listId } = data;

  if (!listId) {
    throw Errors.BAD_REQUEST({
      code: "LIST_ID_REQUIRED",
      message: "Target listId is required",
    });
  }

  return await prisma.$transaction(async (tx) => {
    /* 🔒 TASK */
    const task = await tx.task.findUnique({ where: { id } });

    if (!task) {
      throw Errors.NOT_FOUND({
        code: "TASK_NOT_FOUND",
        message: "Task not found or access denied",
      });
    }

    /* 🔒 LIST */
    const targetList = await tx.list.findUnique({
      where: { id: listId },
    });

    if (!targetList || targetList.ownerId !== userId) {
      throw Errors.NOT_FOUND({
        code: "LIST_NOT_FOUND",
        message: "Target list not found or access denied",
      });
    }

    /* 🚫 NO CHANGE */
    if (task.listId === listId) {
      return formatTask(task);
    }

    /* ✅ MOVE */
    const updatedTask = await tx.task.update({
      where: { id },
      data: { listId },
    });

    return formatTask(updatedTask);
  });
};

export const deleteTaskService = async (
  taskId: string,
  listId: string,
  userId: string,
): Promise<void> => {
  if (!taskId || !listId || !userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_INPUT",
      message: "Task id, list id and user id are required",
    });
  }

  const list = await prisma.list.findFirst({
    where: {
      id: listId,
      ownerId: userId,
    },
  });

  if (!list) {
    throw Errors.NOT_FOUND({
      code: "LIST_NOT_FOUND",
      message: "List not found or access denied",
    });
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      listId,
    },
  });

  if (!task) {
    throw Errors.NOT_FOUND({
      code: "TASK_NOT_FOUND",
      message: "Task not found",
    });
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
};

export const todayTaskService = async (
  userId: string,
): Promise<listDetailResponseDTO[]> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

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
      tasks: {
        some: {
          dueDate: {
            gte: now,
            lte: next24Hours,
          },
        },
      },
    },

    include: {
      owner: true,

      members: {
        include: {
          user: true,
        },
      },

      tasks: {
        where: {
          dueDate: {
            gte: now,
            lte: next24Hours,
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      },
    },
  });

  return lists
    .map((list) => {
      const isOwner = list.ownerId === userId;

      const visibleTasks = list.tasks;

      if (!visibleTasks.length) return null;

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

        isShared: list.members.some((m) => m.status === CollabStatus.ACCEPTED),

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
          dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
          priority: (task.priority.charAt(0) +
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


export const inboxTaskService = async (
  userId: string,
): Promise<listDetailResponseDTO[]> => {
  if (!userId) {
    throw Errors.BAD_REQUEST({
      code: "INVALID_USER_ID",
      message: "Invalid user id",
    });
  }

  const lists = await prisma.list.findMany({
    where: {
      title: "Inbox",
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
          createdAt: "desc",
        },
      },
    },
  });

  return lists
    .map((list) => {
      const isOwner = list.ownerId === userId;

      const visibleTasks = list.tasks;

      if (!visibleTasks.length) return null;

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
          (m) => m.status === CollabStatus.ACCEPTED
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
          priority: (
            task.priority.charAt(0) +
            task.priority.slice(1).toLowerCase()
          ) as "Low" | "Medium" | "High" | "None",
          isChecked: task.isChecked,
          createdAt: task.createdAt,
        })),
      };
    })
    .filter(Boolean) as listDetailResponseDTO[];
};