import { z } from "zod";

export const taskRequestSchema = z.object({
  title: z.string().min(1).trim(),
  listId: z.string().uuid("Invalid list id"),
  dueDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return new Date(val).toISOString();
    }),
  priority: z.enum(["Low", "Medium", "High", "None"]),
});

export const taskResponseSchema = z.object({
  id: z.string().uuid(),

  title: z.string(),

  description: z.string().optional(),

  dueDate: z.string().datetime().optional(),

  priority: z.enum(["Low", "Medium", "High", "None"]),

  isChecked: z.boolean(),

  createdAt: z.date(),

  listId: z.string().uuid("Invalid list id"),
});

export const taskUpdateSchema = z.object({
  title: z.string().optional(),

  description: z.string().optional(),

  dueDate: z.string().datetime().optional(),

  priority: z.enum(["Low", "Medium", "High", "None"]).optional(),

  isChecked: z.boolean().optional(),
  listId: z.string().uuid("Invalid list id"),
});

export const taskUpdateParam = z.object({
  id: z.string().uuid(),
});

export const taskMoveSchema = z.object({
  listId: z.string().uuid("Invalid list id"),
});

export const taskDeleteParam = z.object({
  listId: z.string().uuid("Invalid list id"),
  id: z.string().uuid(),
});
