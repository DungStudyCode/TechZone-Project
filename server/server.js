// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- Import Routes ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes'); // Đã import ở đây
const aiRoutes = require('./routes/aiRoutes'); // Import route AI


//
dotenv.config();
const app = express();

// Kết nối DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// --- CẤU HÌNH ĐƯỜNG DẪN (QUAN TRỌNG) ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes); // Sử dụng route AI

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
