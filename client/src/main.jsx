// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './contexts/CartContext.jsx' 
import { AuthProvider } from './contexts/AuthContext.jsx'; 
// ✅ 1. Import Provider của Google
import { GoogleOAuthProvider } from '@react-oauth/google';

// ✅ 2. Lấy Key từ file .env
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("GOOGLE CLIENT ID LÀ:", clientId); // Thêm dòng này để kiểm tra giá trị clientId

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ 3. Bọc GoogleOAuthProvider ở ngoài cùng */}
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)