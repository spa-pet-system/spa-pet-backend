import Appointment from '../models/Appointment.js';
import { StatusCodes } from 'http-status-codes';
import Notification from '../models/Notification.js';

// Lấy danh sách lịch hẹn theo trạng thái cụ thể
export const getPendingAppointments = async (req, res) => {
  return getAppointmentsByStatus(req, res, 'pending');
};
export const getConfirmedAppointments = async (req, res) => {
  return getAppointmentsByStatus(req, res, 'confirmed');
};
export const getInProgressAppointments = async (req, res) => {
  return getAppointmentsByStatus(req, res, 'in_progress');
};
export const getWatingPaymentAppointments = async (req, res) => {
  return getAppointmentsByStatus(req, res, 'waiting_payment');
};
export const getCompletedAppointments = async (req, res) => {
  return getAppointmentsByStatus(req, res, 'completed');
};
export const getCancelledAppointments = async (req, res) => {
  return getAppointmentsByStatus(req, res, 'cancelled');
};
export const getRequestCancelAppointments = async (req, res) => {
  return getAppointmentsByStatus(req, res, 'request_cancel');
};


async function getAppointmentsByStatus(req, res, status) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = { status };

    // Nếu có từ khóa tìm kiếm theo tên khách
    const appointments = await Appointment.find(query)
      .populate({
        path: "user",
        select: "name email phone gender address dob avatar",
        match: search
          ? { name: { $regex: search, $options: "i" } } // ✅ chỉ tìm theo tên khách
          : undefined,
      })
      .populate({
        path: "pet",
        select: "name petType breed age weight image",
      })
      .populate({
        path: "service",
        select: "name type description duration image",
      })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    // Lọc kết quả chỉ giữ lại các lịch hẹn có user khớp tên
    const filteredAppointments = appointments.filter(app => app.user !== null);

    const totalItems = filteredAppointments.length;
    const totalPages = Math.ceil(totalItems / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      data: filteredAppointments,
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Không thể lấy danh sách lịch hẹn",
    });
  }
}

// Lấy chi tiết lịch hẹn
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'user',
        select: 'name email phone gender address dob avatar',
      })
      .populate({
        path: 'pet',
        select: 'name petType breed age weight image',
      })
      .populate({
        path: 'service',
        select: 'name type description duration image',
      });
    if (!appointment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn',
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: appointment ? { ...appointment.toObject(), cancelReason: appointment.cancelReason || null } : null,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Không thể lấy thông tin lịch hẹn',
    });
  }
};

// Cập nhật trạng thái lịch hẹn
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    console.log('Cập nhật trạng thái lịch hẹn:', status);
    // Thêm 'awaiting_payment' và 'paid' vào danh sách các status hợp lệ
    const validStatuses = [
      'pending',
      'confirmed',
      'in_progress',       // nhân viên đang làm dịch vụ
      'waiting_payment',  // nhân viên báo xong, chờ khách trả
      'paid',              // khách đã thanh toán
      'completed',
      'cancelled',
      'request_cancel'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }

    // Lấy appointment ban đầu để kiểm tra/update isPaid
    const appointmentDoc = await Appointment.findById(appointmentId);
    if (!appointmentDoc) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn',
      });
    }

    // Update status
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true },
    )
    .populate('user', 'name email phone')
    .populate('pet', 'name breed age')
    .populate('service', 'name price description');

    // Tạo notification cho user
    let notifTitle   = 'Cập nhật lịch hẹn';
    let notifContent = '';
    switch (status) {
      case 'confirmed':
        notifContent = `Lịch hẹn của bạn đã được xác nhận.`;
        break;
      case 'in_progress':
        notifContent = `Nhân viên đang thực hiện dịch vụ cho bạn.`;
        break;
      case 'waiting_payment':
        notifContent = `Dịch vụ đã hoàn tất, vui lòng thanh toán để hoàn tất lịch hẹn.`;
        break;
      case 'paid':
        notifContent = `Bạn đã thanh toán thành công. Cảm ơn bạn!`;
        break;
      case 'completed':
        notifContent = `Lịch hẹn của bạn đã hoàn thành.`;
        break;
      case 'cancelled':
        notifContent = `Lịch hẹn của bạn đã bị hủy.`;
        break;
      case 'request_cancel':
        notifContent = `Yêu cầu hủy lịch hẹn của bạn đã được ghi nhận.`;
        break;
      case 'pending':
        notifContent = `Lịch hẹn của bạn đang chờ xác nhận.`;
        break;
      default:
        notifContent = `Lịch hẹn của bạn đã được cập nhật trạng thái: ${status}`;
    }
    if (appointment.user && appointment.user._id) {
      await Notification.create({
        user:    appointment.user._id,
        type:    'appointment',
        title:   notifTitle,
        content: notifContent,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật trạng thái lịch hẹn thành công',
      data:    appointment,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Không thể cập nhật trạng thái lịch hẹn',
    });
  }
};


// Xóa lịch hẹn
export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByIdAndDelete(appointmentId);
    if (!appointment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn để xóa',
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Xóa lịch hẹn thành công',
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Không thể xóa lịch hẹn',
    });
  }
};

export const appointmentAdminController = {
  getPendingAppointments,
  getConfirmedAppointments,
  getInProgressAppointments,
  getWatingPaymentAppointments,
  getCompletedAppointments,
  getCancelledAppointments,
  getRequestCancelAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
};
