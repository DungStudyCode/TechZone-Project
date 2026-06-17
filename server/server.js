// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http'); 
const { Server } = require('socket.io'); 
const path = require('path'); // ✅ ĐÃ THÊM: Thư viện xử lý đường dẫn file

const Order = require('./models/Order'); 

// --- Import Routes ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes'); 
const aiRoutes = require('./routes/aiRoutes'); 
const postRoutes = require('./routes/postRoutes'); 
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // ✅ ĐÃ THÊM ROUTE UPLOAD

dotenv.config();
const app = express();
const server = http.createServer(app); 

// ==========================================
// 🚀 DANH SÁCH KHÁCH VIP ĐƯỢC PHÉP TRUY CẬP (CORS)
// ==========================================
const allowedOrigins = [
  'http://localhost:5173', 
  'https://tech-zone-project.vercel.app', 
  'https://tech-zone-project-uk1o0bref-dungstudycss-projects.vercel.app',
  'https://techzoneshop.online',
  'https://www.techzoneshop.online'
];

// 1. CẤU HÌNH CORS CHO API (EXPRESS)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bị chặn bởi chính sách CORS!'));
    }
  },
  credentials: true,
}));

// 2. CẤU HÌNH CORS CHO SOCKET.IO
const io = new Server(server, { 
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  } 
});

// Kết nối DB
connectDB();

// Middlewares
app.use(express.json());

// --- CẤU HÌNH ĐƯỜNG DẪN TĨNH (STATIC FILES) ---
// ✅ ĐÃ THÊM: Biến thư mục 'uploads' thành thư mục công khai để Frontend hiển thị được ảnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- CẤU HÌNH ĐƯỜNG DẪN API ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes); 
app.use('/api/posts', postRoutes); 
app.use('/api/chats', chatRoutes); 
app.use('/api/payment', paymentRoutes); 
app.use('/api/upload', uploadRoutes); // ✅ CẮM ROUTE UPLOAD VÀO ĐÂY

// --- LOGIC CHAT REALTIME 1-1 ---
io.on('connection', (socket) => {
  console.log('⚡ Có người vừa kết nối Chat:', socket.id);

  socket.on('setup_user', (userId) => {
    socket.join(userId);
    console.log(`🔔 User ${userId} đã sẵn sàng nhận thông báo`);
  });

  socket.on('join_chat', (conversationId) => {
    socket.join(conversationId);
    console.log(`🤝 User tham gia phòng chat kín: ${conversationId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.conversationId).emit('receive_message', data);
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

app.get('/', (req, res) => {
  res.send('API is running with Socket.io...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server TechZone running at: http://localhost:${PORT}`);
});