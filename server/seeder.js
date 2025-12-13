// server/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config();
connectDB(); // Kết nối DB để nạp dữ liệu

const importData = async () => {
  try {
    // 1. Xóa dữ liệu cũ
    await Product.deleteMany();
    console.log('🧹 Đã xóa dữ liệu cũ...');

    // 2. Tạo dữ liệu mới (iPhone 15 & S24 Ultra)
    const products = [
      {
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        brand: "Apple",
        image: "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg",
        description: "iPhone 15 Pro Max. Thiết kế Titan bền nhẹ, nút Tác vụ mới.",
        specs: { screen: "6.7 inch", chip: "A17 Pro", ram: "8GB", battery: "4422 mAh" },
        variants: [
          {
            sku: "IP15PM-256-NAT", storage: "256GB", color: "Titan Tự Nhiên",
            price: 29990000, stock: 10, image: "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-titan-tu-nhien-1-600x600.jpg"
          },
          {
            sku: "IP15PM-512-BLU", storage: "512GB", color: "Titan Xanh",
            price: 35990000, stock: 5, image: "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-xanh-1-600x600.jpg"
          }
        ]
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        brand: "Samsung",
        image: "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg",
        description: "Quyền năng Galaxy AI. Camera mắt thần bóng đêm.",
        specs: { screen: "6.8 inch", chip: "Snapdragon 8 Gen 3", ram: "12GB", battery: "5000 mAh" },
        variants: [
          {
            sku: "S24U-256-GRY", storage: "256GB", color: "Xám Titan",
            price: 28990000, stock: 20, image: "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-xam-1-600x600.jpg"
          }
        ]
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Đã thêm dữ liệu mẫu thành công!');
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
    process.exit(1);
  }
};

importData();