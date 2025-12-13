// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Đường dẫn Backend của bạn
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;