import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";

// Create order from cart (for COD payment)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentMethod = "cod" } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Giỏ hàng trống",
      });
    }

    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Sản phẩm "${item.product.name}" chỉ còn ${item.product.stock} trong kho, không đủ cho số lượng ${item.quantity} bạn yêu cầu`,
        });
      }
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);
    const orderCode = paymentMethod === "cod" ? `COD${Date.now()}` : null;
    // Create order
    const newOrder = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      total: total,
      orderCode: orderCode,
      paymentMethod: paymentMethod,
      status: "pending",
    });

    await newOrder.save();

    // Update product stock for COD orders
    const stockUpdates = [];
    try {
      for (const item of cart.items) {
        const updatedProduct = await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(
            `Không thể cập nhật kho cho sản phẩm ${item.product.name}`
          );
        }

        stockUpdates.push({
          productId: item.product._id,
          quantity: item.quantity,
        });
      }

      // Clear cart after successful stock updates
      await Cart.findOneAndDelete({ user: userId });
    } catch (stockError) {
      // Rollback stock updates if any error occurs
      for (const update of stockUpdates) {
        await Product.findByIdAndUpdate(
          update.productId,
          { $inc: { stock: update.quantity } },
          { new: true }
        );
      }

      // Also remove the created order
      await Order.findByIdAndDelete(newOrder._id);

      throw new Error(`Lỗi cập nhật kho: ${stockError.message}`);
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Đặt hàng thành công",
      data: newOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể tạo đơn hàng",
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const totalItems = await Order.countDocuments({ user: userId });

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(StatusCodes.OK).json({
      success: true,
      data: orders,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể lấy danh sách đơn hàng",
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.product", "name price images")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể lấy thông tin đơn hàng",
    });
  }
};

// Update order status (for admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("items.product", "name price images");

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể cập nhật trạng thái đơn hàng",
    });
  }
};

// Đếm tổng số lượng đơn hàng (admin)
export const countOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.status(StatusCodes.OK).json({
      success: true,
      totalOrders
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể đếm số lượng đơn hàng"
    });
  }
};

// Lấy tổng doanh thu (admin)
export const getTotalRevenue = async (req, res) => {
  try {
    // Chỉ tính các đơn đã thanh toán (status: 'paid', 'shipped', 'delivered')
    const paidStatuses = ['paid', 'shipped', 'delivered'];
    const result = await Order.aggregate([
      { $match: { status: { $in: paidStatuses } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);
    const totalRevenue = result[0]?.totalRevenue || 0;
    res.status(StatusCodes.OK).json({
      success: true,
      totalRevenue
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể tính tổng doanh thu"
    });
  }
};

export const orderController = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  countOrders,
  getTotalRevenue,
};
