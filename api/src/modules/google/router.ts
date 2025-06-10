import { Router } from "express";
import { googleAuthController } from "./controller";

const router = Router();

router.get("/google", googleAuthController);
export default router;
