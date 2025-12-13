// server/controllers/orderController.js
const Order = require('../models/Order');

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customerInfo, orderItems, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm trong giỏ' });
    }

    const order = new Order({
      customerInfo,
      orderItems,
      totalPrice
    });

    const createdOrder = await order.save();
    
    // TODO: Ở đây có thể thêm code gửi Email xác nhận đơn hàng

    

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo đơn hàng: ' + error.message });
  }
};

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    // Tìm tất cả đơn hàng, sắp xếp mới nhất lên đầu (-1)
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn: ' + error.message });
  }
};



module.exports = { createOrder, getAllOrders };