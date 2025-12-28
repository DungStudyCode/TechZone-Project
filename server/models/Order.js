// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    // Thông tin người đặt (User đã login)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Danh sách sản phẩm
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        // Quan trọng: Trường này liên kết với bảng Product
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    // Địa chỉ giao hàng (Khớp với Frontend)
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: String, default: 'Vietnam' },
    },
    // Phương thức thanh toán
    paymentMethod: {
      type: String,
      required: true,
      default: 'COD',
    },
    // Kết quả thanh toán (nếu dùng Online Banking)
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    // Các loại phí
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    
    // Trạng thái đơn hàng
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: { type: String, default: 'Processing' }, // Processing, Shipping, Delivered, Cancelled
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;