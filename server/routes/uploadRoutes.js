// server/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 1. Cấu hình nơi lưu trữ (Storage) và tên file
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // File sẽ được lưu vào thư mục 'server/uploads/'
  },
  filename(req, file, cb) {
    // Tên file: images-16987654321.jpg (Chống trùng lặp)
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 2. Bộ lọc (Filter): Chỉ cho phép tải lên hình ảnh
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép định dạng hình ảnh (JPG, JPEG, PNG, WEBP)!'));
  }
}

// 3. Khởi tạo Multer
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 4. API Tải lên nhiều ảnh (Tối đa 10 ảnh)
// POST /api/upload
router.post('/', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Không có file nào được chọn' });
    }

    // Tạo mảng chứa đường dẫn của các file vừa upload thành công
    // Biến đổi đường dẫn Windows (\\) thành dạng web (/)
    const imagePaths = req.files.map((file) => `/${file.path.replace(/\\/g, '/')}`);

    res.status(200).json({
      message: 'Tải ảnh lên thành công',
      images: imagePaths, // Trả về [ "/uploads/ảnh1.jpg", "/uploads/ảnh2.jpg" ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;