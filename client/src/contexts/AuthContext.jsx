// client/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
// Lưu ý: Không cần import useEffect nữa

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- SỬA LỖI Ở ĐÂY ---
  // Thay vì dùng useEffect, ta lấy dữ liệu ngay lúc khởi tạo state.
  // Code này chỉ chạy 1 lần duy nhất khi F5 trang -> Hiệu năng tốt hơn.
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);