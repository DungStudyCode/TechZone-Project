// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Vite sẽ tự động chọn link dựa trên môi trường đang chạy
  baseURL: import.meta.env.VITE_API_URL, 
});

// Tự động thêm Token vào mọi request nếu có
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
    // Có thể thêm logic xóa localStorage bị hỏng tại đây: 
    // localStorage.removeItem('userInfo');
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;