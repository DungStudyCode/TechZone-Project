// server/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [String], // Mảng chứa các đường dẫn ảnh
  category: { type: String, required: true },
  condition: { type: String, enum: ['Mới', 'Cũ', 'Lỗi'], required: true },
  price: { type: Number, required: true },
  area: { type: String, required: true },
  bumpedAt: { type: Date, default: Date.now }, // Dùng để đẩy tin lên đầu
  status: { type: String, default: 'active' }, // active, sold, hidden

  // ✅ THÊM TRƯỜNG NÀY ĐỂ LƯU TỌA ĐỘ BẢN ĐỒ (Chuẩn GeoJSON của MongoDB)
  location: {
    type: { 
      type: String, 
      enum: ['Point'], // Bắt buộc phải là 'Point'
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], // Mảng chứa 2 số: [Kinh độ (lng), Vĩ độ (lat)]
      default: [0, 0] 
    }
  }
}, { timestamps: true });

// ✅ ĐÁNH INDEX 2DSPHERE ĐỂ MONGODB HỖ TRỢ TÍNH TOÁN KHOẢNG CÁCH (TÌM QUANH ĐÂY)
postSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Post', postSchema);