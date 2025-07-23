import Product from '../models/Product.js'
import { StatusCodes } from 'http-status-codes'
import cloudinary from '../config/cloudinary.js'

// Lấy danh sách sản phẩm
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
    res.status(StatusCodes.OK).json(products)
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' })
  }
}

// Thêm sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body)
    console.log(req.body)
    await newProduct.save()
    res.status(StatusCodes.CREATED).json(newProduct)
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message })
  }
}

// Upload ảnh lên Cloudinary
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return res.status(500).json({ error })
        res.json({ url: result.secure_url })
      }
    ).end(req.file.buffer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// // Lấy sản phẩm theo id
// const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id)
//     if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' })
//     res.status(StatusCodes.OK).json(product)
//   } catch (err) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' })
//   }
// }

// Cập nhật sản phẩm theo id
const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!updated) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' })
    res.status(StatusCodes.OK).json(updated)
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message })
  }
}

// Khóa sản phẩm (set isActive=false)
const lockProduct = async (req, res) => {
  try {
    console.log('Khóa sản phẩm:', req.params.id)
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isVisible: false },
      { new: true }
    )
    if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' })
    res.status(StatusCodes.OK).json(product)
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' })
  }
}

// Mở khóa sản phẩm (set isActive=true)
const unlockProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isVisible: true },
      { new: true }
    )
    if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' })
    res.status(StatusCodes.OK).json(product)
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' })
  }
}

const getAllProducts = async (req, res) => {
  try {
    const { category, name, page = 1, limit = 8, sort = 'name_asc' } = req.query

    const query = {};
    if (category) query.category = category;
    if (name) query.name = new RegExp(name, 'i');

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 }
    }

    const sortOption = sortOptions[sort] || sortOptions.name_asc

    const parsedLimit = parseInt(limit)
    const skip = (parseInt(page) - 1) * parsedLimit

    const totalProducts = await Product.countDocuments(query)
    const totalPages = Math.ceil(totalProducts / parsedLimit)

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parsedLimit)
      .lean()

    const enrichedProducts = products.map(p => ({
      ...p,
      finalPrice: p.price - (p.price * p.discount / 100)
    }))

    res.status(StatusCodes.OK).json({ products: enrichedProducts, totalPages })
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: err.message
    })
  }
}

// [GET] /api/products/:id - Lấy chi tiết sản phẩm
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Không tìm thấy sản phẩm'
      })
    }

    res.status(StatusCodes.OK).json(product)
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Lỗi khi lấy chi tiết sản phẩm',
      error: err.message
    })
  }
}

export const productController = {
  getAllProducts,
  createProduct,
  uploadImage,
  getProductById,
  updateProduct,
  lockProduct,
  unlockProduct,
  getAllProductsAdmin
}
