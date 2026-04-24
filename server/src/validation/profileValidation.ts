import { AuthProvider } from "@prisma/client";
import { z } from "zod";

export const UserProfileResponseSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  picture: z.string().nullable(),
  providers: z.array(z.nativeEnum(AuthProvider)),
  isPro: z.boolean(),
  proExpiresAt: z.date().nullable(),
});

export const UserProfileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .optional()
    .nullable(),
});