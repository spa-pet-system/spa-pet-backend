import express from 'express';
import { sendNotificationToAll } from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/notifications', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, sendNotificationToAll);

export default router;
