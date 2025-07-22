import mongoose from 'mongoose'

const priceTableSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service', required: true },
  petType:{
    type: String,
    enum: ['dog', 'cat'],
    required: true },
  minWeight: {
    type: Number,
    required: true }, // kg
  maxWeight: {
    type: Number,
    required: true }, // kg
  price: {
    type: Number,
    required: true }
}, { timestamps: true })

const PriceTable = mongoose.model('PriceTable', priceTableSchema)
export default PriceTable
