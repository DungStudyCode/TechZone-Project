// client/src/pages/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // 1. Lấy địa chỉ cần chuyển hướng từ URL (ví dụ: ?redirect=checkout)
  // Nếu không có thì mặc định về trang chủ ('/')
  const sp = new URLSearchParams(location.search);
  const redirect = sp.get('redirect') ? '/' + sp.get('redirect') : '/';

  // 2. Kiểm tra nếu đã đăng nhập rồi thì chuyển đi luôn
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/users/login', { email, password });
      
      // Lưu thông tin user vào Local Storage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      alert("Đăng nhập thành công!");
      
      // 3. Đăng nhập xong -> Chuyển hướng ngay lập tức
      navigate(redirect);
      
    } catch (err) {
      setError(err.response?.data?.message || "Sai email hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
             Chào mừng bạn quay trở lại TechZone
          </p>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to={redirect ? `/register?redirect=${redirect.substring(1)}` : '/register'} className="font-medium text-purple-600 hover:text-purple-500">
                    Đăng ký ngay
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;