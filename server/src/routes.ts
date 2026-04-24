import { Router } from "express";
import authRoutes from "./modules/firebase/auth.routes";
import profileRoutes from "./modules/profile/profile.routes";
import paymentRoutes from "./modules/payment/payment.routes";

const router: Router = Router();
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/payment", paymentRoutes);
export default router;
