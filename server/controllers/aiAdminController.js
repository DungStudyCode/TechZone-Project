// server/controllers/aiAdminController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Order = require('../models/Order');
const Product = require('../models/Product');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Dùng model gemini-pro cho ổn định
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
  ]
});

// --- TÍNH NĂNG 1: PHÂN TÍCH KHÁCH HÀNG (ĐÃ SỬA PROMPT) ---
exports.analyzeCustomerSentiment = async (req, res) => {
  try {
    const reviews = await Product.aggregate([
      { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: false } },
      { $sort: { "reviews.createdAt": -1 } },
      { $limit: 30 },
      {
        $project: {
          _id: 0,
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          productName: "$name"
        }
      }
    ]);

    if (!reviews || reviews.length === 0) {
      return res.json({ analysis: "⚠️ Chưa có đủ dữ liệu đánh giá để phân tích." });
    }

    const reviewsText = reviews.map(r => 
      `- "${r.comment}" (${r.rating} sao) cho món ${r.productName}`
    ).join('\n');

    // 👇 PROMPT MỚI: Yêu cầu không dùng dấu *, trình bày rõ ràng
    const prompt = `
      Bạn là Giám đốc CSKH. Hãy phân tích danh sách đánh giá sau:
      ${reviewsText}

      YÊU CẦU ĐỊNH DẠNG (BẮT BUỘC):
      1. Tuyệt đối KHÔNG dùng ký tự ** hay ## hay *. 
      2. Dùng chữ IN HOA để làm tiêu đề các mục.
      3. Dùng dấu gạch ngang (-) để liệt kê ý.
      4. Trình bày ngắn gọn, súc tích, chia đoạn rõ ràng.

      CẤU TRÚC TRẢ LỜI:
      TỔNG QUAN CẢM XÚC:
      (Tóm tắt tình hình chung)

      ĐIỂM KHÁCH HÀNG KHEN:
      - (Liệt kê...)

      VẤN ĐỀ CẦN KHẮC PHỤC:
      - (Liệt kê...)

      GỢI Ý HÀNH ĐỘNG:
      - (Đề xuất...)
    `;
    
    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text() });

  } catch (error) {
    console.error("LỖI CHI TIẾT (Customer):", error);
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

// --- TÍNH NĂNG 2: CHIẾN LƯỢC KINH DOANH (ĐÃ SỬA PROMPT) ---
exports.analyzeBusinessStrategy = async (req, res) => {
  try {
    // Lấy doanh thu (nếu không có đơn paid thì lấy tất cả đơn để test)
    let salesData = await Order.aggregate([
      { $match: { isPaid: true } }, 
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
          count: { $sum: "$orderItems.qty" }
        }
      }
    ]);

    // Fallback: Nếu không có đơn đã thanh toán, lấy thử đơn chưa thanh toán để demo
    if (salesData.length === 0) {
        salesData = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
              $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "productInfo" }
            },
            { $unwind: "$productInfo" },
            {
              $group: {
                _id: "$productInfo.category",
                revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
                count: { $sum: "$orderItems.qty" }
              }
            }
          ]);
    }

    if (salesData.length === 0) {
       return res.json({ analysis: "⚠️ Chưa có dữ liệu đơn hàng nào để phân tích." });
    }

    const reportText = salesData.map(i => `- Danh mục ${i._id}: Bán ${i.count}, Thu ${i.revenue.toLocaleString()}đ`).join('\n');

    // 👇 PROMPT MỚI: Rõ ràng, không Markdown rác
    const prompt = `
      Dữ liệu kinh doanh:
      ${reportText}

      YÊU CẦU ĐỊNH DẠNG:
      - KHÔNG dùng ký tự ** hay ##.
      - Dùng chữ IN HOA cho tiêu đề.
      - Gạch đầu dòng (-) cho các ý.

      HÃY TRẢ LỜI THEO CẤU TRÚC:
      1. NHẬN XÉT DOANH THU:
      (Phân tích ngắn gọn)

      2. MẶT HÀNG CHỦ LỰC:
      (Nêu tên danh mục bán tốt nhất)

      3. ĐỀ XUẤT NHẬP HÀNG:
      (Nên nhập gì thêm?)

      4. CHIẾN LƯỢC KHUYẾN MÃI:
      (Gợi ý 1 combo bán hàng cụ thể)
    `;

    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text() });

  } catch (error) {
    console.error("LỖI CHI TIẾT (Strategy):", error);
    res.status(500).json({ message: "Lỗi xử lý: " + error.message });
  }
};