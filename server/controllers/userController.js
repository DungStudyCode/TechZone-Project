// server/controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios'); 

// ==================================================
// 🛠️ HÀM PHỤ TRỢ (HELPERS)
// ==================================================
// Tạo Token
const generateToken = (id) => {
  // ✅ ĐÃ SỬA: Xóa bỏ 'secret123' để đồng bộ tuyệt đối với authMiddleware.js. Hết lỗi văng tài khoản!
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};

// Tạo mã OTP 6 số
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Bắn email OTP
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"TechZone Security" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: '[TechZone] Mã OTP Xác Thực Tài Khoản',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 500px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;">
        <h2 style="color: #7e22ce; margin-bottom: 20px;">XÁC THỰC TÀI KHOẢN</h2>
        <p style="color: #4b5563; font-size: 16px;">Chào bạn,</p>
        <p style="color: #4b5563; font-size: 16px;">Mã OTP kích hoạt tài khoản TechZone của bạn là:</p>
        <div style="background: #f3f4f6; padding: 20px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #111827; border-radius: 8px; margin: 25px 0;">
          ${otp}
        </div>
        <p style="color: #ef4444; font-size: 13px;">* Mã có hiệu lực trong 15 phút. Tuyệt đối không chia sẻ mã này.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ==================================================
// 📝 1. ĐĂNG KÝ VÀ GỬI OTP
// ==================================================
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'Email này đã được sử dụng' });
      } else {
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 15 * 60 * 1000;
        user.password = password; 
        user.name = name;
        await user.save();
        
        await sendOTPEmail(email, otp);
        return res.status(200).json({ message: 'Đã gửi lại mã OTP mới vào email của bạn!', email: user.email });
      }
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 15 * 60 * 1000;

    user = await User.create({ 
      name, 
      email, 
      password,
      isVerified: false,
      otp,
      otpExpires
    });

    if (user) {
      await sendOTPEmail(email, otp);
      res.status(201).json({
        message: 'Đăng ký thành công! Vui lòng kiểm tra mã OTP trong Gmail.',
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================================================
// 🔑 1.1 XÁC THỰC MÃ OTP
// ==================================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    if (user.isVerified) return res.status(400).json({ message: 'Tài khoản đã được xác thực trước đó!' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Mã OTP không chính xác!' });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'Mã OTP đã hết hạn! Vui lòng đăng ký lại để nhận mã mới.' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      loyaltyScore: user.loyaltyScore,
      customerSegment: user.customerSegment,
      avatar: user.avatar,
      token: generateToken(user._id),
      message: 'Xác thực thành công! Chào mừng đến TechZone.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================================================
// 🔓 2. ĐĂNG NHẬP
// ==================================================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Tài khoản chưa được kích hoạt. Vui lòng đăng ký lại để nhận OTP!' });
      }

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

// ==================================================
// 🌐 CÁC HÀM KHÁC
// ==================================================
const getUsersCRM = async (req, res) => { 
  try {
    const usersCRM = await User.aggregate([
      { $lookup: { from: 'orders', localField: '_id', foreignField: 'user', as: 'userOrders' } },
      { $project: {
          name: 1, email: 1, createdAt: 1,
          totalSpent: { $sum: { $map: { input: '$userOrders', as: 'order', in: '$$order.totalPrice' } } },
          lastOrderDate: { $max: '$userOrders.createdAt' },
          orderCount: { $size: '$userOrders' }
      } },
      { $sort: { totalSpent: -1 } }
    ]);
    res.json(usersCRM);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server CRM' });
  }
};

const sendMarketingEmail = async (req, res) => { 
  try {
    const { email, subject, content } = req.body;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({ from: `"TechZone" <${process.env.EMAIL_USER}>`, to: email, subject: subject, text: content });
    res.status(200).json({ message: 'Gửi thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi gửi email' }); }
};

const getUserProfile = async (req, res) => { 
  // ✅ BẢO MẬT: Chặn không cho trả về mật khẩu và các trường OTP
  const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
  if (user) { res.json(user); } else { res.status(404).json({ message: 'Không tìm thấy' }); }
};

const updateUserProfile = async (req, res) => { 
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.password) user.password = req.body.password;
    if (req.body.addresses !== undefined) user.addresses = req.body.addresses;
    
    const updatedUser = await user.save();
    
    // ✅ BẢO MẬT: Bóc tách trả về đích danh các trường, KHÔNG ĐƯỢC dùng ...updatedUser._doc
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      loyaltyScore: updatedUser.loyaltyScore,
      customerSegment: updatedUser.customerSegment,
      avatar: updatedUser.avatar,
      addresses: updatedUser.addresses,
      token: generateToken(updatedUser._id)
    });
  } else { res.status(404).json({ message: 'Không tìm thấy' }); }
};

const getWishlist = async (req, res) => { 
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) res.json(user.wishlist); else res.status(404).json({ message: 'Không tìm thấy' });
  } catch (error) { res.status(500).json({ message: 'Lỗi' }); }
};

const toggleWishlist = async (req, res) => { 
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
      const isExist = user.wishlist.includes(productId);
      if (isExist) user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
      else user.wishlist.push(productId);
      await user.save();
      res.json(user.wishlist);
    } else res.status(404).json({ message: 'Không tìm thấy' });
  } catch (error) { res.status(500).json({ message: 'Lỗi' }); }
};

const forgotPassword = async (req, res) => { 
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy Email!" });
    
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    // ✅ SỬA LỖI: Dùng biến môi trường để linh động giữa Localhost và Deploy thật
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await transporter.sendMail({ from: `"TechZone" <${process.env.EMAIL_USER}>`, to: user.email, subject: "Khôi phục mật khẩu", html: `<a href="${resetUrl}">Khôi phục</a>` });
    res.status(200).json({ message: "Đã gửi email khôi phục." });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const resetPassword = async (req, res) => { 
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Lỗi người dùng!" });
    user.password = req.body.password;
    await user.save();
    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) { res.status(400).json({ message: "Link hết hạn!" }); }
};

// =========================================================
// 🚀 3. ĐĂNG NHẬP BẰNG GOOGLE
// =========================================================
const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const { email, name, picture } = data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        password: Date.now().toString() + Math.random().toString(), 
        isVerified: true 
      });
    }

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
    res.status(400).json({ message: "Xác thực Google thất bại. Vui lòng thử lại!" });
  }
};

module.exports = { 
  registerUser, 
  verifyOTP, 
  loginUser, 
  getUsersCRM, 
  sendMarketingEmail,
  getUserProfile,      
  updateUserProfile,   
  getWishlist,         
  toggleWishlist,
  forgotPassword, 
  resetPassword,
  googleLogin 
};