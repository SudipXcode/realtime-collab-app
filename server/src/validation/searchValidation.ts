import { z } from "zod";

export const searchMembersSchema = z.object({
  query: z.string().min(1).max(50),
});

export const searchMembersResult = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  picture: z.string().nullable(),
});

