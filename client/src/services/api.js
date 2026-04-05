// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Vite sẽ tự động chọn link dựa trên môi trường đang chạy
  baseURL: import.meta.env.VITE_API_URL, 
});

// ==========================================
// TRẠM KIỂM SOÁT 1: GẮN TOKEN VÀO REQUEST
// ==========================================
api.interceptors.request.use((config) => {
  try {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      
      // Kiểm tra chắc chắn token có tồn tại mới gán vào Header
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    }
  } catch (error) {
    // Đề phòng localStorage bị ai đó sửa bậy bạ thành text không phải JSON
    console.error("Lỗi khi đọc token từ localStorage:", error);
    localStorage.removeItem('userInfo'); // Xóa luôn nếu dữ liệu hỏng
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================
// TRẠM KIỂM SOÁT 2: BẮT LỖI TOKEN HẾT HẠN (401)
// ==========================================
api.interceptors.response.use(
  (response) => {
    // Mọi thứ êm đẹp thì cho qua
    return response;
  },
  (error) => {
    // Nếu Backend báo lỗi 401 (Unauthorized - Token chết hoặc sai)
    if (error.response && error.response.status === 401) {
      console.warn("Phiên đăng nhập hết hạn. Đang tự động đăng xuất...");
      
      // 1. Xóa sạch dữ liệu cũ
      localStorage.removeItem('userInfo');
      
      // 2. Đá văng về trang Login, kèm theo một cái đuôi cảnh báo trên URL
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;