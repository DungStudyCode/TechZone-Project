// server/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require('../models/Product');
require('dotenv').config();

// Khởi tạo Gemini với API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    // --- BƯỚC 1: TÌM KIẾM VÀ LẤY DỮ LIỆU ĐÁNH GIÁ ---
    let relatedProducts = [];
    
    const keywords = message.split(' ').filter(word => word.length > 2);
    
    if (keywords.length > 0) {
        const regexQueries = keywords.map(word => ({ 
            name: { $regex: word, $options: 'i' } 
        }));

        // Tìm trong MongoDB
        const productsRaw = await Product.find({ 
            $or: regexQueries 
        })
        // ✅ LẤY THÊM: rating, numReviews, reviews
        .select('name price image slug description rating numReviews reviews') 
        .limit(3);

        // ✅ XỬ LÝ REVIEW: Chỉ lấy 3 review mới nhất để gửi cho AI (tránh quá tải)
        relatedProducts = productsRaw.map(p => {
            const topReviews = p.reviews && p.reviews.length > 0
                ? p.reviews.slice(-3).map(r => `"${r.comment}" (${r.rating} sao)`).join("; ")
                : "Chưa có đánh giá chi tiết";

            return {
                _id: p._id,
                name: p.name,
                price: p.price,
                image: p.image,
                slug: p.slug,
                rating: p.rating,          // Gửi sao cho Frontend vẽ
                numReviews: p.numReviews,
                recentReviews: topReviews  // Gửi nội dung review cho AI đọc
            };
        });
    }

    // --- BƯỚC 2: CHUẨN BỊ CONTEXT CHO AI ---
    let productContext = "";
    if (relatedProducts.length > 0) {
        // Tạo context gọn nhẹ chỉ chứa thông tin cần thiết cho AI
        const contextForAI = relatedProducts.map(p => ({
            name: p.name,
            price: p.price,
            rating: p.rating,
            reviews: p.recentReviews // AI sẽ đọc cái này
        }));

        productContext = `
        Dưới đây là thông tin sản phẩm và PHẢN HỒI CỦA KHÁCH HÀNG CŨ:
        ${JSON.stringify(contextForAI)}
        `;
    }

    // --- BƯỚC 3: CẤU HÌNH MODEL ---
    // Lưu ý: Mình để "gemini-1.5-flash" vì bản "2.5" hiện chưa ổn định công khai (gây lỗi 404)
    // Nếu bạn chắc chắn tài khoản bạn dùng được 2.5 thì cứ sửa lại số nhé.
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
    });
    
    // Tạo Prompt
    const prompt = `
      Bạn là nhân viên tư vấn nhiệt tình của TechZone.
      Khách hàng hỏi: "${message}"
      
      ${productContext}

      YÊU CẦU TRẢ LỜI:
      1. Ngắn gọn, thân thiện (dưới 100 từ).
      2. Giới thiệu giá sản phẩm nếu có.
      3. QUAN TRỌNG: Hãy khéo léo nhắc đến đánh giá của khách hàng cũ (dựa trên thông tin "rating" và "reviews" tôi cung cấp). Ví dụ: "Sản phẩm này được khách khen pin trâu lắm ạ...".
      4. KHÔNG gửi link ảnh/link mua.
      5. Tuyệt đối KHÔNG dùng ký tự ** (in đậm). Chỉ dùng văn bản thường.
    `;

    // Gửi yêu cầu
    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    // ✅ LÀM SẠCH KỸ LƯỠNG (Xóa dấu ** nếu AI lỡ tạo ra)
    textResponse = textResponse.replace(/\*\*/g, '').replace(/##/g, '').trim();

    // --- BƯỚC 4: TRẢ KẾT QUẢ ---
    res.json({
        reply: textResponse,
        products: relatedProducts 
    });

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ 
        reply: "Xin lỗi, hiện tại tôi đang bị quá tải một chút. Bạn vui lòng hỏi lại sau ít phút nhé!",
        products: []
    });
  }
};