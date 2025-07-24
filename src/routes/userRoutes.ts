import { Router } from "express";
import {
  getUserSettings,
  updateUserSettings,
} from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/settings", getUserSettings);
router.put("/settings", updateUserSettings);

export default router;
