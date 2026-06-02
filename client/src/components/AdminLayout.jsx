// client/src/components/AdminLayout.jsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaShoppingBag, FaUser, FaRobot, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'; // ✅ Bổ sung FaBars, FaTimes

const AdminLayout = () => {
  const location = useLocation();
  // ✅ 1. Thêm State để điều khiển đóng/mở menu trên điện thoại
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/products', name: 'Quản lý Sản phẩm', icon: <FaBox /> },
    { path: '/admin/orders', name: 'Quản lý Đơn hàng', icon: <FaShoppingBag /> },
    { path: '/admin/users', name: 'Khách hàng', icon: <FaUser /> },
    { path: '/admin/ai-insights', name: 'AI Phân tích', icon: <FaRobot /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* ✅ Overlay làm tối màn hình khi mở menu trên Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      {/* ✅ 2. Cập nhật class Tailwind để ẩn/hiện mượt mà trên Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#2c3e50] text-white flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen`}
      >
        {/* Header của Sidebar */}
        <div className="p-5 bg-[#1a252f] text-center font-bold text-xl tracking-wider border-b border-gray-700 flex justify-between items-center md:block">
          <span>TechZone Admin</span>
          {/* Nút X để đóng menu trên Mobile */}
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Menu List */}
        <ul className="flex-1 overflow-y-auto py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)} // ✅ Tự động đóng menu khi bấm vào link (Mobile)
                  className={`flex items-center gap-3 px-6 py-4 transition-colors duration-200
                    ${isActive 
                      ? 'bg-[#34495e] border-l-4 border-blue-400 text-white' 
                      : 'text-gray-400 hover:bg-[#34495e] hover:text-white'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer Sidebar */}
        <div className="p-5 border-t border-gray-700">
          <button className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200 font-medium shadow-md">
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      {/* ✅ 3. Xóa ml-64 cứng, thay bằng flex-1 w-full để luôn vừa màn hình */}
      <main className="flex-1 flex flex-col w-full min-w-0 overflow-hidden">
        
        {/* Top Header */}
        {/* ✅ Cập nhật justify-between để nút Hamburger nằm bên trái, Profile nằm bên phải */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between md:justify-end px-4 md:px-8 sticky top-0 z-10 shrink-0">
          
          {/* Nút Hamburger (Chỉ hiện trên Mobile) */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-gray-700 font-medium hidden sm:block">Xin chào, Admin</span>
          </div>
        </header>

        {/* Nội dung thay đổi (Outlet) */}
        {/* ✅ Thêm overflow-y-auto để nội dung có thể cuộn độc lập */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;