import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API đăng nhập
      const { data } = await api.post('/users/login', { email, password });
      
      // Lưu thông tin user vào Context & LocalStorage
      login(data);
      
      alert('Đăng nhập thành công!');
      
      // Nếu là Admin thì chuyển sang trang Admin, ngược lại về trang chủ
      if (data.isAdmin) {
        navigate('/admin/orders');
      } else {
        navigate('/');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Đăng nhập
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;