import { z } from "zod";

const baseListSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name too long"),

  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Invalid hex color"),

  type: z.enum(["personal", "work", "shopping", "others"]),

  memberId: z.string().uuid("Invalid member ID").optional(),
});

export const listSchema = baseListSchema.extend({
  emoji: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});
export const ListResponseSchema = baseListSchema.extend({
  id: z.string().uuid(),
});

export const listIdParamSchema = z.object({
  listId: z.string().uuid("Invalid list id"),
});

export const taskResponse = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).trim(),
  description: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return new Date(val).toISOString();
    }),

  priority: z.enum(["Low", "Medium", "High", "None"]),

  isChecked: z.boolean(),
  createdAt: z.date(),
});

export const listDetailResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),

  createdAt: z.date(),
  isActive: z.boolean(),
  isFavourite: z.boolean(),

  owner: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    picture: z.string(),
  }),

  isOwner: z.boolean(),
  isShared: z.boolean(),

  members: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
      picture: z.string(),
    }),
  ),

  tasks: z.array(taskResponse),
});

export const addMemberSchema = z.object({
  listId: z.string().uuid(),
  memberId: z.string().uuid(),
});
