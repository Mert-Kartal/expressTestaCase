import { Router } from "express";
import {
  googleAuthController,
  googleAuthCallbackController,
  googleLogoutController,
  googleRefreshController,
  googleRoleController,
} from "./controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/google", googleAuthController);
router.get("/google/callback", googleAuthCallbackController);
router.get("/logout", authMiddleware, googleLogoutController);
router.get("/refresh", authMiddleware, googleRefreshController);
router.get("/role", authMiddleware, googleRoleController);

export default router;
