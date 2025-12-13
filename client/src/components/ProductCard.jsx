// client/src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Hàm format tiền Việt Nam (Ví dụ: 20000000 -> 20.000.000 ₫)
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductCard = ({ product }) => {
  // Lấy giá của biến thể đầu tiên để hiển thị
  const firstVariant = product.variants[0];

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
      <Link to={`/product/${product.slug}`}>
        {/* Ảnh sản phẩm */}
        <div className="h-64 w-full flex items-center justify-center p-4 bg-gray-50">
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full object-contain mix-blend-multiply"
          />
        </div>

        {/* Thông tin */}
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          <h3 className="font-bold text-lg text-gray-800 line-clamp-1 truncate">{product.name}</h3>
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-red-600 font-bold text-xl">
              {formatPrice(firstVariant?.price || 0)}
            </span>
            {/* Hiển thị số lượng màu có sẵn */}
            {product.variants.length > 1 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                +{product.variants.length} màu
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;