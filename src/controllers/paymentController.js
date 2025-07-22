import PayOS from "@payos/node";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { StatusCodes } from "http-status-codes";
import { env } from "~/config/environment";

// Initialize PayOS
const payOS = new PayOS(
  env.PAYOS_CLIENT_ID,
  env.PAYOS_API_KEY,
  env.PAYOS_CHECKSUM_KEY
);

// Create payment link for QR payment
export const createPaymentLink = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, total } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Items are required and must be a non-empty array",
      });
    }

    if (!total || total <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Total amount must be greater than 0",
      });
    }

    // Generate unique order code
    const orderCode = Date.now();

    // Get client URL from environment or use default
    const CLIENT_URL = (env.CLIENT_URL || "http://localhost:5173").replace(
      /\/$/,
      ""
    );

    // Prepare payment data for PayOS
    const paymentData = {
      orderCode: orderCode,
      amount: total,
      description: `Order #${orderCode}`,
      items: items.map((item) => ({
        name: item.name || "Sản phẩm Pet Spa",
        quantity: item.quantity || 1,
        price: item.price || 0,
      })),
      returnUrl: `${CLIENT_URL}/cart?payment=success&orderCode=${orderCode}`,
      cancelUrl: `${CLIENT_URL}/cart?payment=cancelled&orderCode=${orderCode}`,
    };

    // Create payment link with PayOS
    const paymentLink = await payOS.createPaymentLink(paymentData);

    // Create order in database with pending status
    const newOrder = new Order({
      user: userId,
      items: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      total: total,
      orderCode: orderCode.toString(),
      paymentMethod: "qr",
      status: "pending",
    });

    await newOrder.save();

    // Return success response with checkout URL
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Payment link created successfully",
      data: {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode: orderCode,
        orderId: newOrder._id,
      },
    });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi hệ thống, vui lòng thử lại sau",
    });
  }
};

// Handle payment success confirmation from PayOS
export const confirmPaymentSuccess = async (req, res) => {
  try {
    const { orderCode } = req.body;

    if (!orderCode) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Order code is required",
      });
    }

    // Find the pending order
    const order = await Order.findOne({
      orderCode: orderCode.toString(),
      status: "pending",
    }).populate("items.product");

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Order not found or already processed",
      });
    }

    // Verify payment status with PayOS
    try {
      const paymentInfo = await payOS.getPaymentLinkInformation(orderCode);

      if (paymentInfo.status !== "PAID") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Payment not confirmed by PayOS",
        });
      }
    } catch (payosError) {
      console.error("PayOS verification error:", payosError);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Unable to verify payment with PayOS",
      });
    }

    // Check stock availability before processing
    for (const item of order.items) {
      if (item.product.stock < item.quantity) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Insufficient stock for product "${item.product.name}". Available: ${item.product.stock}, Required: ${item.quantity}`,
        });
      }
    }

    // Update order status to paid
    order.status = "paid";
    order.paidAt = new Date();
    await order.save();

    // Decrease product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: order.user },
      { $set: { items: [] } },
      { new: true }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Payment confirmed and order processed successfully",
      data: {
        orderId: order._id,
        orderCode: order.orderCode,
        status: order.status,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Confirm Payment Success Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to process payment confirmation",
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    // Get payment info from PayOS
    const paymentInfo = await payOS.getPaymentLinkInformation(orderCode);

    res.status(StatusCodes.OK).json({
      success: true,
      data: paymentInfo,
    });
  } catch (error) {
    console.error("Get Payment Status Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể lấy thông tin thanh toán",
    });
  }
};

export const paymentController = {
  createPaymentLink,
  confirmPaymentSuccess,
  getPaymentStatus,
};
