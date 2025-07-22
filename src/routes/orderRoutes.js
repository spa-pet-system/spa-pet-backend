import express from 'express'
import { orderController } from '../controllers/orderController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Customer order routes
router.post('/', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, orderController.createOrder)

router.get('/', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, orderController.getUserOrders)

router.get('/:orderId', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, orderController.getOrderById)

// Admin order routes
router.put('/:orderId/status', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, orderController.updateOrderStatus)

export default router