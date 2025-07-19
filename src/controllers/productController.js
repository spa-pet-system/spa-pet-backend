import Product from '~/models/Product';
import { StatusCodes } from 'http-status-codes';

// [GET] /api/products - Lấy tất cả sản phẩm
export const getAllProducts = async (req, res) => {
  try {
    const { category, name } = req.query;
    const query = {};
    if (category) query.category = category;
    if (name) query.name = new RegExp(name, 'i');

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json(products);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: err.message,
    });
  }
};

// [GET] /api/products/:id - Lấy chi tiết sản phẩm
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Không tìm thấy sản phẩm',
      });
    }

    res.status(StatusCodes.OK).json(product);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Lỗi khi lấy chi tiết sản phẩm',
      error: err.message,
    });
  }
};
