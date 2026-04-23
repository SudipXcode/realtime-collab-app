// // src/dto/auth/auth.dto.ts
// import { z } from "zod";
// import {
//   LoginResponseSchema,
//   loginServiceInputSchema,
//   JwtPayloadSchema,
//   LoginServiceResultSchema,
//   RefreshTokenResultSchema,
// } from "../validation/authValidation";

// /* ---------- TYPES (derived from Zod) ---------- */
// export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;
// export type LoginServiceInputDTO = z.infer<typeof loginServiceInputSchema>;
// export type JwtPayloadDTO = z.infer<typeof JwtPayloadSchema>;
// export type LoginServiceResult = z.infer<typeof LoginServiceResultSchema>;
// export type RefreshTokenResult = z.infer<typeof RefreshTokenResultSchema>;
// /* ---------- RE-EXPORT SCHEMAS ---------- */
// export {
//   LoginResponseSchema,
//   loginServiceInputSchema,
//   JwtPayloadSchema,
//   LoginServiceResultSchema,

// };
import { z } from "zod";
import {
  LoginResponseSchema,
  loginRequestSchema,
  JwtPayloadSchema,
  LoginResultSchema,
  RefreshTokenResultSchema,
} from "../validation/authValidation";

/* ---------- TYPES ---------- */
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;
export type loginRequestDTO = z.infer<typeof loginRequestSchema>;
export type JwtPayloadDTO = z.infer<typeof JwtPayloadSchema>;
export type LoginResultDTO = z.infer<typeof LoginResultSchema>;
export type RefreshTokenResultDTO = z.infer<typeof RefreshTokenResultSchema>;

/* ---------- RE-EXPORT ---------- */
export {
  LoginResponseSchema,
  loginRequestSchema,
  JwtPayloadSchema,
  LoginResultSchema,
  RefreshTokenResultSchema,
};
