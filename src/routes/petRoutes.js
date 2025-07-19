import express from 'express'
import { petController } from '../controllers/petController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import multer from 'multer'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Pet routes
// router.get('/pets', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.getPetsByUser)
router.get('/pets/:id', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.getPetById)
router.post('/pets', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.createPet)
router.put('/pets/:id', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.updatePet)
router.delete('/pets/:id', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.deletePet)
router.get('/pets', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, petController.getAllPets)

router.post('/pets/create-pet', petController.createPet)    

export default router