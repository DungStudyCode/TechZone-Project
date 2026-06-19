// server/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 1. Cấu hình nơi lưu trữ (Storage) và tên file
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 2. Bộ lọc (Filter): Chỉ cho phép tải lên hình ảnh
function checkFileType(file, cb) {
  // ✅ ĐÃ THÊM: Hỗ trợ định dạng ảnh động .gif cho sinh động
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép định dạng hình ảnh (JPG, JPEG, PNG, WEBP, GIF)!'));
  }
}

// 3. Khởi tạo Multer
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// =========================================================
// 🚀 ROUTE 1: UPLOAD NHIỀU ẢNH (Dùng cho tạo Sản Phẩm, Bài viết)
// =========================================================
router.post('/', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Không có file nào được chọn' });
    }

    const imagePaths = req.files.map((file) => `/${file.path.replace(/\\/g, '/')}`);

    res.status(200).json({
      message: 'Tải ảnh lên thành công',
      images: imagePaths, 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =========================================================
// 🚀 ROUTE 2: UPLOAD 1 ẢNH DUY NHẤT (Dùng cho Chat, Avatar)
// =========================================================
router.post('/single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được chọn' });
    }

    // ✅ NÂNG CẤP: Tự động ghép nối Full URL (http://localhost:5000/uploads/...) 
    // Điều này giúp Frontend hiển thị ảnh ngay lập tức mà không bị lỗi sai port
    const protocol = req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host'); // Hỗ trợ cả khi deploy lên mây
    const fullUrl = `${protocol}://${host}/${req.file.path.replace(/\\/g, '/')}`;

    res.status(200).json({
      message: 'Tải ảnh lên thành công',
      image: fullUrl, // Trả về dạng { image: "http..." }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;