import { z } from "zod";
import {
  listSchema,
  ListResponseSchema,
  listIdParamSchema,
  listDetailResponseSchema,
  addMemberSchema,
} from "../validation/listvalidation";

export type listSchemaRequestDTO = z.infer<typeof listSchema>;
export type ListResponseDTO = z.infer<typeof ListResponseSchema>;
export type listDetailResponseDTO = z.infer<typeof listDetailResponseSchema>;
export type addMemberSchemaDTO = z.infer<typeof addMemberSchema>;
/* ---------- RE-EXPORT SCHEMAS ---------- */
export {
  listSchema,
  ListResponseSchema,
  listIdParamSchema,
  listDetailResponseSchema,
  addMemberSchema,
};
