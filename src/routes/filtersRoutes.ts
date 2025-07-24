import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";
import { getAvailableNewsFilters } from "../controllers/getAvailableNewsFilters";

const router = Router();

router.get("/getAvaliableFilters", authenticate, getAvailableNewsFilters);

export default router;
