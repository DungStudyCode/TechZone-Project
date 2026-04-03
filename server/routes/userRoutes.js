// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import hàm từ Controller (✅ ĐÃ BỔ SUNG THÊM 2 HÀM WISHLIST)
const { 
  registerUser, 
  loginUser, 
  getUsersCRM, 
  sendMarketingEmail,
  getUserProfile,
  updateUserProfile,
  getWishlist,        // <-- MỚI THÊM
  toggleWishlist      // <-- MỚI THÊM
} = require('../controllers/userController');

// 2. Import Middleware xác thực
const { protect, admin } = require('../middleware/authMiddleware');


// --- CÁC ROUTE CÔNG KHAI ---
router.post('/', registerUser);       // Đăng ký
router.post('/login', loginUser);     // Đăng nhập


// --- CÁC ROUTE CÁ NHÂN (YÊU CẦU ĐĂNG NHẬP) ---
// Profile: GET để lấy thông tin, PUT để cập nhật
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// ✅ ROUTE CHO SẢN PHẨM YÊU THÍCH (WISHLIST)
router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, toggleWishlist);


// --- CÁC ROUTE ADMIN ---
// Route lấy dữ liệu CRM
router.get('/crm', protect, admin, getUsersCRM);

// ROUTE GỬI EMAIL
router.post('/send-email', protect, admin, sendMarketingEmail);

// Bắt buộc phải nằm ở cuối cùng
module.exports = router;