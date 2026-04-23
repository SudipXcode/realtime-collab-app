import { Router } from "express";
import * as profileController from "./profile.controller";
import { validateAccessToken } from "../../core/middlewares/reqValidate.middleware";
// import upload from "../../infrastructure/media/multer";

const router: Router = Router();

router.get("/", validateAccessToken, profileController.getProfile);
// router.patch("/", validateAccessToken, profileController.updateProfile);
// router.delete("/", validateAccessToken, profileController.deleteAccount);
export default router;
