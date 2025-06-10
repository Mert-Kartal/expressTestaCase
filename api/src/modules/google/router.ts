import { Router } from "express";
import {
  googleAuthController,
  googleAuthCallbackController,
} from "./controller";

const router = Router();

router.get("/google", googleAuthController);
router.get("/google/callback", googleAuthCallbackController);
export default router;
