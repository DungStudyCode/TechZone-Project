// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://techzone-project.onrender.com/api',
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