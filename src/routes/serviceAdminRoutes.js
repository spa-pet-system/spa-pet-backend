import express from 'express'
import { serviceAdminController } from '../controllers/serviceAdminController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import multer from 'multer'
import { productController } from '../controllers/productController.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })


// Đếm số lượng dịch vụ đang hoạt động (admin dashboard)
router.get('/services/count', serviceAdminController.countActiveServices)
// Lấy danh sách dịch vụ
router.get('/services', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, serviceAdminController.getAllServices)
// Kích hoạt dịch vụ
router.patch('/services/:id/activate', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, serviceAdminController.activateService)
// Ẩn dịch vụ
router.patch('/services/:id/deactivate', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, serviceAdminController.deactivateService)
// Upload ảnh dịch vụ
router.post('/services/upload-image', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, upload.single('file'), serviceAdminController.uploadImage)
// tạo service
router.post('/services', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, serviceAdminController.createService)
// lấy service theo id
router.get('/services/:id', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, serviceAdminController.getServiceById)
// cập nhật service
router.put('/services/:id', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, serviceAdminController.updateService)


export default router