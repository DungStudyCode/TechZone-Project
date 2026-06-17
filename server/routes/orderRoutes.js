// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// ✅ Đã thêm markOrderAsSuccess vào danh sách import
const { 
  createOrder, 
  getAllOrders, 
  getMyOrders,
  getOrderById, 
  updateOrderStatus, 
  cancelOrder, 
  markOrderAsSuccess, // <-- Thêm hàm này
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
// Route cho Admin quản lý trạng thái
router.put('/:id/status', protect, admin, updateOrderStatus);

// ROUTE HỦY ĐƠN (Dành cho Khách hàng)
router.put('/:id/cancel', protect, cancelOrder);

// ✅ ROUTE XÁC NHẬN ĐÃ NHẬN HÀNG (Dành cho Khách hàng)
router.put('/:id/success', protect, markOrderAsSuccess); // <-- Khai báo Route ở đây

module.exports = router;