// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();

// Import Controller
const { chatWithAI } = require('../controllers/aiClientController'); // Chatbot cũ
const { analyzeCustomerSentiment, analyzeBusinessStrategy } = require('../controllers/aiAdminController'); // Admin mới

// Import Middleware bảo vệ
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROUTE CHO KHÁCH (Chatbot) ---
router.post('/client/chat', chatWithAI);

// --- ROUTE CHO ADMIN (AI Phân tích) ---
// Yêu cầu: Đăng nhập + Là Admin
router.post('/admin/analyze-customer', protect, admin, analyzeCustomerSentiment);
router.post('/admin/analyze-strategy', protect, admin, analyzeBusinessStrategy);

module.exports = router;