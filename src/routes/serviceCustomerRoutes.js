import express from 'express'
import { serviceCustomerController } from '../controllers/serviceCustomerController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import multer from 'multer'


const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/service', serviceCustomerController.getAllServices)
router.get('/service/:slug', authMiddleware.authenTokenCookie, serviceCustomerController.getServiceBySlug)

router.post('/service/upload-image', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, upload.single('file'), serviceCustomerController.uploadImage)

//test
router.get('/service-test/:slug', serviceCustomerController.getServiceBySlug)
router.get('/service-test', serviceCustomerController.getAllServices)
export default router