import { z } from "zod";
import { listSchema, ListResponseSchema } from "../validation/listvalidation";

export type listSchemaRequestDTO = z.infer<typeof listSchema>;
export type ListResponseDTO = z.infer<typeof ListResponseSchema>;
/* ---------- RE-EXPORT SCHEMAS ---------- */
export { listSchema, ListResponseSchema };
