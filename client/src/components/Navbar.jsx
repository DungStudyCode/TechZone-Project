// client/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa'; // Cần cài react-icons
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { cartItems } = useCart();

  // Tính tổng số lượng sản phẩm
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          TechZone
        </Link>

        {/* Menu & Cart */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">
            Trang chủ
          </Link>
          
          <Link to="/cart" className="relative text-2xl text-gray-600 hover:text-blue-600">
            <FaShoppingCart />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;