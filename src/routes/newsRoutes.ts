import { Router } from "express";
import {
  searchNews,
  getPersonalizedNews,
  getAllAuthors,
} from "../controllers/newsController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /news/search:
 *   get:
 *     summary: Arama kriterlerine göre haberleri getirir (NewsAPI ve/veya Guardian)
 *     tags: [News]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: "Arama kelimesi (varsayılan: technology)"
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: "Başlangıç tarihi (YYYY-MM-DD)"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: "Bitiş tarihi (YYYY-MM-DD)"
 *       - in: query
 *         name: sources
 *         schema:
 *           type: string
 *         description: "Virgülle ayrılmış haber kaynakları (sadece NewsAPI)"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevancy, popularity, publishedAt]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *           enum: [newsapi, guardian, both]
 *           default: both
 *     responses:
 *       200:
 *         description: Haberler başarıyla getirildi
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.get("/search", authenticate, searchNews);

/**
 * @swagger
 * /news/personalized:
 *   get:
 *     summary: Kullanıcı tercihine göre kişiselleştirilmiş haberleri getirir
 *     tags: [News]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *           enum: [newsapi, guardian, both]
 *           default: both
 *         description: Hangi sağlayıcıdan veri alınacağı
 *     responses:
 *       200:
 *         description: Kişiselleştirilmiş haberler getirildi
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.get("/personalized", authenticate, getPersonalizedNews);

/**
 * @swagger
 * /news/authors:
 *   get:
 *     summary: NewsAPI ve Guardian'dan gelen tüm yazarları getirir
 *     tags: [News]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: "Yazar listesi başarıyla getirildi"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: "Yazarlar alınamadı"
 */
router.get("/authors", authenticate, getAllAuthors);

export default router;
