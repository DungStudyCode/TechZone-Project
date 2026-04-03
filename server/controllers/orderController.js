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

    // 1. Tạo đơn hàng mới theo chuẩn Schema
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 2. CẬP NHẬT CHỈ SỐ BÁN HÀNG (SOLD COUNT)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product, // ID của sản phẩm
        { $inc: { soldCount: item.qty || 1 } }, // Tăng soldCount
        { new: true }
      );
    }

    res.status(201).json(createdOrder);
    
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo đơn hàng: ' + error.message });
  }
};

// GET /api/orders
// Admin xem tất cả
const getAllOrders = async (req, res) => {
  try {
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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn: ' + error.message });
  }
};

// GET /api/orders/:id
// Lấy chi tiết một đơn hàng theo ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(401).json({ message: 'Không có quyền truy cập đơn hàng này' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Định dạng mã đơn hàng không hợp lệ' });
    }
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// PUT /api/orders/:id/confirm
// Admin xác nhận đơn hàng
const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Đổi trạng thái sang Confirmed (Đã xác nhận)
      order.status = 'Confirmed';
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xác nhận đơn: ' + error.message });
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

// ✅ THÊM MỚI: Khách hàng xác nhận đã nhận hàng (Success)
// PUT /api/orders/:id/success
const markOrderAsSuccess = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = 'Success';
      // Nếu là COD, khi khách nhận hàng thành công thì coi như đã thanh toán
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/dashboard-stats
// Lấy thống kê cho Dashboard
const getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    const monthlySales = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: startOfYear, $lte: endOfYear } 
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

    const chartData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlySales.find((m) => m._id === i + 1);
      return {
        name: `T${i + 1}`,
        total: monthData ? monthData.total : 0,
      };
    });

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

module.exports = { 
  createOrder, 
  getAllOrders, 
  getMyOrders, 
  getOrderById, 
  confirmOrder, 
  updateOrderStatus, 
  markOrderAsSuccess, // ✅ Đã xuất hàm này ra
  getDashboardStats 
};