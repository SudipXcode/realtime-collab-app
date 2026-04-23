import { Router } from "express";
import { firebaseAuth } from "../../core/middlewares/firebaseAuth.middleware";
import * as authController from "./auth.controller";
import {
  validateAccessToken,
  validateRefreshToken,
} from "../../core/middlewares/reqValidate.middleware";
import { generateCsrfToken } from "../../core/middlewares/csfr";

const router: Router = Router();

/**
 * LOGIN (OAuth via Firebase)
 */
router.post("/login", firebaseAuth, authController.login);
/**
 * LOGOUT (refresh-token protected)
 */
router.post("/logout", validateRefreshToken, authController.logout);

/**
 * REFRESH ACCESS TOKEN
 */
router.post("/refresh", validateRefreshToken, authController.refreshToken);
/**
 * CSRF TOKEN ISSUER
 */
router.get("/csrf", generateCsrfToken, (req, res) => {
  res.status(200).json({
    csrfToken: req.cookies["CSRF-TOKEN"],
  });
});

export default router;
