// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên: iPhone 15 Pro Max
  slug: { type: String, required: true, unique: true }, // URL: iphone-15-pro-max
  brand: { type: String, required: true }, // Apple
  image: { type: String, required: true }, // Ảnh đại diện
  description: { type: String },
  
  // Thông số kỹ thuật (Quan trọng cho đồ điện tử)
  specs: {
    screen: String, // "6.7 inch"
    chip: String,   // "A17 Pro"
    ram: String,    // "8GB"
    battery: String // "4422 mAh"
  },

  // Biến thể (Màu sắc & Giá tiền khác nhau)
  variants: [
    {
      sku: String,      // Mã kho: IP15PM-256-NAT
      storage: String,  // "256GB"
      color: String,    // "Titan Tự Nhiên"
      price: Number,    // 29990000
      stock: Number,    // 50
      image: String     // Ảnh riêng của màu này
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);