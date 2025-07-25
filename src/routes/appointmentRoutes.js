import express from 'express'
import { appointmentController } from '../controllers/appointmentController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import multer from 'multer'


const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/appointment/count-by-slot', appointmentController.countBySlot)
router.post('/appointment', appointmentController.addNewAppointment)

// Get current user's appointment history
router.get('/my-history', authMiddleware.authenTokenCookie, appointmentController.getMyAppointmentHistory)

// Get appointment history for a specific user (accessible by the user themselves or admin)
router.get('/user/:userId/history', authMiddleware.authenTokenCookie, appointmentController.getUserAppointmentHistory)

// Get all appointments (admin only)
router.get('/all', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, appointmentController.getAllAppointments)

// Get appointment by ID (accessible by the user themselves or admin)
router.get('/:appointmentId', authMiddleware.authenTokenCookie, appointmentController.getAppointmentById)

router.post('/:id/cancel-request', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, appointmentController.requestCancel)

export default router