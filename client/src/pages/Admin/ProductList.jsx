// client/src/pages/Admin/ProductList.jsx
import React, { useEffect, useState } from 'react';
// ✅ 1. Import 'api' xịn sò thay cho 'axios'
import api from '../../services/api'; 
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ✅ 2. Gọi API cực ngắn, không còn localhost
        const { data } = await api.get('/products'); 
        
        setProducts(data.products || data); 
        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Xử lý xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        // ✅ 3. Mở khóa chức năng XÓA THẬT thay vì Demo
        await api.delete(`/products/${id}`);
        
        alert('Đã xóa sản phẩm thành công!');
        // Cập nhật lại danh sách trên màn hình ngay lập tức
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        console.error(error); 
        alert('Lỗi xóa sản phẩm. Vui lòng thử lại!');
      }
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải dữ liệu...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📦 Quản Lý Sản Phẩm</h2>
        <Link 
          to="/admin/product/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <FaPlus /> Thêm Sản Phẩm
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">Hình ảnh</th>
                <th className="p-4 border-b">Tên sản phẩm</th>
                <th className="p-4 border-b">Giá</th>
                <th className="p-4 border-b">Danh mục</th>
                <th className="p-4 border-b text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-500 text-sm truncate max-w-[100px]" title={product._id}>
                    {product._id}
                  </td>
                  <td className="p-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-12 h-12 object-cover rounded border border-gray-200"
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-800">{product.name}</td>
                  <td className="p-4 text-green-600 font-semibold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </td>
                  <td className="p-4 text-gray-600">{product.category}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link 
                        to={`/admin/product/${product._id}/edit`} 
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full"
                        title="Sửa"
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Chưa có sản phẩm nào. Hãy thêm mới ngay!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;