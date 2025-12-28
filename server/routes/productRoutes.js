const express = require('express');
const router = express.Router();
// Import thêm updateProduct
const { getProducts, getProductBySlug, deleteProduct, createProduct, updateProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/', protect, admin, createProduct);

// Route cập nhật (Chỉ Admin)
router.put('/:id', protect, admin, updateProduct);

module.exports = router;