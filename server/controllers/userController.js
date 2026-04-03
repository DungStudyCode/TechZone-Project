// server/controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Hàm tạo Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d', // Token hết hạn sau 30 ngày
  });
};

// 1. Đăng ký (POST /api/users)
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Đăng nhập (POST /api/users/login)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        loyaltyScore: user.loyaltyScore, // Thêm dòng này để lúc đăng nhập là có điểm luôn
        customerSegment: user.customerSegment,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Lấy danh sách Khách hàng cho CRM (GET /api/users/crm)
const getUsersCRM = async (req, res) => {
  try {
    const usersCRM = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'userOrders'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          createdAt: 1,
          totalSpent: {
            $sum: {
              $map: {
                input: '$userOrders',
                as: 'order',
                in: '$$order.totalPrice' 
              }
            }
          },
          lastOrderDate: { $max: '$userOrders.createdAt' },
          orderCount: { $size: '$userOrders' }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json(usersCRM);
  } catch (error) {
    console.error("Lỗi lấy dữ liệu CRM:", error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu khách hàng' });
  }
};

// 4. GỬI EMAIL THẬT CHO KHÁCH HÀNG
const sendMarketingEmail = async (req, res) => {
  try {
    const { email, subject, content } = req.body;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"TechZone Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: content,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Gửi email thành công!' });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({ message: 'Lỗi server khi gửi email. Vui lòng kiểm tra lại cấu hình Gmail.' });
  }
};

// =========================================================================
// 5. LẤY THÔNG TIN PROFILE (GET /api/users/profile)
// =========================================================================
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      loyaltyScore: user.loyaltyScore,
      customerSegment: user.customerSegment,
      avatar: user.avatar,
      addresses: user.addresses,
    });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};

// =========================================================================
// 6. CẬP NHẬT PROFILE (PUT /api/users/profile)
// =========================================================================
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    // ✅ THÊM 3 DÒNG NÀY ĐỂ BACKEND LƯU SỔ ĐỊA CHỈ:
    if (req.body.addresses !== undefined) {
      user.addresses = req.body.addresses;
    }


    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      loyaltyScore: updatedUser.loyaltyScore,
      customerSegment: updatedUser.customerSegment,
      avatar: updatedUser.avatar,
      addresses: updatedUser.addresses,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};

// =========================================================================
// LẤY DANH SÁCH YÊU THÍCH (GET /api/users/wishlist)
// =========================================================================
const getWishlist = async (req, res) => {
  try {
    // Tìm user và "populate" (lấy đầy đủ thông tin sản phẩm dựa vào ID)
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu thích' });
  }
};

// =========================================================================
// THÊM / XÓA SẢN PHẨM KHỎI YÊU THÍCH (POST /api/users/wishlist)
// =========================================================================
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      // Kiểm tra xem sản phẩm đã có trong wishlist chưa
      const isExist = user.wishlist.includes(productId);
      
      if (isExist) {
        // Nếu có rồi -> Xóa đi (Bỏ tim)
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
      } else {
        // Nếu chưa có -> Thêm vào (Thả tim)
        user.wishlist.push(productId);
      }

      await user.save();
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật danh sách yêu thích' });
  }
};

// ✅ Đã export ĐẦY ĐỦ các hàm
module.exports = { 
  registerUser, 
  loginUser, 
  getUsersCRM, 
  sendMarketingEmail,
  getUserProfile,      // <-- MỚI THÊM
  updateUserProfile,   // <-- MỚI THÊM
  getWishlist,         // <-- MỚI THÊM
  toggleWishlist       // <-- MỚI THÊM
};