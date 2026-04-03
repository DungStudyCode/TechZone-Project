// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http'); 
const { Server } = require('socket.io'); 

const Order = require('./models/Order'); 

// --- Import Routes ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes'); 
const aiRoutes = require('./routes/aiRoutes'); 
const postRoutes = require('./routes/postRoutes'); 
const chatRoutes = require('./routes/chatRoutes'); // ✅ 1. BỔ SUNG ROUTE CHAT

dotenv.config();
const app = express();
const server = http.createServer(app); 
const io = new Server(server, { cors: { origin: "*" } }); 

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
app.use('/api/posts', postRoutes); 
app.use('/api/chats', chatRoutes); // ✅ 2. KHAI BÁO ĐƯỜNG DẪN API CHAT

// --- LOGIC CHAT REALTIME 1-1 (NÂNG CẤP) ---
io.on('connection', (socket) => {
  console.log('⚡ Có người vừa kết nối Chat:', socket.id);

  // 1. Khi User đăng nhập, cho họ vào một "Phòng cá nhân" (để nhận thông báo)
  socket.on('setup_user', (userId) => {
    socket.join(userId);
    console.log(`🔔 User ${userId} đã sẵn sàng nhận thông báo`);
  });

  // 2. Khi User bấm vào 1 đoạn chat cụ thể
  socket.on('join_chat', (conversationId) => {
    socket.join(conversationId);
    console.log(`🤝 User tham gia phòng chat kín: ${conversationId}`);
  });

  // 3. Xử lý khi có tin nhắn gửi đi
  socket.on('send_message', (data) => {
    // data bao gồm: { conversationId, senderId, receiverId, text }
    
    // Bắn tin nhắn vào phòng chat chung của 2 người để hiện ngay lập tức
    io.to(data.conversationId).emit('receive_message', data);

    // Bắn một thông báo "ting ting" đến phòng cá nhân của người nhận
    if (data.receiverId) {
      socket.to(data.receiverId).emit('new_notification', {
        message: `Bạn có tin nhắn mới`,
        conversationId: data.conversationId
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Một người đã thoát chat');
  });
});

// Test Route
app.get('/', (req, res) => {
  res.send('API is running with Socket.io...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server TechZone running at: http://localhost:${PORT}`);
});