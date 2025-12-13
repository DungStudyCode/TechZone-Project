
// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Thông tin khách hàng (Vì chưa làm Login nên mình cho nhập tay)
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  
  // Danh sách sản phẩm mua
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      // Lưu lại màu/dung lượng để sau này biết đường soạn hàng
      sku: String,
      color: String,
      storage: String
    }
  ],

  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false }, // Đã thanh toán chưa (ví dụ CK)
  status: { type: String, default: 'Pending' } // Pending, Confirmed, Shipping, Delivered
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);