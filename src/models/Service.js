import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
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
  price: {
    type: Number,
    required: true,
    min: 0
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
  }
}, { timestamps: true })


const Service = mongoose.model('Service', serviceSchema)
export default Service