// client/src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
// ✅ IMPORT TOAST
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!'); // ✅ Dùng Toast
      return setError('Mật khẩu xác nhận không khớp!');
    }
    
    // 2. Kiểm tra độ dài mật khẩu
    if (formData.password.length < 6) {
      toast.warn('Mật khẩu phải có ít nhất 6 ký tự!'); // ✅ Dùng Toast cảnh báo
      return setError('Mật khẩu phải có ít nhất 6 ký tự!');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      login(data);
      
      // ✅ Toast thành công màu xanh lá
      toast.success('Đăng ký thành công! Chào mừng đến với TechZone.');
      navigate('/'); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.';
      setError(errorMsg);
      toast.error(errorMsg); // ✅ Toast báo lỗi màu đỏ
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* CỘT TRÁI: Hình ảnh / Branding */}
        <div className="md:w-1/2 bg-purple-700 text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-800 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6 tracking-tight">TechZone</h2>
            <p className="text-purple-100 text-lg leading-relaxed mb-8 font-medium">
              Tham gia ngay hôm nay để nhận các ưu đãi độc quyền dành riêng cho thành viên và trải nghiệm mua sắm công nghệ đỉnh cao.
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: Form đăng ký */}
        <div className="md:w-1/2 p-10 lg:p-14">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h3>
          <p className="text-gray-500 text-sm mb-8">Điền thông tin bên dưới để bắt đầu</p>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 border border-red-100 font-bold flex items-center gap-2 animate-bounce">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Họ Tên */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder="Họ và tên của bạn"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Input Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder="Địa chỉ Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Input Mật khẩu */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder="Mật khẩu (Ít nhất 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Input Xác nhận mật khẩu */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-gray-400 opacity-50" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder="Xác nhận lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "ĐĂNG KÝ NGAY"
              )}
            </button>
          </form>

          {/* Dải phân cách */}
          <div className="mt-8 relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full absolute"></div>
            <span className="bg-white px-4 text-xs text-gray-400 relative z-10 font-bold tracking-wider">HOẶC ĐĂNG KÝ BẰNG</span>
          </div>

          {/* Social Login */}
          <button className="mt-6 w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:bg-gray-50 hover:border-purple-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all shadow-sm">
            <FaGoogle className="text-red-500 text-lg" /> Đăng ký bằng Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-600 font-medium">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-800 font-bold transition-colors underline decoration-2 underline-offset-4">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;