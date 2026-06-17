// server/models/Product.js
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    // --- 1. THÔNG TIN CƠ BẢN ---
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true }, // Ảnh chính (Thumbnail)
    
    // Thư viện ảnh và Video
    images: { type: [String], default: [] }, // Mảng chứa các link ảnh phụ
    video: { type: String, default: "" },    // Link nhúng video YouTube (nếu có)
    
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },

    // --- 2. GIÁ, KHO VÀ CHỈ SỐ ---
    price: { type: Number, required: true, default: 0 },
    
    // ✅ ĐÃ THÊM: Trường giảm giá (discount) để Backend chịu lưu dữ liệu
    discount: { type: Number, default: 0 }, 
    
    countInStock: { 
      type: Number, 
      required: true, 
      default: 0,
      min: [0, 'Số lượng hàng tồn kho không thể âm!'] 
    },
    soldCount: { type: Number, required: true, default: 0 },
    isPromoted: { type: Boolean, required: true, default: false },

    // --- 3. THÔNG SỐ KỸ THUẬT ---
    specs: [
      {
        keyName: { type: String, required: true }, 
        value: { type: String, required: true }    
      }
    ],

    // --- 4. ĐÁNH GIÁ (REVIEW) ---
    reviews: [reviewSchema], 
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;