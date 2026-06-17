// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaFire, FaCrown } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    const amount = parseFloat(price);
    if (isNaN(amount)) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // ✅ ĐỒNG BỘ LOGIC GIÁ: Lấy discount thật từ database
  const discountPercent = product.discount || 0;
  const originalPrice = product.price || 0;
  const finalPrice = originalPrice - (originalPrice * discountPercent / 100);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full relative">
      
      {/* --- BADGE HÀNG HOT, BÁN CHẠY & GIẢM GIÁ --- */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
        {discountPercent > 0 && (
          <div className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm">
            -{discountPercent}%
          </div>
        )}
        {product.isPromoted && (
          <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            <FaFire /> HOT
          </div>
        )}
        {product.soldCount > 50 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <FaCrown /> BÁN CHẠY
          </div>
        )}
      </div>

      {/* 1. Hình ảnh sản phẩm */}
      <Link to={`/product/${product.slug}`} className="block overflow-hidden relative h-64 bg-[#f8f9fc] flex items-center justify-center group-hover:bg-gray-100 transition-colors">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-4/5 h-4/5 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Badge Hết hàng (Nằm đè lên trên cùng) */}
        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Tạm hết hàng
            </span>
          </div>
        )}
      </Link>

      {/* 2. Nội dung thông tin */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-bold tracking-widest text-purple-500 uppercase">
            {product.brand || product.category || 'THIẾT BỊ'}
          </p>
          {/* Hiển thị số lượng đã bán nhỏ ở góc */}
          {product.soldCount > 0 && (
            <span className="text-[10px] text-gray-500 font-medium">Đã bán: {product.soldCount}</span>
          )}
        </div>

        <Link to={`/product/${product.slug}`} className="block mb-2">
          <h3 className="text-gray-800 font-bold text-lg leading-tight line-clamp-2 group-hover:text-purple-700 transition-colors h-12" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Đánh giá sao */}
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.round(product.rating || 5) ? "★" : "☆"}</span>
            ))}
          </div>
          <span className="text-gray-400 text-[10px] ml-1">({product.numReviews || 0})</span>
        </div>

        {/* 3. Giá tiền đã được đồng bộ */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
             <span className="text-red-600 font-extrabold text-xl">
               {formatPrice(finalPrice)}
             </span>
             {discountPercent > 0 ? (
               <span className="text-gray-400 text-xs line-through font-medium mt-0.5">
                 {formatPrice(originalPrice)}
               </span>
             ) : (
               <span className="text-xs opacity-0 mt-0.5">0đ</span> 
             )}
          </div>

          <Link 
            to={`/product/${product.slug}`}
            className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
          >
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;