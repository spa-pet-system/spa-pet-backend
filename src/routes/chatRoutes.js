import express from 'express';
import { getMessagesByUser } from '../controllers/messageController.js';
import { getNotificationsByUser } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/messages/:userId', getMessagesByUser);
router.get('/notifications/:userId', getNotificationsByUser);
// router.post('/ai', chatWithAI); // Đã bỏ AI chat

export default router;
