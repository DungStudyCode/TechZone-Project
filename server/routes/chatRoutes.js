// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { 
  accessConversation, 
  getConversations, 
  getMessages, 
  sendMessage,
  markAsRead,
  deleteConversation // ✅ ĐÃ THÊM HÀM XÓA
} = require('../controllers/chatController');

router.post('/', protect, accessConversation); 
router.get('/', protect, getConversations); 
router.get('/:conversationId', protect, getMessages); 
router.post('/message', protect, sendMessage); 
router.put('/:conversationId/read', protect, markAsRead); 

// ✅ ROUTE MỚI: Tiếp nhận yêu cầu xóa từ Client
router.delete('/:conversationId', protect, deleteConversation); 

module.exports = router;