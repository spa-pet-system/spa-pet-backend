import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  date: { type: Date, required: true }, // Chỉ lưu ngày
  timeSlot: { type: String, required: true }, // "09:00", "10:00"...
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'request_cancel'], default: 'pending' },
  cancelReason: {
    type: String,
    trim: true,
    default: null
  },
  note: { type: String },
  isPaid: { type: Boolean, default: false }
}, { timestamps: true })


const Appointment = mongoose.model('Appointment', appointmentSchema)
export default Appointment

