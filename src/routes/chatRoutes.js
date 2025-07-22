import express from 'express'
import { getMessagesByUser } from '~/controllers/messageController'
import { getNotificationsByUser } from '~/controllers/notificationController'
import { chatWithAI } from '~/controllers/aiChatController'

const router = express.Router()

router.get('/messages/:userId', getMessagesByUser)
router.get('/notifications/:userId', getNotificationsByUser)
router.post('/ai', chatWithAI)

export default router
