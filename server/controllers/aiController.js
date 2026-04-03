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
    const regexQueries = keywords.map(word => ({ 
        name: { $regex: word, $options: 'i' } 
    }));

    // TÌM KIẾM VÀ SẮP XẾP ƯU TIÊN (RANKING LOGIC)
    const productsRaw = await Product.find({ 
        $or: regexQueries 
    })
    // Thêm các trường mới vào select để AI có dữ liệu phân tích
    .select('name price image slug description rating numReviews reviews isPromoted soldCount') 
    // Logic sắp xếp: isPromoted (Hot) -> Rating (Sao) -> SoldCount (Bán chạy)
    .sort({ 
        isPromoted: -1, 
        rating: -1, 
        soldCount: -1 
    })
    .limit(5); // Tăng lên 5 để AI có nhiều lựa chọn tốt nhất

    // XỬ LÝ DỮ LIỆU TRẢ VỀ (Thêm nhãn Hot/Best Seller cho AI biết)
    relatedProducts = productsRaw.map(p => {
        const topReviews = p.reviews && p.reviews.length > 0
            ? p.reviews.slice(-3).map(r => `"${r.comment}" (${r.rating} sao)`).join("; ")
            : "Chưa có đánh giá chi tiết";

        // Tạo nhãn thông báo độ "Hot" cho AI
        let statusTag = "";
        if (p.isPromoted) statusTag = "[SẢN PHẨM HOT ĐANG KHUYẾN MÃI]";
        else if (p.soldCount > 50) statusTag = "[BÁN CHẠY NHẤT]";

        return {
            _id: p._id,
            name: `${statusTag} ${p.name}`, // Gắn nhãn vào tên để AI dễ nhận biết
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
      6. ƯU TIÊN SẢN PHẨM: Trong danh sách tôi cung cấp, những máy có nhãn [SẢN PHẨM HOT] hoặc [BÁN CHẠY NHẤT] là những máy tốt nhất. Hãy ưu tiên giới thiệu chúng trước và dùng lời lẽ thuyết phục để khách hàng cân nhắc.
      7. HIỂN THỊ: Giữ nguyên các nhãn [SẢN PHẨM HOT] trong câu trả lời để tạo sự chú ý.
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

// Thêm API tạo thư Marketing
exports.generateMarketingEmail = async (req, res) => {
  try {
    const { name, totalSpent, orderCount, segment } = req.body;
    
    // Gọi lại genAI đã khởi tạo ở trên cùng file
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Đặt lệnh cho AI
    const prompt = `
      Bạn là Giám đốc CSKH của hệ thống bán lẻ công nghệ TechZone.
      Nhiệm vụ: Viết 1 đoạn Email cá nhân hóa cực kỳ khéo léo để tri ân khách hàng và mời họ mua sắm tiếp.
      
      Thông tin khách hàng:
      - Tên: ${name}
      - Nhóm khách hàng: ${segment}
      - Số tiền đã chi tiêu tại cửa hàng: ${totalSpent} VNĐ
      - Số lượng đơn hàng đã mua: ${orderCount} đơn

      Yêu cầu:
      - Xưng hô lịch sự (Chào anh/chị ${name}).
      - Nhắc khéo đến sự ủng hộ của họ (nhắc đến số tiền hoặc số đơn hàng một cách tinh tế).
      - Tặng họ 1 mã giảm giá 5% (Mã: VIP5) để mua phụ kiện, điện thoại mới.
      - Viết ngắn gọn (khoảng 100 - 150 từ), không dòng vo.
      - Tuyệt đối KHÔNG dùng ký tự ** (in đậm) hay mã HTML.
    `;

    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    res.json({ emailContent: textResponse.trim() });
  } catch (error) {
    console.error("Lỗi tạo email AI:", error);
    res.status(500).json({ message: "Lỗi khi gọi Gemini AI" });
  }
};