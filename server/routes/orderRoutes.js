// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// 1. SỬA LỖI CHÍNH TẢ Ở ĐÂY: getOrderById (Thêm chữ 'r')
const { 
  createOrder, 
  getAllOrders, 
  getMyOrders,
  getOrderById, // ✅ Đã sửa từ getOderById thành getOrderById
  updateOrderStatus,
  getDashboardStats,
  confirmOrder, // ✅ Thêm dòng này
  markOrderAsSuccess // ✅ Thêm dòng này

} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

// ==================================================
// ✅ ROUTE THỐNG KÊ DASHBOARD
// ==================================================
router.get('/dashboard-stats', protect, admin, getDashboardStats);

// --- CÁC ROUTE CŨ ---

router.post('/', protect, createOrder); 

router.get('/', protect, admin, getAllOrders);

router.get('/myorders', protect, getMyOrders);

// Route xem chi tiết đơn hàng (Giờ đã khớp với biến import ở trên)
router.get('/:id', protect, getOrderById);

router.put('/:id/deliver', protect, admin, updateOrderStatus);
// ✅ ROUTE MỚI: Admin xác nhận đơn hàng
router.put('/:id/confirm', protect, admin, confirmOrder);
router.put('/:id/success', protect, markOrderAsSuccess);
module.exports = router;