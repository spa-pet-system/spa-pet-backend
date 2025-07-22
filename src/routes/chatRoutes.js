import express from 'express'
import { getMessagesByUser } from '../controllers/messageController.js'
import { getNotificationsByUser } from '../controllers/notificationController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/messages/:userId', getMessagesByUser)
router.get('/notifications', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, getNotificationsByUser)
// router.post('/ai', chatWithAI); // Đã bỏ AI chat

export default router
