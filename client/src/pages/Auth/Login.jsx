// client/src/pages/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaUserCircle, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // ✅ STATE: Lưu danh sách tài khoản đã từng đăng nhập trên máy này
  const [recentAccounts, setRecentAccounts] = useState([]);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split('=')[1] : '/';

  // Khi mở trang, đọc danh sách tài khoản cũ từ Local Storage
  useEffect(() => {
    const saved = localStorage.getItem('tz_recent_accounts');
    if (saved) {
      setRecentAccounts(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ HÀM: Chọn tài khoản từ danh sách gợi ý
  const selectRecentAccount = (email) => {
    setFormData({ email: email, password: '' }); // Chỉ điền email, xóa trống mật khẩu
    document.getElementById('passwordInput').focus(); // Tự động trỏ chuột vào ô mật khẩu
  };

  // ✅ HÀM: Xóa một tài khoản khỏi danh sách gợi ý
  const removeRecentAccount = (e, emailToRemove) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
    const updatedAccounts = recentAccounts.filter(acc => acc.email !== emailToRemove);
    setRecentAccounts(updatedAccounts);
    localStorage.setItem('tz_recent_accounts', JSON.stringify(updatedAccounts));
    if (formData.email === emailToRemove) setFormData({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/users/login', {
        email: formData.email,
        password: formData.password
      });
      
      // ✅ LOGIC: Cập nhật danh sách "Tài khoản gần đây" (Chỉ lưu Tên, Email, Avatar)
      const newAccount = { email: data.email, name: data.name, avatar: data.avatar };
      const filtered = recentAccounts.filter(acc => acc.email !== data.email); // Bỏ cái cũ nếu trùng
      const updatedList = [newAccount, ...filtered].slice(0, 3); // Lưu tối đa 3 tài khoản gần nhất
      
      localStorage.setItem('tz_recent_accounts', JSON.stringify(updatedList));

      login(data);
      toast.success('Đăng nhập thành công!');
      navigate(redirect); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sai email hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const { data } = await api.post('/users/google-login', { access_token: tokenResponse.access_token });
        
        // Cập nhật gợi ý tài khoản cho Google Login
        const newAccount = { email: data.email, name: data.name, avatar: data.avatar };
        const filtered = recentAccounts.filter(acc => acc.email !== data.email);
        const updatedList = [newAccount, ...filtered].slice(0, 3);
        localStorage.setItem('tz_recent_accounts', JSON.stringify(updatedList));

        login(data);
        toast.success('Đăng nhập Google thành công!');
        navigate(redirect);
      } catch (err) {
        toast.error('Xác thực Google thất bại!');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        <div className="md:w-1/2 p-10 lg:p-14 relative order-2 md:order-1">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h3>
          <p className="text-gray-500 text-sm mb-6">Vui lòng nhập thông tin tài khoản của bạn</p>

          {/* ✅ KHU VỰC HIỂN THỊ TÀI KHOẢN GẦN ĐÂY (STYLE FACEBOOK) */}
          {recentAccounts.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tài khoản trên máy này</p>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {recentAccounts.map((acc, index) => (
                  <div 
                    key={index} 
                    onClick={() => selectRecentAccount(acc.email)}
                    className={`relative flex items-center gap-3 p-2 pr-4 rounded-full border cursor-pointer transition-all min-w-max hover:bg-purple-50 hover:border-purple-200 ${formData.email === acc.email ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 bg-white'}`}
                  >
                    {acc.avatar ? (
                      <img src={acc.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <FaUserCircle className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="text-sm font-bold text-gray-700 truncate max-w-[100px]">{acc.name}</span>
                    <button 
                      onClick={(e) => removeRecentAccount(e, acc.email)}
                      className="absolute -top-1 -right-1 bg-gray-200 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-[10px]"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email" name="email" required autoComplete="username"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium"
                placeholder="Địa chỉ Email"
                value={formData.email} onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="passwordInput"
                type={showPassword ? "text" : "password"} name="password" required autoComplete="current-password"
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium"
                placeholder="Mật khẩu"
                value={formData.password} onChange={handleChange}
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex items-center justify-end mt-2">
              <Link to="/forgot-password" className="text-sm font-bold text-purple-600 hover:text-purple-800">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "ĐĂNG NHẬP"}
            </button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full absolute"></div>
            <span className="bg-white px-4 text-xs text-gray-400 relative z-10 font-bold tracking-wider">HOẶC</span>
          </div>

          <button 
            type="button" onClick={() => handleGoogleLogin()}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl"
          >
            <FaGoogle className="text-red-500 text-lg" /> Đăng nhập bằng Google
          </button>
        </div>

        {/* CỘT PHẢI */}
        <div className="md:w-1/2 bg-purple-700 text-white p-12 flex flex-col justify-center relative overflow-hidden order-1 md:order-2">
          {/* ... (Giữ nguyên giao diện cột phải của bạn) ... */}
          <div className="relative z-10 pl-4 border-l-4 border-purple-400">
            <h2 className="text-4xl font-black mb-6">TechZone</h2>
            <p className="text-purple-100 text-lg leading-relaxed font-medium">Chào mừng bạn quay trở lại! Đăng nhập để tiếp tục mua sắm.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;