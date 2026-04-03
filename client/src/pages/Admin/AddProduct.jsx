// client/src/pages/Admin/AdminProducts.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

// --- CẬP NHẬT HÀM FORMAT GIÁ ĐỂ TRÁNH LỖI NaN ---
const formatPrice = (price) => {
  const amount = parseFloat(price); // Ép kiểu về số
  if (isNaN(amount)) return '0 đ';  // Nếu lỗi thì hiện 0đ
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  // 1. Tải danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);

  // 2. Hàm xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/products/${id}`);
        alert('Xóa thành công!');
        // Cập nhật lại danh sách ngay lập tức
        setProducts(prev => prev.filter(product => product._id !== id));
      } catch (error) {
        alert('Lỗi xóa: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold border-l-4 border-purple-700 pl-4 text-gray-800">Quản lý Sản phẩm</h1>
        <Link 
          to="/admin/product/new" 
          className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700 shadow transition-colors"
        >
          <FaPlus /> Thêm mới
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-purple-50 text-left text-xs font-bold text-purple-800 uppercase tracking-wider border-b border-purple-100">
              <th className="px-5 py-4">Hình ảnh</th>
              <th className="px-5 py-4">Tên sản phẩm</th>
              <th className="px-5 py-4">Giá</th>
              <th className="px-5 py-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <img src={product.image} alt="" className="w-12 h-12 object-contain border rounded bg-white" />
                </td>
                <td className="px-5 py-4 text-sm font-bold text-gray-800">
                  {product.name}
                  {/* Hiển thị Brand nhỏ bên dưới tên */}
                  <p className="text-xs text-gray-500 font-normal mt-1">{product.brand || 'Chưa có Brand'}</p>
                </td>
                
                {/* GIÁ TIỀN (Sẽ hiển thị đúng nhờ hàm formatPrice mới) */}
                <td className="px-5 py-4 text-sm text-red-600 font-bold">
                  {formatPrice(product.price)}
                </td>

                <td className="px-5 py-4 text-center">
                  <div className="flex justify-center gap-4">
                    <Link to={`/admin/product/${product._id}/edit`} className="text-blue-500 hover:text-blue-700 transition">
                      <FaEdit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
            <div className="p-8 text-center text-gray-500">Chưa có sản phẩm nào.</div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;