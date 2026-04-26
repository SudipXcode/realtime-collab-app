import { Router } from "express";
import * as listController from "./lists.controller";
import {
  validate,
  validateAccessToken,
} from "../../core/middlewares/reqValidate.middleware";

import {
  listSchema,
  listIdParamSchema,
  addMemberSchema,
} from "../../dto/lists.dto";
const router: Router = Router();

/* ================= LIST ================= */

router.post(
  "/",
  validateAccessToken,
  validate(listSchema, "body"),
  listController.postList,
);
router.get("/", validateAccessToken, listController.getLists);

router.get(
  "/:listId",
  validateAccessToken,
  validate(listIdParamSchema, "params"),
  listController.getSingleList,
);

// /* ================= MEMBER ================= */

router.post(
  "/member",
  validateAccessToken,
  validate(addMemberSchema, "body"),
  listController.updateListsMembers,
);

router.delete(
  "/member/:listId/:memberId",
  validateAccessToken,
  validate(addMemberSchema, "params"),
  listController.deleteMember,
);

export default router;
