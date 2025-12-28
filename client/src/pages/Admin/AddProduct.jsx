import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    image: '', // Tạm thời nhập link ảnh online cho đơn giản
    category: '',
    countInStock: 0,
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      alert('Thêm sản phẩm thành công!');
      navigate('/admin/products'); // Quay về danh sách
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Thêm sản phẩm mới</h1>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Tên sản phẩm</label>
              <input type="text" name="name" required className="w-full border p-2 rounded" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Slug (URL)</label>
              <input type="text" name="slug" required placeholder="iphone-15-pro-max" className="w-full border p-2 rounded" onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Giá (VNĐ)</label>
              <input type="number" name="price" required className="w-full border p-2 rounded" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Số lượng kho</label>
              <input type="number" name="countInStock" required className="w-full border p-2 rounded" onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Danh mục (Category)</label>
            <input type="text" name="category" required placeholder="Phone, Laptop..." className="w-full border p-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Link Ảnh (URL)</label>
            <input type="text" name="image" required placeholder="https://..." className="w-full border p-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Mô tả chi tiết</label>
            <textarea name="description" required rows="4" className="w-full border p-2 rounded" onChange={handleChange}></textarea>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">
            LƯU SẢN PHẨM
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;