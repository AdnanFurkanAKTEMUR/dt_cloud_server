import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getAvailableNewsFilters } from "../controllers/getAvailableNewsFilters";

const router = Router();

/**
 * @swagger
 * /filters/getAvaliableFilters:
 *   get:
 *     summary: API'lerden gelen haber kaynaklarını, yazarları ve kategorileri döner
 *     tags: [Filters]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: "Başarılı yanıt"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                 authors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 sources:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       sourceType:
 *                         type: string
 *                         enum: [newsapi, guardian]
 *       401:
 *         description: "Yetkisiz"
 *       500:
 *         description: "API'lerden veri alınırken hata oluştu"
 */
router.get("/getAvaliableFilters", authenticate, getAvailableNewsFilters);

export default router;
