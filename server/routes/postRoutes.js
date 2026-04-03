// server/routes/postRoutes.js
const express = require('express');
const router = express.Router();

// Import CẦN ĐẦY ĐỦ các hàm từ Controller
const { 
  createPost, 
  getAllPosts, 
  getPostById, 
  togglePostStatus, 
  deletePost 
} = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware'); 

// Khai báo các Routes
router.post('/', protect, createPost);                 // Đăng bài
router.get('/', getAllPosts);                          // Lấy danh sách (Có lọc bán kính)
router.get('/:id', getPostById);                       // Xem chi tiết
router.put('/:id/status', protect, togglePostStatus);  // Đánh dấu đã bán / còn hàng
router.delete('/:id', protect, deletePost);            // Xóa bài

module.exports = router;