import Product from '../models/Product.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from '../config/cloudinary.js';

// Lấy danh sách sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(StatusCodes.OK).json(products);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' });
  }
};

// Thêm sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    console.log(req.body)
    await newProduct.save();
    res.status(StatusCodes.CREATED).json(newProduct);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
};

// Upload ảnh lên Cloudinary
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.json({ url: result.secure_url });
      }
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy sản phẩm theo id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' });
    res.status(StatusCodes.OK).json(product);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' });
  }
};

// Cập nhật sản phẩm theo id
const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
};

// Khóa sản phẩm (set isActive=false)
const lockProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' });
    res.status(StatusCodes.OK).json(product);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' });
  }
};

// Mở khóa sản phẩm (set isActive=true)
const unlockProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' });
    res.status(StatusCodes.OK).json(product);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' });
  }
};

export const productController = {
  getAllProducts,
  createProduct,
  uploadImage,
  getProductById,
  updateProduct,
  lockProduct,
  unlockProduct
};
