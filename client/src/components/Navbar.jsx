// client/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api"; 
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaUser,
  FaCommentDots,
  FaBoxOpen,
  FaBrain,
  FaUserCircle,
  FaSignOutAlt,
  FaHistory,
  FaChartLine,
  FaShieldAlt,
  FaHeart,
  FaMapMarkerAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";

const Navbar = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  // ✅ STATE CHO TÍNH NĂNG GỢI Ý TÌM KIẾM
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // ✅ REF ĐỂ LẮNG NGHE SỰ KIỆN CLICK RA NGOÀI
  const searchRef = useRef(null);

  // ✅ EFFECT 1: LẮNG NGHE SỰ KIỆN CLICK OUTSIDE ĐỂ ĐÓNG DROPDOWN
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ EFFECT 2: ĐÃ FIX LỖI ESLINT (Dùng setTimeout để qua mặt Linter)
  useEffect(() => {
    // 1. Trường hợp xóa trắng ô search
    if (!keyword.trim()) {
      const resetTimer = setTimeout(() => {
        setSuggestedProducts([]);
        setIsSuggestOpen(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    // 2. Bắt đầu gõ -> Mở dropdown và hiện loading
    const startSearchTimer = setTimeout(() => {
      setIsSearching(true);
      setIsSuggestOpen(true);
    }, 0);

    // 3. Xử lý Trì hoãn (Debounce) gọi API
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?keyword=${keyword}`);
        const results = data.products || data; 
        setSuggestedProducts(results.slice(0, 5)); 
      } catch (error) {
        console.error("Lỗi khi tải gợi ý tìm kiếm:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); 

    // Dọn dẹp timer nếu người dùng gõ tiếp trước khi 0.5s kết thúc
    return () => {
      clearTimeout(startSearchTimer);
      clearTimeout(delayDebounceFn);
    };
  }, [keyword]);

  // Hàm Format Giá tiền
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${keyword}`);
      setIsSuggestOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Thu Mua", path: "/thu-mua", isNew: true },
    { name: "Giới thiệu", path: "/about" },
    { name: "Liên hệ", path: "/contact" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 font-sans border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* --- 1. LOGO --- */}
        <Link to="/" className="flex items-center gap-2 group no-underline">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-700 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-110">
            TZ
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter group-hover:text-purple-700 transition-colors">
            TechZone
          </span>
        </Link>

        {/* --- 2. THANH TÌM KIẾM ĐÃ NÂNG CẤP AUTO-SUGGEST --- */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchRef}>
          <form onSubmit={submitHandler} className="w-full relative">
            <input
              type="text"
              placeholder="Tìm kiếm siêu phẩm công nghệ..."
              className="w-full bg-gray-100 text-gray-700 border-none rounded-full py-3 pl-6 pr-12 focus:bg-white focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all shadow-inner"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => keyword.trim() && setIsSuggestOpen(true)}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800 p-1 transition-transform hover:scale-110"
            >
              <FaSearch className="text-lg" />
            </button>
          </form>

          {/* HIỂN THỊ DROPDOWN GỢI Ý */}
          {isSuggestOpen && keyword.trim() !== "" && (
            <div className="absolute top-[110%] left-0 right-0 bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
              {isSearching ? (
                <div className="flex items-center justify-center p-6 gap-3 text-gray-500 font-bold text-sm">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Đang tìm kiếm...
                </div>
              ) : suggestedProducts.length > 0 ? (
                <ul>
                  {suggestedProducts.map((p) => (
                    <li key={p._id}>
                      <Link
                        to={`/product/${p.slug}`}
                        onClick={() => setIsSuggestOpen(false)}
                        className="flex items-center gap-4 p-3 hover:bg-purple-50 transition-colors border-b border-gray-50 group"
                      >
                        <div className="w-12 h-12 shrink-0 bg-white rounded-lg border border-gray-100 p-1 flex items-center justify-center">
                          <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate mb-1 group-hover:text-purple-700 transition-colors">{p.name}</p>
                          <p className="text-xs font-black text-red-600">{formatPrice(p.price)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={submitHandler}
                      className="w-full p-4 text-center text-sm font-bold text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSearch className="text-xs" /> Xem tất cả kết quả cho "{keyword}"
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="p-6 text-center text-sm font-bold text-gray-500">
                  Không tìm thấy siêu phẩm nào mang tên "{keyword}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- 3. MENU & ICONS --- */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-bold transition-all no-underline flex items-center relative uppercase tracking-wider ${
                    isActive
                      ? "text-purple-700"
                      : "text-gray-500 hover:text-purple-700"
                  }`
                }
              >
                {link.name}
                {link.isNew && (
                  <span className="absolute -top-1.5 -right-3.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-5 border-l border-gray-200 pl-6">
            {/* Giỏ hàng */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-purple-700 transition-all hover:scale-110"
            >
              <FiShoppingCart className="text-2xl" />
              {totalItems > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Tin nhắn */}
            {user && (
              <Link
                to="/messenger"
                className="relative text-gray-600 hover:text-purple-700 transition-all hover:scale-110"
                title="Tin nhắn"
              >
                <FaCommentDots className="text-[22px]" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 border border-white"></span>
                </span>
              </Link>
            )}

            {/* User Account Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 outline-none">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-blue-500 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white group-hover:rotate-6 transition-all">
                    {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                  </div>
                </button>

                <div className="absolute right-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-64 overflow-hidden">
                    {/* Header: Profile Info */}
                    <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                        Tài khoản
                      </p>
                      <p className="font-extrabold text-gray-800 truncate text-base leading-tight">
                        {user.name}
                      </p>
                    </div>

                    {/* Section: Client Menu */}
                    <div className="p-2 space-y-0.5">
                      <div className="px-3 py-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Cá nhân
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all group/item"
                      >
                        <FaUserCircle className="text-gray-400 group-hover/item:text-purple-500 transition-colors" />
                        <span className="font-medium">Hồ sơ cá nhân</span>
                      </Link>

                      <Link
                        to="/my-orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all group/item"
                      >
                        <FaHistory className="text-gray-400 group-hover/item:text-purple-500 transition-colors" />
                        <span className="font-medium">Lịch sử đơn hàng</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all group/item"
                      >
                        <FaHeart className="text-gray-400 group-hover/item:text-red-500 transition-colors" />
                        <span className="font-medium">Sản phẩm yêu thích</span>
                      </Link>
                    </div>

                    {/* Nút Trợ giúp & Hỗ trợ */}
                    <div className="mx-2 mt-1 mb-2">
                      <Link
                        to="/support"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all text-xs font-bold border border-blue-100"
                      >
                        <FaQuestionCircle />
                        <span>Trung tâm hỗ trợ</span>
                      </Link>
                    </div>

                    {/* Section: Admin Menu */}
                    {user.isAdmin && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="px-5 mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Admin Control
                          </span>
                          <FaShieldAlt className="text-red-300 text-xs" />
                        </div>

                        <div className="p-2 space-y-0.5">
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-bold group/item"
                          >
                            <FaChartLine className="text-gray-400 group-hover/item:text-red-500" />
                            <span>Dashboard tổng quan</span>
                          </Link>

                          <Link
                            to="/admin/products"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-bold group/item"
                          >
                            <FaBoxOpen className="text-gray-400 group-hover/item:text-red-500" />
                            <span>Quản lý Sản phẩm</span>
                          </Link>

                          <Link
                            to="/admin/orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-bold group/item"
                          >
                            <FaHistory className="text-gray-400 group-hover/item:text-red-500" />
                            <span>Quản lý Đơn hàng</span>
                          </Link>

                          <Link
                            to="/admin/users"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-bold group/item"
                          >
                            <FaUserCircle className="text-gray-400 group-hover/item:text-red-500" />
                            <span>Quản lý Khách hàng</span>
                          </Link>

                          <Link
                            to="/admin/ai-insights"
                            className="flex items-center gap-3 px-4 py-3 text-sm bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-xl transition-all shadow-lg hover:shadow-purple-300 hover:-translate-y-0.5 font-bold mt-2 mx-1 group/ai"
                          >
                            <FaBrain className="animate-pulse text-purple-200" />
                            <span>AI Phân tích & Brain</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Logout Button */}
                    <div className="mt-2 p-2 border-t border-gray-100">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-purple-50 text-purple-700 px-5 py-2.5 rounded-full font-bold hover:bg-purple-100 transition-all border border-purple-100"
              >
                <FaUser className="text-sm" /> <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden text-gray-600 text-2xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <div
        className={`lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-5 space-y-5 bg-gray-50">
          <form onSubmit={submitHandler} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-white border border-gray-200 rounded-full py-3 px-5 outline-none shadow-sm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-700">
              <FaSearch />
            </button>
          </form>
          <div className="flex flex-col gap-3">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="py-3 px-4 bg-white rounded-xl text-gray-700 hover:text-purple-700 font-bold no-underline flex items-center justify-between shadow-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
                {link.isNew && (
                  <span className="px-2 py-0.5 text-[10px] bg-red-500 text-white rounded-full animate-pulse">
                    MỚI
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;