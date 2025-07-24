import { Router } from "express";
import {
  register,
  login,
  getProfile,
  logout,
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Pass1234
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "5551234567"
 *     responses:
 *       201:
 *         description: "Kullanıcı oluşturuldu"
 *       400:
 *         description: "Email zaten kayıtlı"
 *       500:
 *         description: "Sunucu hatası"
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Pass1234
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *       400:
 *         description: Geçersiz bilgiler
 *       500:
 *         description: Sunucu hatası
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/getProfile:
 *   get:
 *     summary: Giriş yapan kullanıcının profil bilgilerini getirir
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri
 *       401:
 *         description: Yetkisiz
 *       500:
 *         description: Sunucu hatası
 */
router.get("/getProfile", authenticate, getProfile);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Kullanıcı çıkışı
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Çıkış başarılı
 */
router.post("/logout", authenticate, logout);

export default router;
