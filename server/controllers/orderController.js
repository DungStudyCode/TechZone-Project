// server/controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// ==================================================
// 🚀 1. HÀM TẠO ĐƠN HÀNG (CÓ KIỂM TRA & TRỪ TỒN KHO)
// ==================================================
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

    // Kiểm tra số lượng tồn kho của từng sản phẩm trước khi tạo đơn
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm không tồn tại trên hệ thống` });
      }
      if (product.countInStock < (item.qty || 1)) {
        return res.status(400).json({ 
          message: `Sản phẩm "${product.name}" đã hết hàng hoặc không đủ số lượng trong kho (Hiện còn: ${product.countInStock})` 
        });
      }
    }

    // Tạo đơn hàng mới vào Database
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

    // Cập nhật: Trừ số lượng kho (countInStock) và tăng chỉ số bán hàng (soldCount)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { 
          $inc: { 
            countInStock: -(item.qty || 1), 
            soldCount: item.qty || 1         
          } 
        },
        { new: true }
      );
    }

    res.status(201).json(createdOrder);
    
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo đơn hàng: ' + error.message });
  }
};

// ==================================================
// 📦 2. CÁC HÀM LẤY THÔNG TIN ĐƠN HÀNG
// ==================================================
// GET /api/orders - Admin xem tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn: ' + error.message });
  }
};

// GET /api/orders/myorders - Khách hàng xem lịch sử đơn hàng của mình
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn: ' + error.message });
  }
};

// GET /api/orders/:id - Lấy thông tin chi tiết một đơn hàng theo ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Bảo mật: Nếu không phải Admin thì chỉ được xem đơn hàng của chính mình
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

// ==================================================
// ⚙️ 3. HÀM ADMIN CẬP NHẬT TRẠNG THÁI (ĐỒNG BỘ KHO 2 CHIỀU)
// ==================================================
// PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const oldStatus = order.status;
    const newStatus = req.body.status;

    // Nếu trạng thái mới trùng với trạng thái cũ thì giữ nguyên
    if (oldStatus === newStatus) {
      return res.json(order);
    }

    const canceledStatuses = ['Đã hủy', 'Hoàn trả/Hoàn tiền'];
    const isOldCanceled = canceledStatuses.includes(oldStatus);
    const isNewCanceled = canceledStatuses.includes(newStatus);

    // TRƯỜNG HỢP A: Chuyển từ trạng thái hoạt động bình thường sang HỦY đơn -> HOÀN LẠI KHO
    if (!isOldCanceled && isNewCanceled) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { 
            $inc: { 
              countInStock: item.qty, 
              soldCount: -item.qty   
            } 
          }
        );
      }
    }

    // TRƯỜNG HỢP B: Chuyển ngược từ đơn đã HỦY quay lại trạng thái hoạt động -> TRỪ KHO LẠI
    if (isOldCanceled && !isNewCanceled) {
      // Kiểm tra xem kho còn đủ số lượng để trừ lại không
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (!product || product.countInStock < item.qty) {
          return res.status(400).json({ 
            message: `Không thể khôi phục đơn hàng! Sản phẩm "${product?.name || 'Không rõ'}" không đủ số lượng tồn kho để tiếp tục trừ lại (Hiện còn: ${product?.countInStock || 0})` 
          });
        }
      }

      // Trừ kho sau khi đã đảm bảo tất cả sản phẩm đều đủ số lượng
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { 
            $inc: { 
              countInStock: -item.qty, 
              soldCount: item.qty     
            } 
          }
        );
      }
    }

    // Cập nhật trạng thái mới cho đơn hàng
    order.status = newStatus; 
    
    if (newStatus === 'Đã giao hàng') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái và tồn kho: ' + error.message });
  }
};

// ==================================================
// 🛑 4. HÀM KHÁCH HÀNG TỰ HỦY ĐƠN (CÓ HOÀN KHO)
// ==================================================
// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Chỉ cho phép hủy khi đơn ở trạng thái 'Chờ xác nhận' và chưa được giao đi
      if ((order.status === 'Chờ xác nhận' || !order.status) && !order.isDelivered) {
        
        order.status = 'Đã hủy';

        // Tự động hoàn lại số lượng sản phẩm vào kho bãi khi khách tự hủy đơn
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(
            item.product,
            { 
              $inc: { 
                countInStock: item.qty || 1,
                soldCount: -(item.qty || 1)
              } 
            }
          );
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
      } else {
        return res.status(400).json({ message: 'Không thể hủy đơn hàng đã được xử lý hoặc đang giao' });
      }
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi hủy đơn: ' + error.message });
  }
};

// ==================================================
// 🎉 5. HÀM XÁC NHẬN ĐÃ NHẬN HÀNG THÀNH CÔNG
// ==================================================
// PUT /api/orders/:id/success
const markOrderAsSuccess = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = 'Success';
      
      // Nếu khách mua COD, khi bấm xác nhận đã nhận hàng thành công thì cập nhật đã thu tiền
      if (order.paymentMethod === 'COD' && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác nhận đơn hàng: ' + error.message });
  }
};

// ==================================================
// 📊 6. HÀM THỐNG KÊ DOANH THU DASHBOARD (ADMIN)
// ==================================================
// GET /api/orders/dashboard-stats
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
  updateOrderStatus,
  cancelOrder,
  markOrderAsSuccess, 
  getDashboardStats 
};