// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();

// ✅ Đảm bảo import ĐỦ cả 2 hàm từ Controller
const { createPaymentUrl, vnpayReturn } = require('../controllers/vnpayController');
const { protect } = require('../middleware/authMiddleware'); 

// 1. Tuyến đường tạo Link thanh toán (Cần đăng nhập)
router.post('/vnpay_url', protect, createPaymentUrl);

// 2. Tuyến đường hứng kết quả VNPay trả về (Frontend gọi)
// 🛑 Lưu ý: Tuyến đường này KHÔNG bọc middleware protect
router.get('/vnpay_return', vnpayReturn);

module.exports = router;