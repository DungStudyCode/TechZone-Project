// client/src/pages/Auth/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";
// ✅ IMPORT HOOK CỦA GOOGLE
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Lấy các tham số trên thanh địa chỉ xuống
  const sp = new URLSearchParams(location.search);
  const redirect = sp.get("redirect") ? "/" + sp.get("redirect") : "/";
  const isExpired = sp.get("expired"); // Lấy cái đuôi ?expired=true

  useEffect(() => {
    // Nếu bị văng ra do hết hạn token, bắn một cái Toast nhắc nhở
    if (isExpired) {
      toast.warn(
        "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để bảo mật!",
        {
          toastId: "expired-toast", // Đảm bảo không bị hiện thông báo trùng lặp
        },
      );
    }

    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, isExpired]);

  // HÀM 1: ĐĂNG NHẬP BẰNG EMAIL/MẬT KHẨU THƯỜNG
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/users/login", { email, password });
      login(data);
      toast.success("Đăng nhập thành công! Chào mừng trở lại.");
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || "Sai email hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HÀM 2: ĐĂNG NHẬP BẰNG GOOGLE
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Lấy token Google cấp, gửi về Backend của mình để kiểm tra
        const { data } = await api.post("/users/google-login", {
          access_token: tokenResponse.access_token,
        });

        login(data); // Lưu user vào Context & LocalStorage
        toast.success("Đăng nhập bằng Google thành công!");
        navigate(redirect);
      } catch (err) {
        console.error("Lỗi Google Login:", err);
        toast.error("Lỗi máy chủ khi đăng nhập Google!");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Đăng nhập Google thất bại!");
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-gray-100">
        {/* CỘT PHẢI: Branding */}
        <div className="md:w-1/2 bg-purple-900 text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse"></div>
          <div
            className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-800 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6 tracking-tight">
              TechZone
            </h2>
            <p className="text-purple-200 text-lg leading-relaxed mb-8 font-medium">
              Chào mừng bạn quay trở lại! Đăng nhập để tiếp tục mua sắm và quản
              lý các đơn hàng của bạn.
            </p>
          </div>
        </div>

        {/* CỘT TRÁI: Form Đăng nhập */}
        <div className="md:w-1/2 p-10 lg:p-14">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h3>
          <p className="text-gray-500 text-sm mb-8">
            Vui lòng nhập thông tin tài khoản của bạn
          </p>

          <form onSubmit={submitHandler} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder="Địa chỉ Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600 font-medium">
                  Ghi nhớ tôi
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 flex justify-center items-center gap-2 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "ĐĂNG NHẬP"
              )}
            </button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full absolute"></div>
            <span className="bg-white px-4 text-xs text-gray-400 relative z-10 font-bold tracking-wider">
              HOẶC
            </span>
          </div>

          {/* ✅ NÚT ĐĂNG NHẬP GOOGLE ĐÃ GẮN SỰ KIỆN ONCLICK */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:bg-gray-50 hover:border-purple-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <FaGoogle className="text-red-500 text-lg" /> Đăng nhập bằng Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-600 font-medium">
            Chưa có tài khoản?{" "}
            <Link
              to={
                redirect !== "/"
                  ? `/register?redirect=${redirect.substring(1)}`
                  : "/register"
              }
              className="text-purple-600 hover:text-purple-800 font-bold transition-colors underline decoration-2 underline-offset-4"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
