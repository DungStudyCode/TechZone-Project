// client/src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return alert("Mật khẩu nhập lại không khớp!");
    }

    try {
      // Gọi API đăng ký
      const { data } = await api.post('/users', { name, email, password });
      
      // Đăng ký xong thì tự động đăng nhập luôn
      login(data);
      
      alert('Đăng ký thành công!');
      navigate('/'); // Chuyển về trang chủ
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký tài khoản</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Họ tên</label>
            <input 
              type="text" required className="w-full border p-2 rounded" 
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input 
              type="email" required className="w-full border p-2 rounded" 
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Mật khẩu</label>
            <input 
              type="password" required className="w-full border p-2 rounded" 
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Nhập lại mật khẩu</label>
            <input 
              type="password" required className="w-full border p-2 rounded" 
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Đăng ký
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Đã có tài khoản? <Link to="/login" className="text-blue-600">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;