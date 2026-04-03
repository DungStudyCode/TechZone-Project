// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import đúng file Controller đã tạo (aiController.js)
// ✅ BƯỚC 1 SỬA Ở ĐÂY: Thêm generateMarketingEmail vào import
const { chatWithAI, generateMarketingEmail } = require('../controllers/aiController'); 

// Import Controller cho Admin (giữ nguyên)
const { analyzeCustomerSentiment, analyzeBusinessStrategy } = require('../controllers/aiAdminController');

// Import Middleware bảo vệ
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROUTE CHO KHÁCH (Chatbot) ---
router.post('/chat', chatWithAI); 

// --- ROUTE MỚI: AI TẠO EMAIL MARKETING (Chỉ Admin mới dùng được) ---
// ✅ BƯỚC 2 SỬA Ở ĐÂY: Mở đường dẫn để nhận yêu cầu từ Frontend
router.post('/generate-email', protect, admin, generateMarketingEmail);

// --- ROUTE CHO ADMIN (AI Phân tích) ---
router.post('/admin/analyze-customer', protect, admin, analyzeCustomerSentiment);
router.post('/admin/analyze-strategy', protect, admin, analyzeBusinessStrategy);

module.exports = router;