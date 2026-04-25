import { z } from "zod";

export const listSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),

  type: z.enum(["personal", "work", "shopping", "other"], {
    errorMap: () => ({ message: "Please select a list type" }),
  }),

  emoji: z.string().nullable().optional(),
  color: z.string().optional(),
  memberId: z.string().uuid().optional(),
});
