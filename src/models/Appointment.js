import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  time: Date,
  roomNumber: Number, // check slot trống
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true })

const Appointment = mongoose.model('Appointment', appointmentSchema)
export default Appointment

