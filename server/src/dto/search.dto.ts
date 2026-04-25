import { z } from "zod";
import {
  searchMembersSchema,
  searchMembersResult,
} from "../validation/searchValidation";

export type searchMembersSchemaDTO = z.infer<typeof searchMembersSchema>;
export type searchMembersResultDTO = z.infer<typeof searchMembersResult>;
/* ---------- RE-EXPORT SCHEMAS ---------- */
export { searchMembersSchema, searchMembersResult };
