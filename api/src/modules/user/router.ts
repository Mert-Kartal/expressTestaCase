import { Router } from "express";
import {
  authMiddleware,
  roleAuthorizationMiddleware,
} from "../../middleware/auth";
import { getUser, getUserById, getUsers } from "./controller";
import { validateId } from "../../middleware/validation";

const router = Router();

router.get("/", roleAuthorizationMiddleware, getUsers);
router.get("/me", authMiddleware, getUser);
router.get("/:id", roleAuthorizationMiddleware, validateId, getUserById);

export default router;
