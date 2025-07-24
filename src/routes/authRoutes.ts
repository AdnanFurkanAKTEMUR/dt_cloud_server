import { Router } from "express";
import {
  register,
  login,
  getProfile,
  logout,
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getProfile", authenticate, getProfile);
router.post("/logout", authenticate, logout);

export default router;
