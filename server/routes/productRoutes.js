const express = require('express');
const router = express.Router();

const { 
  getProducts, 
  getProductBySlug, 
  getProductById, 
  deleteProduct, 
  createProduct, 
  updateProduct,
  createProductReview,
  getRelatedProducts // <--- 1. Nhớ import hàm mới vào
} = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');

// --- CÁC ROUTE CỦA KHÁCH HÀNG ---
router.get('/', getProducts);

// 2. Route mới cho gợi ý (Phải đặt TRÊN cái route /:id động để tránh xung đột đường dẫn)
router.get('/:id([0-9a-fA-F]{24})/related', getRelatedProducts);

// 3. Route lấy theo ID
router.get('/:id([0-9a-fA-F]{24})', getProductById);

// 4. Route lấy theo Slug
router.get('/:slug', getProductBySlug);

// 5. Cổng gửi đánh giá
router.post('/:id/reviews', protect, createProductReview);

// --- CÁC ROUTE CỦA ADMIN ---
router.delete('/:id', protect, admin, deleteProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);

module.exports = router;