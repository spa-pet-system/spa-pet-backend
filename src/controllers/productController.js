import Product from '~/models/Product';
import { StatusCodes } from 'http-status-codes';

export const getAllProducts = async (req, res) => {
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

export const getProductById = async (req, res) => {
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
