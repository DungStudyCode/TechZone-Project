// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Import file db.js vừa tạo
const orderRoutes = require('./routes/orderRoutes'); // Import Order Routes
const userRoutes = require('./routes/userRoutes'); // Import User Routes

// (Import Routes) ---
const productRoutes = require('./routes/productRoutes');

// 1. Config
dotenv.config();
const app = express();

// 2. Connect Database
connectDB();

// 3. Middlewares
app.use(cors());
app.use(express.json());

// (Use Routes) ---
app.use('/api/products', productRoutes);

// (Use Order Routes) ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 4. Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));