import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { StatusCodes } from 'http-status-codes'

// [GET] /api/cart
export const getCart = async (req, res) => {
  const userId = req.user._id
  const cart = await Cart.findOne({ user: userId }).populate('items.product')
  res.status(StatusCodes.OK).json(cart || { items: [] })
}

// [POST] /api/cart
export const addToCart = async (req, res) => {
  const userId = req.user._id
  const { productId, quantity } = req.body

  const product = await Product.findById(productId)
  if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found' })

  let cart = await Cart.findOne({ user: userId })
  if (!cart) {
    cart = new Cart({ user: userId, items: [{ product: productId, quantity }] })
  } else {
    const existingItem = cart.items.find(item => item.product.equals(productId))
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ product: productId, quantity })
    }
  }

  await cart.save()
  res.status(StatusCodes.OK).json({ message: 'Thêm vào giỏ hàng thành công!' })
}

// [PUT] /api/cart/:productId
export const updateCartItem = async (req, res) => {
  const userId = req.user._id
  const { quantity } = req.body
  const { productId } = req.params

  const cart = await Cart.findOne({ user: userId })
  if (!cart) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Cart not found' })

  const item = cart.items.find(item => item.product.equals(productId))
  if (!item) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Item not found' })

  item.quantity = quantity
  await cart.save()

  res.status(StatusCodes.OK).json({ message: 'Cập nhật số lượng thành công!' })
}


// [DELETE] /api/cart/:productId
export const removeCartItem = async (req, res) => {
  const userId = req.user._id
  const { productId } = req.params

  const cart = await Cart.findOne({ user: userId })
  if (!cart) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Cart not found' })

  cart.items = cart.items.filter(item => !item.product.equals(productId))
  await cart.save()

  res.status(StatusCodes.OK).json({ message: 'Xoá sản phẩm thành công!' })
}

