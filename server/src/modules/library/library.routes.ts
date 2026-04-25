
import { Router } from "express";
import {
  validate,
  validateAccessToken,
} from "../../core/middlewares/reqValidate.middleware";
import * as libraryController from "./library.controller";
import {
  deleteListsSchema,
  favouriteListsSchema,
  libraryQuerySchema,
  approvalSchema,
} from "../../dto/library.dto";
const router: Router = Router();

router.get(
  "/",
  validateAccessToken,
  validate(libraryQuerySchema, "query"),
  libraryController.getListsLibrary,
);
router.delete(
  "/",
  validateAccessToken,
  validate(deleteListsSchema, "body"),
  libraryController.deleteLists,
);

router.patch(
  "/favourite",
  validateAccessToken,
  validate(favouriteListsSchema, "body"),
  libraryController.updateFavouriteLists,
);

router.patch(
  "/approval",
  validateAccessToken,
  validate(approvalSchema, "body"),
  libraryController.updateApprovalLists,
);
export default router;
