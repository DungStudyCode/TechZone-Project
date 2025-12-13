// server/controllers/productController.js
const Product = require('../models/Product');

// 1. Lấy toàn bộ danh sách sản phẩm
// GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products); // Trả về dạng JSON cho Frontend
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

// 2. Lấy chi tiết 1 sản phẩm theo Slug (để làm trang chi tiết)
// GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

module.exports = { getProducts, getProductBySlug };