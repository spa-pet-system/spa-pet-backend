import express from 'express'
import { userAdminController } from '../controllers/userAdminController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { orderAdminController } from '../controllers/orderAdminController.js'
import { appointmentAdminController } from '../controllers/appointmentAdminController.js'

const router = express.Router()

// USER
// Lấy danh sách user
router.get('/users', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, userAdminController.getAllUsers)
// Block user
router.patch('/users/:id/block', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, userAdminController.blockUser)
// Unlock user
router.patch('/users/:id/unlock', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, userAdminController.unlockUser)

// ĐƠN HÀNG
// Lấy danh sách đơn hàng
router.get('/orders', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, orderAdminController.getAllOrders)
// Lấy chi tiết đơn hàng
router.get('/orders/:orderId', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, orderAdminController.getOrderById)
// Cập nhật trạng thái đơn hàng
router.put('/orders/:orderId/status', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, orderAdminController.updateOrderStatus)
// Xóa đơn hàng
router.delete('/orders/:orderId', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, orderAdminController.deleteOrder)

// LỊCH HẸN
// Lấy danh sách lịch hẹn theo từng trạng thái
router.get('/appointments/pending', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentAdminController.getPendingAppointments)
router.get('/appointments/confirmed', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentAdminController.getConfirmedAppointments)
router.get('/appointments/completed', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentAdminController.getCompletedAppointments)
router.get('/appointments/cancelled', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentAdminController.getCancelledAppointments)
router.get('/appointments/request-cancel', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentAdminController.getRequestCancelAppointments)
// Lấy chi tiết lịch hẹn
router.get('/appointments/:appointmentId', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentAdminController.getAppointmentById)
// Cập nhật trạng thái lịch hẹn
router.put('/appointments/:appointmentId/status', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentAdminController.updateAppointmentStatus)
// Xóa lịch hẹn
router.delete('/appointments/:appointmentId', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentAdminController.deleteAppointment)


export default router
