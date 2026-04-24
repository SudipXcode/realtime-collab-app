import { Router } from "express";
import * as profileController from "./profile.controller";
import { validate, validateAccessToken } from "../../core/middlewares/reqValidate.middleware";
import upload from "../../infrastructure/media/multer";
import {UserProfileUpdateSchema} from '../../dto/profile.dto'
const router: Router = Router();

router.get("/", validateAccessToken, profileController.getProfile);
router.patch(
  "/",
  validateAccessToken,
  upload.single("avatar"),
  profileController.updateProfile
);
router.delete("/", validateAccessToken, profileController.deleteAccount);
export default router;
