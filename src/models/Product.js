import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // phần trăm giảm giá
  stock: { type: Number, default: 0 }, // số lượng tồn kho
  images: [String], // nhiều ảnh
  category: { type: String } // ví dụ: "đồ ăn", "đồ chơi"
}, { timestamps: true })


// Virtual field: tính giá sau giảm
productSchema.virtual('finalPrice').get(function () {
  return this.price - (this.price * this.discount / 100)
})

// Instance method: kiểm tra hết hàng
productSchema.methods.isOutOfStock = function () {
  return this.stock <= 0
}

// Static method: tìm theo tên gần giống
productSchema.statics.searchByName = function (keyword) {
  return this.find({ name: new RegExp(keyword, 'i') })
}

// Middleware: log khi tạo sản phẩm mới
productSchema.pre('save', function (next) {
  console.log(`Đang lưu sản phẩm mới: ${this.name}`)
  next()
})

const Product = mongoose.model('Product', productSchema)
export default Product
