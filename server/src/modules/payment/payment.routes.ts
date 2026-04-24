import { Router } from "express";
import * as paymentController from "./payment.controller";
import { validateAccessToken } from "../../core/middlewares/reqValidate.middleware";

const router: Router = Router();

router.post("/", validateAccessToken, paymentController.initiatePayment);

// real callback (kept for production)
router.get("/callback", paymentController.verifyPayment);

// ✅ MOCK route (for local testing)
router.get("/mock-success", paymentController.mockSuccess);

export default router;