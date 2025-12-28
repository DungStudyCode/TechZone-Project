import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const EditProduct = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', slug: '', price: 0, image: '', category: '', countInStock: 0, description: ''
  });
  const [loading, setLoading] = useState(true);

  // Tải dữ liệu cũ khi vào trang
useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get('/products');
        const product = data.find(p => p._id === id);
        
        if (product) {
          // ... (code setFormData cũ giữ nguyên)
        }
        setLoading(false);
      } catch (error) { // <-- Biến error này đang bị báo thừa
        console.error(error); // THÊM DÒNG NÀY: In lỗi ra console để dùng biến error
        alert("Lỗi tải dữ liệu!");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${id}`, formData);
      alert('Cập nhật thành công!');
      navigate('/admin/products');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Cập nhật sản phẩm</h1>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Tên sản phẩm</label>
              <input type="text" name="name" value={formData.name} required className="w-full border p-2 rounded" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Slug</label>
              <input type="text" name="slug" value={formData.slug} required className="w-full border p-2 rounded" onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Giá</label>
              <input type="number" name="price" value={formData.price} required className="w-full border p-2 rounded" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Kho</label>
              <input type="number" name="countInStock" value={formData.countInStock} required className="w-full border p-2 rounded" onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Danh mục</label>
            <input type="text" name="category" value={formData.category} required className="w-full border p-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Ảnh (URL)</label>
            <input type="text" name="image" value={formData.image} required className="w-full border p-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Mô tả</label>
            <textarea name="description" value={formData.description} required rows="4" className="w-full border p-2 rounded" onChange={handleChange}></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
            LƯU THAY ĐỔI
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;