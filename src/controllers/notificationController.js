import { NotificationModel } from '~/models/Notification'

export const getNotificationsByUser = async (req, res) => {
  try {
    const userId = req.params.userId
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json(notifications)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông báo', error })
  }
}
