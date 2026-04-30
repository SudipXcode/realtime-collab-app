import { z } from "zod";

export const listTypeEnum = z.enum([
  "personal",
  "work",
  "shopping",
  "other",
]);

export const listSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),

  type: listTypeEnum,

  emoji: z.string().nullable().optional(),
  color: z.string().optional(),
  memberId: z.string().uuid().optional(),
});