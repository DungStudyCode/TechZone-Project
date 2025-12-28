// client/src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  // Kiểm tra: Nếu có User VÀ User đó là Admin -> Cho phép vào
  if (user && user.isAdmin) {
    return children;
  }
  
  // Nếu không -> Đá về trang chủ
  return <Navigate to="/" />;
};

export default AdminRoute;