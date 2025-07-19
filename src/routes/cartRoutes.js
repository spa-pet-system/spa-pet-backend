import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../controllers/cartController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware.authenTokenCookie, getCart); // 💥 dùng cookie ở cả GET
router.post('/', authMiddleware.authenTokenCookie,authMiddleware.isCustomer, addToCart);

router.put('/:productId', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, updateCartItem);
router.delete('/:productId', authMiddleware.authenTokenCookie, authMiddleware.isCustomer, removeCartItem);

export default router;
