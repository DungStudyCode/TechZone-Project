// server/controllers/productController.js
const Product = require('../models/Product');

// 1. Lấy toàn bộ danh sách sản phẩm
// GET /api/products?keyword=iphone
const getProducts = async (req, res) => {
  try {
    // 1. Lấy từ khóa từ URL (ví dụ: ?keyword=samsung)
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword, // Tìm gần đúng (chứa từ khóa là được)
            $options: 'i', // Không phân biệt hoa thường (iphone = iPhone)
          },
        }
      : {};

    // 2. Tìm trong Database với điều kiện keyword (nếu không có keyword thì tìm hết)
    const products = await Product.find({ ...keyword });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
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


// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne(); // Xóa sản phẩm
      res.json({ message: 'Đã xóa sản phẩm thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// POST /api/products (Thêm mới)
const createProduct = async (req, res) => {
  try {
    // 1. Thêm 'specs' vào đây
    const { name, slug, price, image, category, brand, countInStock, description, specs } = req.body;

    const productExists = await Product.findOne({ name });
    if (productExists) {
      return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' });
    }

    const product = new Product({
      name, slug, price, image, category, brand, countInStock, description, specs // 2. Lưu specs
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo sản phẩm: ' + error.message });
  }
};

// PUT /api/products/:id (Cập nhật)
const updateProduct = async (req, res) => {
  try {
    // 1. Thêm 'specs' vào đây
    const { name, slug, price, image, category, brand, countInStock, description, specs } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.slug = slug || product.slug;
      product.price = price || product.price;
      product.image = image || product.image;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.countInStock = countInStock; // Lưu ý: bỏ || product.countInStock để cho phép sửa về 0
      product.description = description || product.description;
      product.specs = specs || product.specs; // 2. Cập nhật specs

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật: ' + error.message });
  }
};

// Nhớ thêm updateProduct vào dòng export cuối cùng
module.exports = { getProducts, getProductBySlug, deleteProduct, createProduct, updateProduct };