// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
// Import Icons
import { FaSearch, FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { FiShoppingCart } from "react-icons/fi";

const Navbar = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Khi tìm kiếm, chuyển hướng sang trang Products để hiển thị kết quả
      navigate(`/products?keyword=${keyword}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    // --- SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY ---
    { name: 'Sản phẩm', path: '/products' }, // Trỏ về trang /products
    { name: 'Giới thiệu', path: '/about' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 font-sans border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        {/* --- 1. LOGO --- */}
        <Link to="/" className="flex items-center gap-2 group no-underline">
          <div className="w-10 h-10 bg-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md transition-transform group-hover:scale-105">
            TZ
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-purple-700 transition-colors">
            TechZone
          </span>
        </Link>

        {/* --- 2. THANH TÌM KIẾM --- */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <form onSubmit={submitHandler} className="w-full relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-gray-100 text-gray-700 border-none rounded-full py-2.5 pl-6 pr-12 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800 p-1"
            >
              <FaSearch className="text-lg" />
            </button>
          </form>
        </div>

        {/* --- 3. MENU & ICONS --- */}
        <div className="flex items-center gap-6">
          
          {/* Menu Links Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <NavLink 
                key={index} 
                to={link.path}
                className={({ isActive }) => 
                  `text-base font-medium transition-colors no-underline ${
                    isActive ? 'text-purple-700 font-bold' : 'text-gray-600 hover:text-purple-700'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Icons Group */}
          <div className="flex items-center gap-5">
            
            {/* Giỏ hàng */}
            <Link to="/cart" className="relative text-gray-500 hover:text-purple-700 transition-colors">
              <FiShoppingCart className="text-2xl" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Account */}
            {user ? (
              <div className="relative group cursor-pointer">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-purple-900 text-white flex items-center justify-center font-bold text-sm border-2 border-transparent group-hover:border-purple-500 transition-all">
                  {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-100 w-52 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b">
                      <p className="text-xs text-gray-500">Xin chào,</p>
                      <p className="font-bold text-purple-900 truncate">{user.name}</p>
                    </div>
                    {user.isAdmin && (
                      <Link to="/admin/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">Quản lý Admin</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">Hồ sơ cá nhân</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Đăng xuất</button>
                  </div>
                </div>
              </div>
            ) : (
              // Nút Login
              <Link to="/login" className="text-purple-900 hover:text-purple-700 p-2 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors">
                <FaUser className="text-lg" />
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
      <div className={`lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 space-y-4">
          <form onSubmit={submitHandler} className="relative">
             <input type="text" placeholder="Tìm kiếm..." className="w-full bg-gray-100 rounded-full py-2 px-4 outline-none" onChange={(e) => setKeyword(e.target.value)} />
             <button className="absolute right-3 top-2 text-purple-700"><FaSearch /></button>
          </form>
          <div className="flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <Link key={index} to={link.path} className="py-2 text-gray-700 hover:text-purple-700 font-medium no-underline" onClick={() => setIsMobileMenuOpen(false)}>{link.name}</Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;