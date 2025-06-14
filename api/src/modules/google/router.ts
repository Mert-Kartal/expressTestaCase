import { Router } from "express";
import {
  googleAuthController,
  googleAuthCallbackController,
  googleLogoutController,
  googleRefreshController,
} from "./controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/google", googleAuthController);
router.get("/google/callback", googleAuthCallbackController);
router.get("/logout", authMiddleware, googleLogoutController);
router.get("/refresh", authMiddleware, googleRefreshController);

export default router;
