import express from 'express'
import { productController } from '~/controllers/productController'

const router = express.Router()

// [GET] /api/products
router.get('/', productController.getAllProducts)

// [GET] /api/products/:id
router.get('/:id', productController.getProductById)

export default router
