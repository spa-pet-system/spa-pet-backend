import express from 'express'
import { petController } from '../controllers/petController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import upload from '../middlewares/multer.js'

const router = express.Router()

// Pet routes
// router.get('/pets', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.getPetsByUser)
router.get('/pets/:id', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.getPetById)
router.post('/pets', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, upload.single('image'), petController.createPet)
router.put('/pets/:id', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.updatePet)
router.delete('/pets/:id', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.deletePet)
router.get('/pets', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.getAllPets)

router.post('/pets/create-pet', petController.createPet)
// Đếm tổng số lượng thú cưng đã phục vụ (admin dashboard)
router.get('/pets/admin/count', authMiddleware.authenTokenCookie, authMiddleware.isAdmin, petController.countAllPets)

export default router