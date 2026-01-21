const express = require('express');
const router = express.Router();

// Import Controller xử lý logic (file mà chúng ta đã viết code RAG tìm sản phẩm)
// Lưu ý: Kiểm tra kỹ tên file controller của bạn là 'aiClientController.js' hay 'aiController.js'
const aiController = require('../controllers/aiClientController'); 

// --- ĐỊNH NGHĨA ROUTE ---

// Frontend gọi: POST /api/ai/client/chat
// Server.js đã lo phần: /api/ai
// Tại đây ta chỉ cần hứng phần đuôi: /client/chat
router.post('/client/chat', aiController.chatWithAI);

module.exports = router;