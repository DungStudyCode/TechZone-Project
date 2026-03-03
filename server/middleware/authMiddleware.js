// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error("Lỗi xác thực Token:", error.message);
      
      // ✅ Tối ưu: Bắt chính xác lỗi hết hạn Token
      if (error.name === 'TokenExpiredError') {
         return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!' });
      }
      
      return res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ!' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token!' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({ message: 'Không có quyền truy cập dành cho Admin' });
  }
};

module.exports = { protect, admin };