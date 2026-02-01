// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import đúng file Controller đã tạo (aiController.js)
const { chatWithAI } = require('../controllers/aiController'); 

// Import Controller cho Admin (giữ nguyên)
const { analyzeCustomerSentiment, analyzeBusinessStrategy } = require('../controllers/aiAdminController');

// Import Middleware bảo vệ
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROUTE CHO KHÁCH (Chatbot) ---
// ✅ SỬA LẠI: Để '/chat' để khớp với Frontend gọi API: /api/ai/chat
router.post('/chat', chatWithAI); 

// --- ROUTE CHO ADMIN (AI Phân tích) ---
router.post('/admin/analyze-customer', protect, admin, analyzeCustomerSentiment);
router.post('/admin/analyze-strategy', protect, admin, analyzeBusinessStrategy);

module.exports = router;