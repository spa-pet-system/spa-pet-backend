import express from 'express'
import { authController } from '~/controllers/authController.js'
import { authValidation } from '~/validations/authValidation.js'

const router = express.Router()

router.post('/register', authValidation.registerByPhone, authController.registerByPhone)
router.post('/login', authController.login)

export default router
