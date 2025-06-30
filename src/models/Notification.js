import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // nếu null: gửi toàn server
  type: { type: String, enum: ['system', 'payment', 'appointment', 'reminder'] },
  title: String,
  content: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true })

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
