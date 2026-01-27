// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import thêm getProductById
const { 
  getProducts, 
  getProductBySlug, 
  getProductById, // <--- Import hàm vừa tạo
  deleteProduct, 
  createProduct, 
  updateProduct,
  createProductReview
} = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');

// --- CÁC ROUTE ---

router.get('/', getProducts);

// 2. Route lấy theo ID (Dùng Regex để ưu tiên bắt ID chuẩn MongoDB trước)
// ([0-9a-fA-F]{24}) nghĩa là: Chỉ nhận chuỗi 24 ký tự hexa (ID của Mongo)
router.get('/:id([0-9a-fA-F]{24})', getProductById);

// 3. Route lấy theo Slug (Chạy sau nếu không khớp ID)
router.get('/:slug', getProductBySlug);

// Các route Admin
router.delete('/:id', protect, admin, deleteProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;