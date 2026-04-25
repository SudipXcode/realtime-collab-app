import { z } from "zod";
import {
  libraryQuerySchema,
  libraryListResponseSchema,
  deleteListsSchema,
  deleteListsResponse,
  favouriteListsSchema,
  favouriteListsResponse,
  approvalSchemaResponse,
  approvalSchema,
} from "../validation/libraryValidation";

export type libraryQueryRequestDTO = z.infer<typeof libraryQuerySchema>;
export type libraryListResponseDTO = z.infer<typeof libraryListResponseSchema>;
export type deleteListsSchemaDTO = z.infer<typeof deleteListsSchema>;
export type deleteListsResponseDTO = z.infer<typeof deleteListsResponse>;
export type favouriteListsDTO = z.infer<typeof favouriteListsSchema>;
export type favouriteListsResponseDTO = z.infer<typeof favouriteListsResponse>;
export type approvalSchemaResponseDTO = z.infer<typeof approvalSchemaResponse>;
export type approvalSchemaDTO = z.infer<typeof approvalSchema>;
/* ---------- RE-EXPORT SCHEMAS ---------- */
export {
  libraryQuerySchema,
  libraryListResponseSchema,
  deleteListsSchema,
  deleteListsResponse,
  favouriteListsSchema,
  favouriteListsResponse,
  approvalSchemaResponse,
  approvalSchema,
};
