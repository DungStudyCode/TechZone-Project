// client/src/components/AdminLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaShoppingBag, FaUser, FaRobot, FaSignOutAlt } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/products', name: 'Quản lý Sản phẩm', icon: <FaBox /> },
    { path: '/admin/orders', name: 'Quản lý Đơn hàng', icon: <FaShoppingBag /> },
    { path: '/admin/users', name: 'Khách hàng', icon: <FaUser /> },
    { path: '/admin/ai-insights', name: 'AI Phân tích', icon: <FaRobot /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#2c3e50] text-white flex flex-col fixed h-full shadow-lg z-10">
        {/* Header */}
        <div className="p-5 bg-[#1a252f] text-center font-bold text-xl tracking-wider border-b border-gray-700">
          TechZone Admin
        </div>

        {/* Menu List */}
        <ul className="flex-1 overflow-y-auto py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
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

        {/* Footer */}
        <div className="p-5 border-t border-gray-700">
          <button className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200 font-medium shadow-md">
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      {/* ml-64 để đẩy nội dung sang phải tránh bị sidebar che */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-gray-700 font-medium">Xin chào, Admin</span>
          </div>
        </header>

        {/* Nội dung thay đổi (Outlet) */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;