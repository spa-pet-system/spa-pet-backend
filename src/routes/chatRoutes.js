import express from 'express'
import { getMessagesByUser } from '~/controllers/messageController'
import { getNotificationsByUser } from '~/controllers/notificationController'

const router = express.Router()

router.get('/messages/:userId', getMessagesByUser)
router.get('/notifications/:userId', getNotificationsByUser)

export default router
