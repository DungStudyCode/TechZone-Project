// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Tạo bộ gửi mail (Transporter) liên kết với Gmail của bạn
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Thiết lập nội dung thư
  const mailOptions = {
    from: '"TechZone Support" <no-reply@techzone.vn>', // Tên người gửi hiển thị
    to: options.email,                               // Email khách hàng
    subject: options.subject,                        // Tiêu đề thư
    html: options.message,                           // Nội dung thư (Hỗ trợ thẻ HTML)
  };

  // 3. Tiến hành gửi
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;