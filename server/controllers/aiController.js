// server/controllers/aiController.js
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithCustomer = async (req, res) => {
  try {
    const { message, userId, currentProductId, cartItems } = req.body; // Frontend gửi lên

    // 1. Lấy thông tin User & Lịch sử mua hàng (Personalization)
    let userContext = "Khách hàng ẩn danh.";
    if (userId) {
      const user = await User.findById(userId);
      const lastOrders = await Order.find({ user: userId })
                                    .sort({ createdAt: -1 }).limit(3)
                                    .populate('orderItems.product', 'name');
      
      const boughtItems = lastOrders.map(o => 
        o.orderItems.map(i => i.product?.name).join(', ')
      ).join('; ');

      userContext = `Tên khách: ${user.name}. Đã từng mua: ${boughtItems || 'Chưa có'}.`;
    }

    // 2. Lấy thông tin sản phẩm đang xem để gợi ý (Cross-selling)
    let productContext = "";
    let suggestedProducts = [];
    
    if (currentProductId) {
      const currentProduct = await Product.findById(currentProductId);
      productContext = `Khách đang xem sản phẩm: ${currentProduct.name} (Loại: ${currentProduct.category}).`;

      // Logic tìm phụ kiện: Tìm sản phẩm khác category nhưng liên quan (ví dụ đơn giản)
      // Trong thực tế, bạn có thể hardcode map: Laptop -> Mouse, Balo
      if (currentProduct.category === 'Laptop') {
        suggestedProducts = await Product.find({ category: { $in: ['Mouse', 'Keyboard', 'Accessories'] } }).limit(5).select('name price');
      } else {
        // Gợi ý sản phẩm cùng loại
        suggestedProducts = await Product.find({ category: currentProduct.category, _id: { $ne: currentProductId } }).limit(3).select('name price');
      }
    }
    
    // Convert list gợi ý sang chuỗi để AI đọc
    const suggestionText = suggestedProducts.map(p => `- ${p.name} (${p.price.toLocaleString()}đ)`).join('\n');

    // 3. TẠO SYSTEM PROMPT (QUAN TRỌNG)
    const systemPrompt = `
      Bạn là trợ lý ảo chuyên nghiệp của TechZone.
      
      THÔNG TIN KHÁCH HÀNG:
      ${userContext}
      
      BỐI CẢNH HIỆN TẠI:
      ${productContext}
      ${cartItems && cartItems.length > 0 ? `Trong giỏ hàng đang có: ${cartItems.map(i => i.name).join(', ')}` : ''}
      
      DANH SÁCH SẢN PHẨM GỢI Ý CÓ SẴN TRONG KHO (Dùng để Cross-selling):
      ${suggestionText}

      NHIỆM VỤ:
      1. Nếu khách đã đăng nhập, hãy chào bằng tên thật thân thiện.
      2. Dựa vào lịch sử mua hàng, hãy hỏi thăm sản phẩm cũ dùng có tốt không.
      3. Nếu khách đang xem Laptop, hãy khéo léo gợi ý mua thêm Chuột hoặc Balo từ danh sách trên (Cross-selling).
      4. Trả lời ngắn gọn, tập trung vào bán hàng, giọng văn vui vẻ.
      5. Câu hỏi của khách: "${message}"
    `;

    // 4. Gọi Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    res.json({ reply: response });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Error" });
  }
};