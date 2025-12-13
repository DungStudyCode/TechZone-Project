const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

router.post('/', registerUser);       // Đăng ký
router.post('/login', loginUser);     // Đăng nhập

module.exports = router;