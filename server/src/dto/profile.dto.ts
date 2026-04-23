import { z } from "zod";
import {
  UserProfileResponseSchema,
  UserProfileUpdateSchema,
} from "../validation/profileValidation";

export type UserProfileResponseDTO = z.infer<typeof UserProfileResponseSchema>;
export type UserProfileUpdateResult = z.infer<typeof UserProfileUpdateSchema>;

/* ---------- RE-EXPORT SCHEMAS ---------- */
export { UserProfileResponseSchema, UserProfileUpdateSchema };
