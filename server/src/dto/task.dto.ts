import { z } from "zod";
import {
  taskRequestSchema,
  taskResponseSchema,
  taskUpdateSchema,
  taskUpdateParam,
  taskMoveSchema,
  taskDeleteParam,
} from "../validation/taskValidation";

export type taskRequestDTO = z.infer<typeof taskRequestSchema>;
export type taskResponseDTO = z.infer<typeof taskResponseSchema>;
export type taskUpdateParamDTO = z.infer<typeof taskUpdateParam>;
export type taskUpdateScheamDTO = z.infer<typeof taskUpdateSchema>;
export type taskMoveSchemaDTO = z.infer<typeof taskMoveSchema>;
export type taskDeleteParamDTO = z.infer<typeof taskDeleteParam>;
/* ---------- RE-EXPORT SCHEMAS ---------- */
export {
  taskRequestSchema,
  taskResponseSchema,
  taskUpdateParam,
  taskUpdateSchema,
  taskMoveSchema,
  taskDeleteParam,
};
