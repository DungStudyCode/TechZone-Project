const express = require('express');
const router = express.Router();

const { createOrder, getAllOrders } = require('../controllers/orderController');

// Tạo đơn hàng mới
router.post('/', createOrder);
// Lấy tất cả đơn hàng
router.get('/', getAllOrders);
module.exports = router;