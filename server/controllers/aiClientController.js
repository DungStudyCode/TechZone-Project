// Đặt dòng này lên đầu tiên để chắc chắn load được .env
require('dotenv').config(); 

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product"); 
const Order = require("../models/Order");
const User = require("../models/User");

// --- SỬA LẠI ĐOẠN LẤY KEY ---
// Code sẽ tự tìm cả 2 tên, dù bạn đặt là API_KEY hay GEMINI_API_KEY đều chạy được
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error("❌ LỖI: Chưa cấu hình GEMINI_API_KEY trong file .env");
    // Không throw error ở đây để tránh crash server, nhưng log ra để biết
}

// Khởi tạo model
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.chatWithAI = async (req, res) => {
  try {
    const { message, userId, context } = req.body; 

    // 1. TÌM KIẾM SẢN PHẨM
    const keywords = message.split(" ").filter(word => word.length > 2);
    const regexQuery = keywords.map(word => ({ name: { $regex: word, $options: 'i' } }));
    
    let products = [];
    if (regexQuery.length > 0) {
      products = await Product.find({ $or: regexQuery })
                              .select('name price countInStock description discount')
                              .limit(5); 
    }

    // 2. NGỮ CẢNH KHÁCH HÀNG
    let customerContext = "Khách hàng vãng lai.";
    if (userId) {
      // Dùng try-catch nhỏ để tránh lỗi nếu ID sai format
      try {
          const orders = await Order.find({ user: userId }).populate('orderItems.product');
          if (orders.length > 0) {
            const lastBought = orders[0].orderItems.map(item => item.name).join(", ");
            customerContext = `Khách hàng cũ. Từng mua: ${lastBought}.`;
          } else {
            customerContext = "Khách hàng mới đăng ký.";
          }
      } catch (err) {
          console.log("Lỗi check user:", err.message);
      }
    }

    // 3. GỌI AI
    const productInfo = JSON.stringify(products);
    const prompt = `
      Bạn là AI TechZone.
      Câu hỏi: "${message}"
      Dữ liệu kho: ${productInfo}
      Khách hàng: ${customerContext}
      Quy tắc: Tư vấn ngắn gọn, có emoji. Nếu countInStock=0 báo hết hàng.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({ reply: responseText });

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ reply: "Hệ thống đang bảo trì một chút 🤖" });
  }
};