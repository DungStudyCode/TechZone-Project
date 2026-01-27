// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Vite sẽ tự động chọn link dựa trên môi trường đang chạy
  baseURL: import.meta.env.VITE_API_URL, 
});

// --- KIỂM TRA ĐOẠN NÀY ---
// Tự động thêm Token vào mọi request nếu có
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
// --------------------------

export default api;