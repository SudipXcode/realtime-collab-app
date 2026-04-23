// import { z } from "zod";
// import { AuthProvider } from "@prisma/client";

// /* ---------- RESPONSE SCHEMA ---------- */
// export const LoginResponseSchema = z.object({
//   id: z.string().uuid(),
//   email: z.string().email(),
// });

// /* ---------- INPUT ---------- */
// export const loginServiceInputSchema = z.object({
//   id: z.string().min(1),
//   name: z.string().nullable(),
//   email: z.string().email().nullable(),
//   provider: z.nativeEnum(AuthProvider), // ✅ better
//   providerId: z.string().nullable(),
//   picture: z.string().url().nullable(),

// });

// /* ---------- JWT ---------- */
// export const JwtPayloadSchema = z.object({
//   id: z.string(),
//   email: z.string().email(),
//   iat: z.number().optional(),
//   exp: z.number().optional(),
// });

// /* ---------- SERVICE RESULT ---------- */
// export const LoginServiceResultSchema = z.object({
//   id: z.string().uuid(),
//   email: z.string().email(),
//   accessToken: z.string(),
//   refreshToken: z.string(),
// });

// /* ---------- REFRESH ---------- */
// export const RefreshTokenResultSchema = z.object({
//   accessToken: z.string(),
//   refreshToken: z.string(),
// });
import { z } from "zod";
import { AuthProvider } from "@prisma/client";

/* ---------- RESPONSE ---------- */
export const LoginResponseSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
  })
  .strict();

/* ---------- INPUT ---------- */
export const loginRequestSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().optional(),
    email: z.string().email().optional(),
    provider: z.nativeEnum(AuthProvider),
    providerId: z.string().optional(),
    picture: z.string().url().optional(),
  })
  .strict();

/* ---------- JWT ---------- */
export const JwtPayloadSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    iat: z.number().optional(),
    exp: z.number().optional(),
  })
  .strict();

/* ---------- SERVICE RESULT ---------- */
export const LoginResultSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    accessToken: z.string().min(10),
    refreshToken: z.string().min(10),
  })
  .strict();

/* ---------- REFRESH ---------- */
export const RefreshTokenResultSchema = z
  .object({
    accessToken: z.string().min(10),
    refreshToken: z.string().min(10),
  })
  .strict();
