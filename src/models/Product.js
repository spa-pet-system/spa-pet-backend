import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  images: [String],
  category: {
    type: String,
    enum: [
      'Clothing',
      'Leashes and Muzzles',
      'Feeding Tools',
      'Pet Toys',
      'Beds and Mats'
    ]
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)
export default Product
