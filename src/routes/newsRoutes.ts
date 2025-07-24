import { Router } from "express";
import { searchNews, getPersonalizedNews, getAllAuthors } from "../controllers/newsController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/search", authenticate, searchNews);
router.get("/personalized", authenticate, getPersonalizedNews);
router.get("/authors", authenticate, getAllAuthors);

export default router;
