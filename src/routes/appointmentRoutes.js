import express from 'express'
import { appointmentController } from '../controllers/appointmentController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Get current user's appointment history
router.get('/my-history', 
  authMiddleware.authenTokenCookie, 
  appointmentController.getMyAppointmentHistory
)

// Get appointment history for a specific user (accessible by the user themselves or admin)
router.get('/user/:userId/history', 
  authMiddleware.authenTokenCookie, 
  appointmentController.getUserAppointmentHistory
)

// Get all appointments (admin only)
router.get('/all', 
  authMiddleware.authenTokenCookie, 
  authMiddleware.isAdmin, 
  appointmentController.getAllAppointments
)

// Get appointment by ID (accessible by the user themselves or admin)
router.get('/:appointmentId', 
  authMiddleware.authenTokenCookie, 
  appointmentController.getAppointmentById
)

export default router