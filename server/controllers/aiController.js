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
    
    // 1. Dịch các từ viết tắt phổ biến của khách hàng để DB hiểu được
    let parsedMessage = message.toLowerCase();
    parsedMessage = parsedMessage.replace(/\bip\b/g, 'iphone');
    parsedMessage = parsedMessage.replace(/\bss\b/g, 'samsung');
    parsedMessage = parsedMessage.replace(/\bprm\b/g, 'pro max');

    // 2. Tách từ khóa: ✅ SỬA word.length > 2 THÀNH word.length > 1
    // Điều này giúp hệ thống lấy được các từ ngắn như "ip", "15", "s24"
    const keywords = parsedMessage.split(' ').filter(word => word.trim().length > 1);
    
    if (keywords.length > 0) {
        // Tạo query tìm kiếm: Chứa từ khóa này HOẶC từ khóa kia
        const regexQueries = keywords.map(word => ({ 
            name: { $regex: word, $options: 'i' } 
        }));

        // Tìm trong MongoDB
        const productsRaw = await Product.find({ 
            $or: regexQueries 
        })
        .select('name price image slug description rating numReviews reviews') 
        .limit(3);

        // XỬ LÝ REVIEW: Chỉ lấy 3 review mới nhất
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
                rating: p.rating,          
                numReviews: p.numReviews,
                recentReviews: topReviews  
            };
        });
    }
    // --- BƯỚC 2: CHUẨN BỊ CONTEXT CHO AI ---
    let productContext = "";
    if (relatedProducts.length > 0) {
        // ✅ ĐÃ SỬA LỖI: Thêm 'slug' vào context để AI có dữ liệu tạo link
        const contextForAI = relatedProducts.map(p => ({
            name: p.name,
            price: p.price,
            rating: p.rating,
            slug: p.slug, // AI sẽ lấy trường này để gắn vào thẻ <a>
            reviews: p.recentReviews 
        }));

        productContext = `
        DANH SÁCH SẢN PHẨM TRONG KHO VÀ ĐÁNH GIÁ:
        ${JSON.stringify(contextForAI)}
        `;
    } else {
        // Xử lý trường hợp khách hỏi đồ không có trong kho
        productContext = `DANH SÁCH SẢN PHẨM TRONG KHO: Không tìm thấy sản phẩm nào khớp với yêu cầu của khách.`;
    }

    // --- BƯỚC 3: CẤU HÌNH MODEL ---
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

      YÊU CẦU TRẢ LỜI BẮT BUỘC:
      1. Ngắn gọn, thân thiện (dưới 100 từ).
      2. Nếu danh sách sản phẩm rỗng, TUYỆT ĐỐI KHÔNG tự chế ra sản phẩm. Hãy xin lỗi và báo hết hàng.
      3. Nếu có sản phẩm, hãy giới thiệu giá và BẮT BUỘC chèn link mua hàng bằng thẻ HTML.
         - Cú pháp chuẩn: <br><a href="/product/tên-slug" class="text-blue-600 font-bold underline">👉 Nhấn vào đây để xem chi tiết và mua [Tên Sản Phẩm]</a>
         - Thay "tên-slug" bằng dữ liệu từ trường "slug" tôi cung cấp.
      4. Hãy tóm tắt ngắn gọn đánh giá của khách hàng (dựa trên "rating" và "reviews").
      5. Tuyệt đối KHÔNG dùng ký tự ** (in đậm). Chỉ dùng văn bản thường hoặc thẻ <b>.
    `;

    // Gửi yêu cầu
    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    // Làm sạch chuỗi
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