import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['grooming', 'washing'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  detail: {
    type: String
  },
  duration: {
    type: Number, // phút
    required: true,
    min: 1
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  slot: {
    type: Number,
    required: true,
    default: 3,
    min: 1
  },
  timeSlots :[{
    type: String,
    required: true,
    default: '09:00'
  }],
  slug: {
    type: String,
    trim: true,
    required: true,
    unique: true
  }
}, { timestamps: true })


const Service = mongoose.model('Service', serviceSchema)
export default Service