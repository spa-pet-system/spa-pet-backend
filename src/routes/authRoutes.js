import express from 'express'
import { authController } from '~/controllers/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { authValidation } from '~/validations/authValidation'
import { userController } from '~/controllers/userController'

const router = express.Router()

router.post('/register', authValidation.registerByPhone, authController.registerByPhone)
router.post('/login', authValidation.login, authController.login)
router.post('/logout', authController.logout)
router.get('/me', authMiddleware.authenTokenCookie, userController.getProfile)

export default router
