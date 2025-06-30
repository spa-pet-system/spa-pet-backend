import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],
  total: Number,
  paymentMethod: { type: String, enum: ['cod', 'momo', 'zalo', 'paypal'], default: 'cod' },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending' }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)
export default Order
