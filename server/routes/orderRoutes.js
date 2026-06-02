// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// ✅ Chỉ import những hàm đang thực sự được dùng từ Controller
const { 
  createOrder, 
  getAllOrders, 
  getMyOrders,
  getOrderById, 
  updateOrderStatus, // Hàm All-in-one quản lý trạng thái
  getDashboardStats
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

// ==================================================
// ✅ ROUTE THỐNG KÊ DASHBOARD
// ==================================================
router.get('/dashboard-stats', protect, admin, getDashboardStats);

// ==================================================
// ✅ CÁC ROUTE ĐƠN HÀNG CƠ BẢN
// ==================================================
router.post('/', protect, createOrder); 
router.get('/', protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// ==================================================
// ✅ ROUTE CẬP NHẬT TRẠNG THÁI (MỚI)
// ==================================================
// Gom 3 route cũ (deliver, confirm, success) thành 1 route duy nhất
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;