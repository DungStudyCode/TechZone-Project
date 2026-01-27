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
const createProduct = async (req, res) => {
  try {
    const { name, slug, price, image, category, brand, countInStock, description, specs } = req.body;

    const productExists = await Product.findOne({ name });
    if (productExists) {
      return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' });
    }

    const product = new Product({
      name, slug, price, image, category, brand, countInStock, description, specs
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo sản phẩm: ' + error.message });
  }
};

// 6. Cập nhật sản phẩm
// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, slug, price, image, category, brand, countInStock, description, specs } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.slug = slug || product.slug;
      product.price = price || product.price;
      product.image = image || product.image;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.countInStock = countInStock; 
      product.description = description || product.description;
      product.specs = specs || product.specs;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật: ' + error.message });
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