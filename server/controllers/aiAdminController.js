// server/controllers/aiAdminController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Order = require('../models/Order');
const Product = require('../models/Product'); // Giả sử bạn có model Review, nếu review nằm trong Product thì cần điều chỉnh
const Review = require('../models/Review'); 

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// TÍNH NĂNG 1: PHÂN TÍCH ĐÁNH GIÁ & GIỮ CHÂN KHÁCH
// ==========================================
exports.analyzeCustomerSentiment = async (req, res) => {
  try {
    // 1. Lấy 50 đánh giá gần nhất, kèm thông tin user để biết ai đang khen/chê
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name email loyaltyScore'); // Lấy tên, email và điểm thân thiết

    if (!reviews || reviews.length === 0) {
      return res.status(400).json({ message: "Chưa có dữ liệu đánh giá để phân tích." });
    }

    // 2. Chế biến dữ liệu thô thành văn bản cho AI đọc
    const reviewsText = reviews.map((r, index) => 
      `#${index+1}. [Khách: ${r.user?.name || 'Ẩn danh'} - Email: ${r.user?.email || 'N/A'}] chấm ${r.rating} sao. Nội dung: "${r.comment}"`
    ).join('\n');

    // 3. Viết System Prompt chuyên sâu cho CSKH
    const prompt = `
      Bạn là Giám đốc Trải nghiệm Khách hàng (CXO) của TechZone.
      Nhiệm vụ: Phân tích danh sách 50 đánh giá gần nhất dưới đây để đưa ra giải pháp giữ chân khách hàng.

      DỮ LIỆU ĐẦU VÀO:
      ${reviewsText}

      YÊU CẦU ĐẦU RA (Định dạng Markdown bắt buộc):
      1. **Tổng quan Cảm xúc**: Tỉ lệ % Tích cực/Tiêu cực. Vấn đề gì đang bị phàn nàn nhiều nhất (Ship hàng chậm, Hàng lỗi, Thái độ...)?
      2. **🚨 BÁO ĐỘNG ĐỎ (Khách hàng rủi ro)**: Liệt kê danh sách khách hàng đánh giá 1-2 sao. Với từng người, hãy đề xuất hành động cụ thể (Ví dụ: "Gửi mã giảm giá 50k", "Gọi điện xin lỗi").
      3. **💎 KHÁCH HÀNG KIM CƯƠNG (VIP)**: Liệt kê những khách khen ngợi nhiệt tình. Đề xuất cách thưởng cho họ (Ví dụ: "Nâng hạng thành viên", "Tặng quà tri ân").
      4. **Đề xuất cải thiện quy trình**: Dựa trên các phàn nàn, TechZone cần thay đổi quy trình vận hành nào ngay lập tức?
    `;

    // 4. Gọi AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    
    res.json({ analysis: result.response.text() });

  } catch (error) {
    console.error("AI Review Analysis Error:", error);
    res.status(500).json({ error: "Lỗi khi phân tích đánh giá." });
  }
};

// ==========================================
// TÍNH NĂNG 2: TƯ VẤN CHIẾN LƯỢC KINH DOANH
// ==========================================
exports.analyzeBusinessStrategy = async (req, res) => {
  try {
    // 1. Dùng Aggregation Pipeline để tính toán số liệu trước (Rất quan trọng để tối ưu hiệu năng)
    const salesData = await Order.aggregate([
      { $match: { isPaid: true } }, // Chỉ lấy đơn đã thanh toán
      { $unwind: "$orderItems" },   // Tách các món hàng trong đơn ra
      {
        $lookup: {                  // Join với bảng Products để lấy Brand/Category
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $group: {                   // Gom nhóm theo Category và Brand
          _id: { 
            category: "$productInfo.category", 
            brand: "$productInfo.brand" 
          },
          totalQtySold: { $sum: "$orderItems.qty" }, // Tổng số lượng bán
          totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } } // Tổng doanh thu
        }
      },
      { $sort: { totalRevenue: -1 } } // Sắp xếp doanh thu giảm dần
    ]);

    // 2. Chuyển dữ liệu JSON sang chuỗi text
    const dataString = salesData.map(item => 
      `- Danh mục: ${item._id.category} | Hãng: ${item._id.brand} | Bán được: ${item.totalQtySold} cái | Doanh thu: ${item.totalRevenue.toLocaleString()} VNĐ`
    ).join('\n');

    // 3. Viết System Prompt cho Chuyên gia kinh tế
    const prompt = `
      Bạn là Cố vấn Chiến lược Kinh doanh cấp cao của TechZone. 
      Dưới đây là báo cáo doanh thu thực tế theo Danh mục và Thương hiệu:

      ${dataString}

      HÃY PHÂN TÍCH VÀ TRẢ LỜI CÁC CÂU HỎI SAU (Định dạng Markdown):
      
      ### 1. 🏆 Ngôi sao doanh thu
      Mặt hàng/Thương hiệu nào đang là "con gà đẻ trứng vàng"? Tại sao (dựa trên tỷ lệ số lượng/doanh thu)?

      ### 2. 📉 Hàng tồn kho/Kém hiệu quả
      Nhóm sản phẩm nào doanh số quá thấp? Có nên tiếp tục nhập hàng hay xả kho cắt lỗ?

      ### 3. 🔮 Dự đoán & Nhập hàng
      Dựa trên xu hướng trên, tháng tới TechZone nên tập trung vốn nhập loại hàng nào (Ví dụ: Nếu Apple bán chạy, hãy đề xuất nhập thêm phụ kiện Apple)?
      
      ### 4. 💡 Chiến lược Marketing
      Đề xuất 1 chiến dịch khuyến mãi cụ thể đánh vào nhóm sản phẩm tiềm năng (Ví dụ: "Mua Laptop Dell tặng Chuột Logitech" nếu 2 hãng này có liên quan).
    `;

    // 4. Gọi AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);

    res.json({ analysis: result.response.text() });

  } catch (error) {
    console.error("AI Sales Analysis Error:", error);
    res.status(500).json({ error: "Lỗi khi phân tích chiến lược." });
  }
};