import express from 'express'
import { authController } from '~/controllers/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { authValidation } from '~/validations/authValidation'
import { userController } from '~/controllers/userController'
import multer from 'multer'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/register', authValidation.registerByPhone, authController.registerByPhone)
router.post('/login', authValidation.login, authController.login)
router.post('/logout', authController.logout)
router.get('/me', authMiddleware.authenTokenCookie, userController.getProfile)
router.get('/user-profile', authMiddleware.authenTokenCookie, userController.getUserProfile)
router.put('/profile', authMiddleware.authenTokenCookie, upload.single('avatar'), authValidation.updateProfile, userController.updateProfile)
router.post('/upload-avatar', authMiddleware.authenTokenCookie, upload.single('avatar'), userController.uploadAvatar)
router.put('/change-password', authValidation.changePassword, authMiddleware.authenTokenCookie, userController.changePassword)

export default router
