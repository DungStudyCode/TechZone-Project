// server/models/Product.js
const mongoose = require('mongoose');

// --- 0. TẠO SCHEMA RIÊNG CHO REVIEW (Thêm mới) ---
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Liên kết với bảng User để biết ai bình luận
    },
  },
  {
    timestamps: true, // Để hiện ngày giờ bình luận
  }
);

const productSchema = mongoose.Schema(
  {
    // --- 1. THÔNG TIN CƠ BẢN (Bắt buộc) ---
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },

    // --- 2. GIÁ, KHO VÀ CHỈ SỐ "HOT" (CẬP NHẬT TẠI ĐÂY) ---
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    
    // Trường mới: Theo dõi số lượng bán để xác định hàng "Hot"
    soldCount: { type: Number, required: true, default: 0 },
    
    // Trường mới: Admin tick vào để đẩy sản phẩm lên đầu (Ưu tiên cao nhất)
    isPromoted: { type: Boolean, required: true, default: false },

    // --- 3. THÔNG SỐ KỸ THUẬT (MỞ RỘNG THÀNH MẢNG ĐỘNG) ---
    specs: [
      {
        keyName: { type: String, required: true }, // Tên thông số (VD: Màn hình, Camera)
        value: { type: String, required: true }    // Giá trị (VD: 6.7 inch, 108MP)
      }
    ],

    // --- 4. ĐÁNH GIÁ (REVIEW) ---
    reviews: [reviewSchema], 
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;