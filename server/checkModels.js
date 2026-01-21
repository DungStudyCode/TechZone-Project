// File: checkModels.js
require('dotenv').config(); // Load biến môi trường từ file .env

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY; // Đảm bảo tên biến khớp với file .env của bạn

if (!API_KEY) {
  console.error("❌ Lỗi: Không tìm thấy API KEY trong file .env");
  process.exit(1);
}

console.log("🔄 Đang kết nối tới Google AI để lấy danh sách model...");

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        console.error("❌ API trả về lỗi:", data.error.message);
        return;
    }

    console.log("\n✅ DANH SÁCH CÁC MODEL KHẢ DỤNG:");
    console.log("-----------------------------------");
    
    // Lọc và in ra các model 'gemini'
    const geminiModels = data.models.filter(m => m.name.includes('gemini'));
    
    if (geminiModels.length === 0) {
        console.log("Không tìm thấy model Gemini nào. Có thể API Key chưa được kích hoạt tính năng này.");
    } else {
        geminiModels.forEach(model => {
            console.log(`- ${model.name.replace('models/', '')}`); // Bỏ chữ 'models/' cho dễ nhìn
        });
    }
    
    console.log("-----------------------------------");
    console.log("💡 Gợi ý: Hãy dùng chính xác một trong các tên ở trên (ví dụ: gemini-1.5-flash) trong code của bạn.");

  } catch (error) {
    console.error("❌ Lỗi kết nối:", error);
  }
}

listModels();