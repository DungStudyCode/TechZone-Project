// client/src/pages/Product/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { FaShoppingCart, FaCheck, FaTimes, FaMobileAlt, FaMicrochip, FaMemory, FaBatteryFull } from 'react-icons/fa';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (product.countInStock > 0) {
      addToCart(product, qty);
      alert("Đã thêm vào giỏ hàng!");
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Cột Trái: Ảnh */}
          <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="max-h-[400px] object-contain mix-blend-multiply" />
          </div>

          {/* Cột Phải: Thông tin */}
          <div className="md:w-1/2 p-8">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {product.brand}
            </span>
            
            <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{product.name}</h1>
            
            <div className="text-3xl font-extrabold text-red-600 mb-6">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </div>

            {/* --- CHECK TRẠNG THÁI KHO (SỬA LỖI Ở ĐÂY) --- */}
            <div className="mb-6">
              {product.countInStock > 0 ? (
                <span className="flex items-center text-green-600 font-bold bg-green-50 w-fit px-3 py-1 rounded">
                  <FaCheck className="mr-2" /> Còn hàng (Sẵn sàng giao)
                </span>
              ) : (
                <span className="flex items-center text-red-600 font-bold bg-red-50 w-fit px-3 py-1 rounded">
                  <FaTimes className="mr-2" /> Tạm hết hàng
                </span>
              )}
            </div>

            {/* --- HIỂN THỊ THÔNG SỐ KỸ THUẬT (PHẦN MỚI) --- */}
            {product.specs && (
               <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase">Thông số kỹ thuật</h3>
                  <div className="grid grid-cols-1 gap-3">
                     <div className="flex items-center">
                        <FaMobileAlt className="text-gray-400 w-6" />
                        <span className="text-sm text-gray-500 w-24 ml-2">Màn hình:</span>
                        <span className="font-medium text-gray-800">{product.specs.screen || 'Đang cập nhật'}</span>
                     </div>
                     <div className="flex items-center">
                        <FaMicrochip className="text-gray-400 w-6" />
                        <span className="text-sm text-gray-500 w-24 ml-2">Chipset:</span>
                        <span className="font-medium text-gray-800">{product.specs.chip || 'Đang cập nhật'}</span>
                     </div>
                     <div className="flex items-center">
                        <FaMemory className="text-gray-400 w-6" />
                        <span className="text-sm text-gray-500 w-24 ml-2">RAM:</span>
                        <span className="font-medium text-gray-800">{product.specs.ram || 'Đang cập nhật'}</span>
                     </div>
                     <div className="flex items-center">
                        <FaBatteryFull className="text-gray-400 w-6" />
                        <span className="text-sm text-gray-500 w-24 ml-2">Pin:</span>
                        <span className="font-medium text-gray-800">{product.specs.battery || 'Đang cập nhật'}</span>
                     </div>
                  </div>
               </div>
            )}

            {/* Nút Mua hàng */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100" disabled={product.countInStock === 0}>-</button>
                <span className="px-4 font-bold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.countInStock, q + 1))} className="px-3 py-2 hover:bg-gray-100" disabled={product.countInStock === 0}>+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                  ${product.countInStock > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <FaShoppingCart />
                {product.countInStock > 0 ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mô tả chi tiết */}
        <div className="p-8 border-t border-gray-100">
           <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
           <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;