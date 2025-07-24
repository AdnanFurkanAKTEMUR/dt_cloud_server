import { Router } from "express";
import {
  getUserSettings,
  updateUserSettings,
} from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Giriş yapan kullanıcının ayarlarını getirir
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: "Kullanıcı ayarları döner"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                 sources:
 *                   type: array
 *                   items:
 *                     type: string
 *                 authors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: "Yetkisiz"
 *       404:
 *         description: "Kullanıcı bulunamadı"
 *       500:
 *         description: "Hata oluştu"
 */
router.get("/settings", getUserSettings);

/**
 * @swagger
 * /user/settings:
 *   put:
 *     summary: Kullanıcının ayarlarını günceller (ve JWT cookie'yi yeniler)
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               sources:
 *                 type: array
 *                 items:
 *                   type: string
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "5551234567"
 *     responses:
 *       200:
 *         description: "Ayarlar başarıyla güncellendi"
 *       401:
 *         description: "Yetkisiz"
 *       404:
 *         description: "Kullanıcı bulunamadı"
 *       500:
 *         description: "Güncelleme sırasında hata oluştu"
 */
router.put("/settings", updateUserSettings);

export default router;
