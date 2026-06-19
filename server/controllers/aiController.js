// server/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require('../models/Product');
require('dotenv').config();

// Khởi tạo Gemini với API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const greetingKeywords = ['hi', 'hello', 'chào', 'xin chào', 'alo', 'có ai không', 'ê', 'shop ơi', 'tư vấn', 'cho mình hỏi'];

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    let parsedMessage = message.toLowerCase().trim();
    
    const isGreeting = greetingKeywords.some(keyword => parsedMessage === keyword || (parsedMessage.includes(keyword) && parsedMessage.length < 15));

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
        ]
    });

    let prompt = "";
    let relatedProducts = [];

    if (isGreeting) {
        prompt = `
          Bạn là "Trợ lý ảo TechZone" - nhân viên tư vấn siêu thân thiện và am hiểu công nghệ của hệ thống bán lẻ TechZone.
          Khách hàng vừa nói: "${message}"

          YÊU CẦU TRẢ LỜI:
          1. Chào lại khách hàng một cách lịch sự, vui vẻ.
          2. Hỏi xem khách hàng đang quan tâm đến dòng sản phẩm nào (Điện thoại, Laptop, Phụ kiện, v.v.).
          3. Tuyệt đối KHÔNG nhắc đến chữ "hết hàng" hay "không tìm thấy sản phẩm".
          4. Trả lời ngắn gọn dưới 50 từ.
        `;
    } 
    else {
        parsedMessage = parsedMessage.replace(/\bip\b/g, 'iphone');
        parsedMessage = parsedMessage.replace(/\bss\b/g, 'samsung');
        parsedMessage = parsedMessage.replace(/\bprm\b/g, 'pro max');

        const keywords = parsedMessage.split(' ').filter(word => word.trim().length > 1);
        
        if (keywords.length > 0) {
            const regexQueries = keywords.map(word => ({ 
                name: { $regex: word, $options: 'i' } 
            }));

            const productsRaw = await Product.find({ $or: regexQueries })
                .select('name price image slug description rating numReviews reviews isPromoted soldCount category') 
                .sort({ isPromoted: -1, rating: -1, soldCount: -1 })
                .limit(4);

            relatedProducts = productsRaw.map(p => {
                const topReviews = p.reviews && p.reviews.length > 0
                    ? p.reviews.slice(-2).map(r => `"${r.comment}" (${r.rating} sao)`).join("; ")
                    : "Chưa có đánh giá";

                let statusTag = "";
                if (p.isPromoted) statusTag = "[🔥 ĐANG KHUYẾN MÃI]";
                else if (p.soldCount > 50) statusTag = "[🌟 BÁN CHẠY]";

                return {
                    _id: p._id,
                    name: `${statusTag} ${p.name}`, 
                    price: p.price,
                    image: p.image,
                    slug: p.slug,
                    rating: p.rating,          
                    reviews: topReviews,
                    category: p.category
                };
            });
        }

        let fallbackProducts = [];
        if (relatedProducts.length === 0) {
             const hotItems = await Product.find({ isPromoted: true }).select('name slug price').limit(2);
             fallbackProducts = hotItems.map(h => ({ name: h.name, slug: h.slug, price: h.price }));
        }

        let productContext = "";
        if (relatedProducts.length > 0) {
            productContext = `
            DỮ LIỆU SẢN PHẨM TÌM ĐƯỢC:
            ${JSON.stringify(relatedProducts.map(p => ({ name: p.name, price: p.price, slug: p.slug, reviews: p.reviews })))}
            `;
        } else {
            productContext = `
            KẾT QUẢ: Không tìm thấy sản phẩm khách yêu cầu.
            GỢI Ý CHỮA CHÁY (Các sản phẩm Hot khác đang có sẵn): ${JSON.stringify(fallbackProducts)}
            `;
        }

        prompt = `
          Bạn là nhân viên tư vấn nhiệt tình của TechZone.
          Khách hàng hỏi: "${message}"
          
          ${productContext}

          YÊU CẦU TRẢ LỜI:
          1. Nếu tìm thấy sản phẩm: Báo giá, tóm tắt đánh giá ngắn gọn. BẮT BUỘC chèn link mua hàng bằng thẻ: <br><a href="/product/tên-slug" class="text-blue-600 font-bold underline">👉 Xem chi tiết [Tên Sản Phẩm]</a>
          2. Nếu KHÔNG tìm thấy sản phẩm khách hỏi: Hãy xin lỗi khéo léo. Sau đó, CHỦ ĐỘNG giới thiệu "GỢI Ý CHỮA CHÁY" (nếu có) và chèn link của các sản phẩm gợi ý đó.
          3. Nếu có nhãn [🔥 ĐANG KHUYẾN MÃI] hoặc [🌟 BÁN CHẠY], hãy nhấn mạnh để kích thích khách mua.
          4. Trình bày thân thiện, ngắn gọn (dưới 100 từ), dùng thẻ <br> để xuống dòng cho dễ nhìn. Tuyệt đối KHÔNG dùng ký tự **.
        `;
    }

    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    textResponse = textResponse.replace(/\*\*/g, '').replace(/##/g, '').trim();

    res.json({
        reply: textResponse,
        products: relatedProducts 
    });

  } catch (error) {
    console.error("Chatbot Error:", error);
    
    // ✅ ĐÃ SỬA: Phóng thẳng lỗi thật của Google ra ngoài UI để xem Server đang bị gì
    res.status(500).json({ 
        reply: `[LỖI TỪ SERVER]: ${error.message || 'Lỗi không xác định'}. Vui lòng kiểm tra lại cấu hình Hosting!`,
        products: []
    });
  }
};

exports.generateMarketingEmail = async (req, res) => {
  try {
    const { name, totalSpent, orderCount, segment } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    res.status(500).json({ message: `Lỗi AI: ${error.message}` });
  }
};