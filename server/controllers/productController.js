// server/controllers/productController.js
const Product = require('../models/Product');

// 1. Lấy danh sách sản phẩm (Hỗ trợ lọc theo keyword, category, brand)
// GET /api/products?keyword=iphone&category=Điện thoại&brand=Apple
const getProducts = async (req, res) => {
  try {
    // 1. Tạo một object rỗng để chứa các điều kiện lọc
    const filter = {};

    // 2. Nếu có keyword -> Tìm theo tên (Không phân biệt hoa thường)
    if (req.query.keyword) {
      filter.name = {
        $regex: req.query.keyword,
        $options: 'i',
      };
    }

    // 3. Nếu có category và không phải là 'All' -> Lọc theo Danh mục
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    // 4. Nếu có brand và không phải là 'All' -> Lọc theo Hãng
    if (req.query.brand && req.query.brand !== 'All') {
      filter.brand = req.query.brand;
    }

    // 5. Ném bộ lọc vào database. 
    // Nếu không có điều kiện nào, filter sẽ là {}, mongoose sẽ lấy toàn bộ DB.
    const products = await Product.find(filter);
    
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

// ✅ SỬA HÀM TẠO SẢN PHẨM (Nhận thêm images và video)
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, images, video, brand, category, countInStock, specs, discount } = req.body;

    const slug = createSlug(name);
    const productExists = await Product.findOne({ name });
    
    if (productExists) return res.status(400).json({ message: 'Sản phẩm này đã tồn tại' });

    const product = new Product({
      name, slug, price, description, image, 
      images: images || [], // Nếu có ảnh phụ thì nhận, không thì mảng rỗng
      video: video || "",   // Nhận link video
      brand, category, countInStock, specs, discount,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server: ' + error.message });
  }
};

// ✅ SỬA HÀM CẬP NHẬT SẢN PHẨM (Nhận thêm images và video)
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, images, video, brand, category, countInStock, specs, discount } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      if (name) product.slug = createSlug(name);
      
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      
      // Cập nhật ảnh phụ và video
      if (images !== undefined) product.images = images;
      if (video !== undefined) product.video = video;

      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;
      product.specs = specs || product.specs;
      product.discount = discount || product.discount;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
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

// ✅ TÍNH NĂNG MỚI: Lấy sản phẩm gợi ý (Related Products)
// GET /api/products/:id/related
const getRelatedProducts = async (req, res) => {
  try {
    // 1. Tìm thông tin sản phẩm mà khách đang xem (dựa vào ID truyền lên)
    const currentProduct = await Product.findById(req.params.id);
    
    if (!currentProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm gốc' });
    }

    // 2. Thuật toán tìm kiếm thông minh: 
    //    - Cùng danh mục (category).
    //    - Loại trừ chính sản phẩm đang xem ($ne).
    const relatedProducts = await Product.find({
      _id: { $ne: currentProduct._id },
      category: currentProduct.category,
    })
    .limit(4)           // Giới hạn lấy 4 sản phẩm cho layout thẻ
    .sort({ rating: -1 }) // Sắp xếp theo đánh giá từ cao xuống thấp
    .select('-reviews');  // Loại bỏ mảng đánh giá để response nhẹ hơn

    res.json(relatedProducts);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm gợi ý:", error);
    res.status(500).json({ message: 'Lỗi server khi lấy gợi ý: ' + error.message });
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
  createProductReview,
  getRelatedProducts, // <--- Đã thêm
};  