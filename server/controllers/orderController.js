// server/controllers/orderController.js
const Order = require('../models/Order');

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

module.exports = { createOrder, getAllOrders, getMyOrders, updateOrderStatus };