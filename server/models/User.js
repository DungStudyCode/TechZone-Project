// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, 
  loyaltyScore: { type: Number, default: 0 }, 
  customerSegment: { type: String, default: 'New' }, 
  
  // 1. Ảnh đại diện
  avatar: { type: String, default: "" },
  
  // 2. Sổ địa chỉ giao hàng
  addresses: [
    {
      recipientName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    }
  ],

  // 3. Kho Voucher cá nhân
  savedVouchers: [
    {
      voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }
    }
  ],

  // 4. SẢN PHẨM YÊU THÍCH (WISHLIST)
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', 
    }
  ],

  // ✅ 5. BẢO MẬT XÁC THỰC EMAIL (CÁC TRƯỜNG MỚI BỔ SUNG)
  isVerified: { 
    type: Boolean, 
    required: true, 
    default: false // Mặc định đăng ký xong chưa được kích hoạt
  },
  otp: { 
    type: String 
  },
  otpExpires: { 
    type: Date 
  },

}, { timestamps: true });

// ✅ ĐÃ FIX LỖI: Hàm này chạy trước khi lưu User vào DB để mã hóa mật khẩu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // 🚨 CỰC KỲ QUAN TRỌNG: Phải có chữ 'return' để dừng hàm lại tại đây
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Hàm kiểm tra mật khẩu khi đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);