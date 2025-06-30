import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import multer from "multer";
import { productController } from '../controllers/productController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Sản phẩm
router.get("/products", authMiddleware.authenTokenCookie, authMiddleware.isAdmin, productController.getAllProducts);
router.post("/products", authMiddleware.authenTokenCookie, authMiddleware.isAdmin, productController.createProduct);
router.post("/products/upload-image", authMiddleware.authenTokenCookie, authMiddleware.isAdmin, upload.single("file"), productController.uploadImage);
// Lấy sản phẩm theo id
router.get("/products/:id", authMiddleware.authenTokenCookie, authMiddleware.isAdmin, productController.getProductById);
router.put("/products/:id", authMiddleware.authenTokenCookie, authMiddleware.isAdmin, productController.updateProduct);

// Khóa/mở khóa sản phẩm
router.patch("/products/:id/lock", authMiddleware.authenTokenCookie, authMiddleware.isAdmin, productController.lockProduct);
router.patch("/products/:id/unlock", authMiddleware.authenTokenCookie, authMiddleware.isAdmin, productController.unlockProduct);
export default router; 