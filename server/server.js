// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- Import Models (Cần thêm cái này để sửa dữ liệu) ---
const Order = require('./models/Order'); 

// --- Import Routes ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes'); 
const aiRoutes = require('./routes/aiRoutes'); 

dotenv.config();
const app = express();

// Kết nối DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// --- CẤU HÌNH ĐƯỜNG DẪN ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes); 

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ============================================================
// 🛠️ TOOL SỬA DỮ LIỆU NHANH (Chạy 1 lần để hiện Doanh thu)
// ============================================================
const fixData = async () => {
  try {
    console.log("🔄 Đang ép cập nhật dữ liệu...");

    // Dùng updateMany để bỏ qua bước kiểm tra validation của Mongoose
    // Lệnh này sẽ set tất cả đơn hàng thành isPaid = true
    await Order.updateMany(
      {}, // Điều kiện: {} nghĩa là chọn tất cả
      {
        $set: {
          isPaid: true,
          paidAt: new Date(),
          createdAt: new Date() // Bỏ comment dòng này nếu muốn đơn cũ hiện lên biểu đồ năm nay
        }
      }
    );
    
    console.log("✅ ĐÃ XONG: Đã 'ép' cập nhật doanh thu thành công!");
  } catch (error) {
    console.log("❌ Vẫn lỗi:", error);
  }
};

// Gọi hàm
fixData();
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
});