import express from 'express'
import { priceTableController } from '~/controllers/priceTableController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Price table routes
router.get('/', priceTableController.getPriceTable)
router.post('/', priceTableController.createPriceTableEntry)

export default router