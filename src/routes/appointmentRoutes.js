import express from 'express'
import { appointmentController } from '../controllers/appointmentController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import multer from 'multer'


const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/appointment/count-by-slot', appointmentController.countBySlot)
router.post('/appointment', appointmentController.addNewAppointment)

export default router