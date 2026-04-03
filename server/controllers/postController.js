// server/controllers/postController.js
const Post = require('../models/Post');

// 1. TẠO BÀI ĐĂNG (Có lưu tọa độ GeoJSON)
exports.createPost = async (req, res) => {
  try {
    const { title, content, price, category, condition, area, images, lat, lng } = req.body;

    const postData = {
      title, content, price, category, condition, area, images,
      author: req.user._id
    };

    // Nếu Frontend có gửi tọa độ lên, lưu vào chuẩn GeoJSON của MongoDB
    if (lat && lng) {
      postData.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)] // [Kinh độ, Vĩ độ]
      };
    }

    const newPost = await Post.create(postData);
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Lỗi tạo bài:", err);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 2. LẤY DANH SÁCH BÀI ĐĂNG (Có lọc theo bán kính)
exports.getAllPosts = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query; 
    let query = {};

    // NẾU NGƯỜI DÙNG TÌM QUANH ĐÂY (BÁN KÍNH)
    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) * 1000 // Nhân 1000 để đổi từ KM sang Mét
        }
      };
    }

    // Lấy danh sách, tin mới nhất lên đầu
    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 });
      
    res.json(posts);
  } catch (err) {
    console.error("Lỗi lấy danh sách:", err);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 3. LẤY CHI TIẾT 1 BÀI ĐĂNG
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name');
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    res.json(post);
  } catch (error) {
    console.error("Lỗi lấy chi tiết:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 4. ĐỔI TRẠNG THÁI (Đã bán <-> Còn hàng)
exports.togglePostStatus = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    // Chỉ người đăng (author) hoặc Admin mới được đổi
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này" });
    }

    // Đảo ngược trạng thái (Dựa theo model của bạn: active / sold)
    post.status = post.status === 'sold' ? 'active' : 'sold';
    await post.save();

    res.json(post);
  } catch (err) {
    console.error("Lỗi đổi trạng thái:", err);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 5. XÓA BÀI ĐĂNG
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    // Chỉ người đăng hoặc Admin mới được xóa
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bài này" });
    }

    await post.deleteOne();
    res.json({ message: "Đã xóa bài đăng thành công" });
  } catch (err) {
    console.error("Lỗi xóa bài:", err);
    res.status(500).json({ message: "Lỗi Server" });
  }
};