// server/controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm trong giỏ' });
    }

    // Tạo đơn hàng mới theo chuẩn Schema
    const order = new Order({
      orderItems,
      user: req.user._id, // <--- QUAN TRỌNG: Gắn user ID (Sửa lỗi Path `user` is required)
      shippingAddress,    // <--- QUAN TRỌNG: (Sửa lỗi Path `shippingAddress` is required)
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
    
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo đơn hàng: ' + error.message });
  }
};

// GET /api/orders
// Admin xem tất cả
const getAllOrders = async (req, res) => {
  try {
    // populate('user', 'id name') để lấy thêm tên người đặt nếu cần hiển thị
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn: ' + error.message });
  }
};

// GET /api/orders/myorders
// Khách xem đơn của mình
const getMyOrders = async (req, res) => {
  try {
    // Tìm đơn hàng có user ID trùng với người đang đăng nhập
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn: ' + error.message });
  }
};

// PUT /api/orders/:id/deliver
// Admin cập nhật trạng thái giao hàng
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = req.body.status || 'Delivered';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ TÍNH NĂNG MỚI: Lấy thống kê cho Dashboard
// GET /api/orders/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    // Lấy năm hiện tại (Ví dụ: 2026)
    const currentYear = new Date().getFullYear();
    
    // Tạo mốc thời gian đầu năm và cuối năm
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    // 1. Tính Tổng Doanh Thu (Chỉ tính đơn ĐÃ THANH TOÁN)
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // 2. Các chỉ số phụ
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // 3. Lấy dữ liệu biểu đồ (CHỈ LẤY NĂM NAY)
    const monthlySales = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,  // Quan trọng: Phải đã thanh toán
          createdAt: { $gte: startOfYear, $lte: endOfYear } // Quan trọng: Chỉ lấy năm nay
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' }, 
          total: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format dữ liệu cho Frontend (T1 -> T12)
    const chartData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlySales.find((m) => m._id === i + 1);
      return {
        name: `T${i + 1}`,
        total: monthData ? monthData.total : 0,
      };
    });

    // 4. Lấy đơn hàng gần đây
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersToday,
      totalOrders,
      totalProducts,
      totalUsers,
      chartData,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thống kê: ' + error.message });
  }
};

module.exports = { createOrder, getAllOrders, getMyOrders, updateOrderStatus, getDashboardStats };