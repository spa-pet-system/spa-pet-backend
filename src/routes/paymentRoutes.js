import express from 'express'
import { paymentController } from '../controllers/paymentController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Create payment link for QR payment (requires authentication)
router.post('/create-payment-link', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, paymentController.createPaymentLink)

// Confirm payment success (requires authentication)
router.post('/confirm-payment', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, paymentController.confirmPaymentSuccess)

// Get payment status (requires authentication)
router.get('/status/:orderCode', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, paymentController.getPaymentStatus)

export default router