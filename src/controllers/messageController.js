import { MessageModel } from '~/models/Message'

export const getMessagesByUser = async (req, res) => {
  try {
    const userId = req.params.userId
    const messages = await MessageModel.find({
      $or: [{ from: userId }, { to: userId }]
    }).sort({ timestamp: 1 })

    res.status(200).json(messages)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy tin nhắn', error })
  }
}
