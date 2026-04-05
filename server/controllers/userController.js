// server/controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios'); // ✅ IMPORT AXIOS ĐỂ GỌI API GOOGLE

// Hàm tạo Token (cho Đăng nhập)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d', 
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
        loyaltyScore: user.loyaltyScore,
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

// 4. GỬI EMAIL THẬT CHO KHÁCH HÀNG (Dùng Nodemailer)
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

// 5. LẤY THÔNG TIN PROFILE (GET /api/users/profile)
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

// 6. CẬP NHẬT PROFILE (PUT /api/users/profile)
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

// 7. LẤY DANH SÁCH YÊU THÍCH (GET /api/users/wishlist)
const getWishlist = async (req, res) => {
  try {
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

// 8. THÊM / XÓA SẢN PHẨM KHỎI YÊU THÍCH (POST /api/users/wishlist)
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const isExist = user.wishlist.includes(productId);
      
      if (isExist) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
      } else {
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

// =========================================================
// ✅ TÍNH NĂNG: QUÊN MẬT KHẨU
// =========================================================

// POST /api/users/forgotpassword
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email này chưa được đăng ký trong hệ thống!" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = `
      <div style="max-w: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #7e22ce; text-align: center;">Khôi Phục Mật Khẩu TechZone</h2>
        <p style="color: #374151; font-size: 16px;">Chào bạn,</p>
        <p style="color: #374151; font-size: 16px;">Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #9333ea; color: #ffffff; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;">Bấm vào đây để đặt lại mật khẩu</a>
        </div>
        <p style="color: #ef4444; font-size: 14px; text-align: center;"><strong>Lưu ý:</strong> Link này sẽ tự động hết hạn sau 15 phút vì lý do bảo mật.</p>
      </div>
    `;

    const mailOptions = {
      from: `"TechZone Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Khôi phục mật khẩu tài khoản TechZone",
      html: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email khôi phục đã được gửi thành công. Vui lòng kiểm tra hộp thư!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống khi gửi email: " + error.message });
  }
};

// PUT /api/users/resetpassword/:token
const resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại!" });
    }

    user.password = req.body.password;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay." });
  } catch (error) {
    res.status(400).json({ message: "Đường link không hợp lệ hoặc đã hết hạn!" });
  }
};

// =========================================================
// ✅ TÍNH NĂNG MỚI: ĐĂNG NHẬP BẰNG GOOGLE
// =========================================================
const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    // Dùng token để lấy thông tin từ Google
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { email, name, picture } = data;

    // Kiểm tra xem user có trong DB chưa
    let user = await User.findOne({ email });

    // Nếu chưa có, tạo mới luôn
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        // Tạo pass ngẫu nhiên vì khách đăng nhập bằng Google
        password: Date.now().toString() + Math.random().toString(), 
      });
    }

    // Trả về data y hệt như hàm login bình thường
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      loyaltyScore: user.loyaltyScore,
      customerSegment: user.customerSegment,
      avatar: user.avatar || picture,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Lỗi Google Login:", error);
    res.status(400).json({ message: "Xác thực Google thất bại. Vui lòng thử lại!" });
  }
};

// Đã export ĐẦY ĐỦ các hàm
module.exports = { 
  registerUser, 
  loginUser, 
  getUsersCRM, 
  sendMarketingEmail,
  getUserProfile,      
  updateUserProfile,   
  getWishlist,         
  toggleWishlist,
  forgotPassword, 
  resetPassword,
  googleLogin // ✅ Đã export hàm này
};