import { Router } from "express";
import * as searchController from "./search.controller";
import {
  validate,
  validateAccessToken,
} from "../../core/middlewares/reqValidate.middleware";
import { searchMembersSchema } from "../../dto/search.dto";

const router: Router = Router();

router.get(
  "/members",
  validateAccessToken,
  validate(searchMembersSchema, "query"),
  searchController.searchMembers,
);

export default router;
