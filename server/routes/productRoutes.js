// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug } = require('../controllers/productController');

// Đường dẫn gốc: /api/products
router.get('/', getProducts);

// Đường dẫn chi tiết: /api/products/iphone-15-pro-max
router.get('/:slug', getProductBySlug);

module.exports = router;