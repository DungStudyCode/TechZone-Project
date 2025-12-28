// server/models/Product.js
const mongoose = require('mongoose');

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

    // --- 2. GIÁ VÀ KHO (QUAN TRỌNG ĐỂ KHÔNG BỊ LỖI NaN) ---
    // Chúng ta phải để price ở ngoài cùng để Frontend dễ lấy dữ liệu
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
    // Phần này optional (không required) để tránh lỗi khi thêm sản phẩm đơn giản
    specs: {
      screen: { type: String, default: "" }, // VD: 6.7 inch
      chip: { type: String, default: "" },   // VD: A17 Pro
      ram: { type: String, default: "" },    // VD: 8GB
      battery: { type: String, default: "" } // VD: 4422 mAh
    },

    // --- 4. ĐÁNH GIÁ (REVIEW) - Chuẩn bị cho chức năng Comment sau này ---
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
    timestamps: true, // Tự động tạo createdAt, updatedAt
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;