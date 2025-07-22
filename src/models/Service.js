import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  duration: Number // phút
}, { timestamps: true })

const Service = mongoose.model('Service', serviceSchema)
export default Service
