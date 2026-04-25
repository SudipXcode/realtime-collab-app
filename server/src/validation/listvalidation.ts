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
