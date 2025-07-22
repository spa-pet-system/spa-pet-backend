import Order from "../models/Order.js";
import { StatusCodes } from "http-status-codes";

// Lấy danh sách tất cả đơn hàng (phân trang, lọc, tìm kiếm)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderCode: { $regex: search, $options: "i" } },
        { total: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean);
    }
    const totalItems = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể lấy danh sách đơn hàng",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate({
        path: "user",
        select: "name email phone address",
      })
      .populate({
        path: "items.product",
        select: "name price images",
      });

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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể lấy thông tin đơn hàng",
    });
  }
};

// Cập nhật trạng thái đơn hàng
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
    ).populate("user", "name email phone").populate("items.product", "name price images");
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể cập nhật trạng thái đơn hàng",
    });
  }
};

// Xóa đơn hàng
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy đơn hàng để xóa",
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể xóa đơn hàng",
    });
  }
};

export const orderAdminController = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
