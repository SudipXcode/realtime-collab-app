import { z } from "zod";
import {
  libraryQuerySchema,
  libraryResponseSchema,
  deleteListsSchema,
  deleteListsResponse,
  favouriteListsSchema,
  favouriteListsResponse,
  approvalSchemaResponse,
  approvalSchema,
} from "../validation/libraryValidation";

/* ================= TYPES ================= */

export type libraryQueryRequestDTO = z.infer<typeof libraryQuerySchema>;

// 🔥 THIS IS YOUR MAIN RESPONSE TYPE NOW
export type libraryListResponseDTO = z.infer<typeof libraryResponseSchema>;

export type deleteListsSchemaDTO = z.infer<typeof deleteListsSchema>;
export type deleteListsResponseDTO = z.infer<typeof deleteListsResponse>;

export type favouriteListsDTO = z.infer<typeof favouriteListsSchema>;
export type favouriteListsResponseDTO = z.infer<typeof favouriteListsResponse>;

export type approvalSchemaResponseDTO = z.infer<typeof approvalSchemaResponse>;
export type approvalSchemaDTO = z.infer<typeof approvalSchema>;

/* ================= RE-EXPORT ================= */

export {
  libraryQuerySchema,
  libraryResponseSchema, // ✅ renamed export
  deleteListsSchema,
  deleteListsResponse,
  favouriteListsSchema,
  favouriteListsResponse,
  approvalSchemaResponse,
  approvalSchema,
  
};