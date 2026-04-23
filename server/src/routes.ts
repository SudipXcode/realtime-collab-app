import { Router } from "express";
import authRoutes from "./modules/firebase/auth.routes";
import profileRoutes from "./modules/profile/profile.routes";

const router: Router = Router();
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
export default router;
