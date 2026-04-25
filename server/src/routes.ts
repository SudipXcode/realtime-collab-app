import { Router } from "express";
import authRoutes from "./modules/firebase/auth.routes";
import profileRoutes from "./modules/profile/profile.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import libraryRoutes from "./modules/library/library.routes";
import listsRoutes from "./modules/lists/lists.routes";
import searchRoutes from './modules/search/search.routes'

const router: Router = Router();
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/payment", paymentRoutes);
router.use("/library", libraryRoutes);
router.use("/lists", listsRoutes);
router.use("/search", searchRoutes);
export default router;
