// client/src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  // --- HÀM KHẮC PHỤC LỖI NaN (QUAN TRỌNG) ---
  const formatPrice = (price) => {
    // 1. Ép kiểu về số
    const amount = parseFloat(price);
    // 2. Nếu không phải số hợp lệ thì trả về text mặc định
    if (isNaN(amount)) return 'Liên hệ';
    // 3. Format chuẩn tiếng Việt
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full">
      
      {/* 1. Hình ảnh sản phẩm */}
      <Link to={`/product/${product.slug}`} className="block overflow-hidden relative h-64 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-4/5 h-4/5 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
        />
        {/* Badge Hết hàng */}
        {product.countInStock === 0 && (
            <span className="absolute top-2 right-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded">
                HẾT HÀNG
            </span>
        )}
      </Link>

      {/* 2. Nội dung thông tin */}
      <div className="p-5 flex flex-col flex-1">
        {/* Danh mục */}
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
          {product.category || 'THIẾT BỊ'}
        </p>

        {/* Tên sản phẩm */}
        <Link to={`/product/${product.slug}`} className="block mb-2">
          <h3 className="text-gray-800 font-bold text-lg leading-tight line-clamp-2 group-hover:text-purple-700 transition-colors h-12" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Giá tiền (Đã sửa lỗi NaN) */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
             <span className="text-red-600 font-extrabold text-xl">
               {formatPrice(product.price)}
             </span>
             {/* Giá cũ giả lập (gạch ngang) */}
             <span className="text-gray-400 text-xs line-through font-medium">
               {formatPrice(product.price * 1.1)}
             </span>
          </div>

          {/* Nút hành động */}
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