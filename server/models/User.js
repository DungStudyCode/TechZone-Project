const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // Phân biệt Admin và Khách
  loyaltyScore: { type: Number, default: 0 }, // Điểm thân thiết (tăng khi mua hàng)
  customerSegment: { type: String, default: 'New' }, // Ví dụ: New, Potential, VIP, AtRisk
}, { timestamps: true });

// Hàm này chạy trước khi lưu User vào DB để mã hóa mật khẩu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Hàm kiểm tra mật khẩu khi đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);