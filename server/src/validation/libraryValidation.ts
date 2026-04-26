import { z } from "zod";

export const libraryQuerySchema = z.object({
  tab: z.enum(["Recent", "Favourites", "Collaboration", "Approval"]).optional(),

  sort: z.enum(["Date", "Time", "Tags", "Priority"]).optional(),
});

export const libraryListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.coerce.date(),

  isActive: z.boolean(),
  isFavourite: z.boolean(),

  owner: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),

  isOwner: z.boolean(),
  isShared: z.boolean(),

  members: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
    }),
  ),
});

/* ================= FINAL RESPONSE ================= */

export const libraryResponseSchema = z.object({
  hasPending: z.boolean(),
  pendingCount: z.number().int().min(0),
  lists: z.array(libraryListItemSchema), // ✅ FIXED (no recursion)
});

export const deleteListsSchema = z.object({
  listId: z
    .array(z.string().uuid("Invalid list id"))
    .min(1, "At least one list id is required"),
});

export const deleteListsResponse = z.object({
  deletedCount: z.number(),
  deletedIds: z.array(z.string().uuid()),
});

export const favouriteListsSchema = z.object({
  listId: z.string().uuid("Invalid list id"),
});

export const favouriteListsResponse = z.object({
  listId: z.string().uuid(),
  isFavourite: z.boolean(),
});

export const approvalSchema = z.object({
  listId: z.string().uuid("Invalid list id"),
  isApproved: z.boolean(),
});
export const approvalSchemaResponse = z.object({
  listId: z.string().uuid("Invalid list id"),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
});
