// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import thêm 'getDashboardStats' từ controller
const { 
  createOrder, 
  getAllOrders, 
  getMyOrders, 
  updateOrderStatus,
  getDashboardStats // <--- Thêm cái này
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

// ==================================================
// ✅ ROUTE THỐNG KÊ DASHBOARD (Đặt lên đầu tiên)
// ==================================================
router.get('/dashboard-stats', protect, admin, getDashboardStats);


// --- CÁC ROUTE CŨ (Giữ nguyên) ---

// Route tạo đơn hàng
router.post('/', protect, createOrder); 

// Route Admin xem toàn bộ
router.get('/', protect, admin, getAllOrders);

// Route xem đơn hàng của tôi
router.get('/myorders', protect, getMyOrders);

// Route Admin cập nhật trạng thái
router.put('/:id/deliver', protect, admin, updateOrderStatus);

module.exports = router;