// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route tạo đơn hàng (BẮT BUỘC PHẢI CÓ 'protect' để lấy ID user)
router.post('/', protect, createOrder); 

// Route Admin xem toàn bộ
router.get('/', protect, admin, getAllOrders);

// Route xem đơn hàng của tôi
router.get('/myorders', protect, getMyOrders);

// Route Admin cập nhật trạng thái
router.put('/:id/deliver', protect, admin, updateOrderStatus);

module.exports = router;