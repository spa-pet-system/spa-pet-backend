const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyAdmin } = require('../middlewares/authMiddleware'); // middleware kiểm tra admin

router.post('/notifications', verifyAdmin, async (req, res) => {
  try {
    const { content, recipients } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Nội dung không được để trống' });
    }

    // recipients = [] nghĩa gửi tất cả
    const notification = new Notification({
      content,
      recipients,
    });

    await notification.save();

    // TODO: phát thông báo qua socket cho khách hàng nhận

    return res.status(201).json({ message: 'Thông báo đã được gửi' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
