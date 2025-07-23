import NotificationModel from '../models/Notification.js';

export const getNotificationsByUser = async (req, res) => {
  try {
    console.log('getNotificationsByUser');
    const userId = req.user._id; // Assuming user ID is stored in req.user
    console.log('User ID:', userId);
    const notifications = await NotificationModel.find({
      $or: [
        { user: userId },
        { user: null }
      ]
    }).sort({ createdAt: -1 });
    console.log('Notifications:', notifications);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông báo', error });
  }
};

export const sendNotificationToAll = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc nội dung' });
    }
    const notification = await NotificationModel.create({
      user: null,
      type: 'system',
      title,
      content,
      isRead: false
    });
    res.status(201).json({ message: 'Đã gửi thông báo cho tất cả user', notification });
  } catch (err) {
    console.error('Lỗi gửi thông báo:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
