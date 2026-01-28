// server/controllers/productController.js
const Product = require('../models/Product');

// 1. Lấy toàn bộ danh sách sản phẩm (Có tìm kiếm keyword)
// GET /api/products?keyword=iphone
const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const products = await Product.find({ ...keyword });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Lấy chi tiết 1 sản phẩm theo Slug (cho trang chi tiết Client)
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

// 3. ✅ [MỚI] Lấy chi tiết 1 sản phẩm theo ID (cho trang Admin Edit)
// GET /api/products/:id (Nếu ID là dạng ObjectId)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    // Lỗi này xảy ra nếu ID gửi lên không đúng định dạng MongoDB
    res.status(404).json({ message: 'ID sản phẩm không hợp lệ' });
  }
};

// 4. Xóa sản phẩm
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne(); 
      res.json({ message: 'Đã xóa sản phẩm thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// 5. Thêm mới sản phẩm
// POST /api/products
// Hàm hỗ trợ tạo Slug tiếng Việt (Ví dụ: "Điện thoại" -> "dien-thoai")
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w\-]+/g, "") // Xóa các ký tự đặc biệt
    .replace(/\-\-+/g, "-") // Xóa các dấu gạch ngang kép
    .replace(/^-+/, "") // Xóa gạch ngang đầu
    .replace(/-+$/, ""); // Xóa gạch ngang cuối
};

// ✅ SỬA HÀM TẠO SẢN PHẨM
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, brand, category, countInStock, specs, discount } = req.body;

    // 1. Tự động tạo Slug từ tên
    const slug = createSlug(name);

    // 2. Kiểm tra trùng lặp (Optional)
    const productExists = await Product.findOne({ name });
    if (productExists) {
      return res.status(400).json({ message: 'Sản phẩm này đã tồn tại' });
    }

    // 3. Tạo sản phẩm mới với đầy đủ trường bắt buộc
    const product = new Product({
      name,
      slug, // <--- Quan trọng: Server tự tạo
      price,
      description,
      image,
      brand,
      category,
      countInStock,
      specs,
      discount,
      user: req.user._id, // <--- Quan trọng: Lấy ID của Admin đang đăng nhập
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
    console.error("Lỗi tạo SP:", error);
    res.status(500).json({ message: 'Lỗi Server: ' + error.message });
  }
};

// ✅ SỬA HÀM CẬP NHẬT SẢN PHẨM
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, brand, category, countInStock, specs, discount } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      // Nếu tên đổi thì cập nhật luôn slug
      if (name) product.slug = createSlug(name);
      
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;
      product.specs = specs || product.specs;
      product.discount = discount || product.discount; // Cập nhật giảm giá

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    console.error("Lỗi cập nhật SP:", error);
    res.status(500).json({ message: 'Lỗi Server: ' + error.message });
  }
};

// ✅ TÍNH NĂNG MỚI: Tạo đánh giá sản phẩm
// POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // ✅ THÊM ĐOẠN NÀY: Kiểm tra nếu chưa có reviews thì tạo mảng rỗng
    if (!product.reviews) {
      product.reviews = [];
    }

    // Bây giờ .find sẽ chạy an toàn, không bị lỗi nữa
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi!' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Đánh giá đã được thêm' });
  } else {
    res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  }
};

// ✅ Đừng quên export các hàm
module.exports = { 
  getProducts, 
  getProductBySlug, 
  getProductById, // <--- Đã thêm
  deleteProduct, 
  createProduct, 
  updateProduct,
  createProductReview
};  