// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();

// ✅ ĐÃ SỬA LỖI: Thêm chữ sendMessage vào trong ngoặc nhọn này
const { accessConversation, getConversations, getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, accessConversation); // Tạo/Mở phòng chat
router.get('/', protect, getConversations); // Lấy danh sách Inbox
router.get('/:conversationId', protect, getMessages); // Lấy tin nhắn
router.post('/message', protect, sendMessage); // Lưu tin nhắn mới

module.exports = router;