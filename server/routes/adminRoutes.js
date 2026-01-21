const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware của bạn
const { 
  analyzeCustomerSentiment, 
  analyzeBusinessStrategy 
} = require('../controllers/aiAdminController');

// Route phân tích Review
router.get('/ai/sentiment', protect, admin, analyzeCustomerSentiment);

// Route phân tích Doanh thu
router.get('/ai/strategy', protect, admin, analyzeBusinessStrategy);

module.exports = router;