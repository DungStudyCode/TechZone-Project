// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaFire, FaCrown } from 'react-icons/fa'; // Thêm icon cho sinh động

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    const amount = parseFloat(price);
    if (isNaN(amount)) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full relative">
      
      {/* --- 0. BADGE HÀNG HOT & BÁN CHẠY (MỚI) --- */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
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
      <Link to={`/product/${product.slug}`} className="block overflow-hidden relative h-64 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-4/5 h-4/5 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Badge Hết hàng (Giữ bên phải) */}
        {product.countInStock === 0 && (
          <span className="absolute top-3 right-3 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded">
            HẾT HÀNG
          </span>
        )}
      </Link>

      {/* 2. Nội dung thông tin */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            {product.category || 'THIẾT BỊ'}
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
              <span key={i}>{i < Math.round(product.rating) ? "★" : "☆"}</span>
            ))}
          </div>
          <span className="text-gray-400 text-[10px] ml-1">({product.numReviews})</span>
        </div>

        {/* Giá tiền */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
             <span className="text-red-600 font-extrabold text-xl">
               {formatPrice(product.price)}
             </span>
             <span className="text-gray-400 text-xs line-through font-medium">
               {formatPrice(product.price * 1.15)}
             </span>
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