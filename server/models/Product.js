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
    name: { 
      type: String, 
      required: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true 
    },
    image: { 
      type: String, 
      required: true 
    },
    brand: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },

    // --- 2. GIÁ VÀ KHO ---
    price: { 
      type: Number, 
      required: true, 
      default: 0 
    },
    countInStock: { 
      type: Number, 
      required: true, 
      default: 0 
    },

    // --- 3. THÔNG SỐ KỸ THUẬT (MỞ RỘNG) ---
    specs: {
      screen: { type: String, default: "" }, 
      chip: { type: String, default: "" },   
      ram: { type: String, default: "" },    
      battery: { type: String, default: "" } 
    },

    // --- 4. ĐÁNH GIÁ (REVIEW) - ĐÃ SỬA ---
    // Đây là phần quan trọng bạn đang thiếu
    reviews: [reviewSchema], 

    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;