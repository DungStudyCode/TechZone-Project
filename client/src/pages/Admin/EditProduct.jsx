// client/src/pages/Admin/EditProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { FaPlus, FaTrash } from 'react-icons/fa'; // ✅ IMPORT ICON

const EditProduct = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', slug: '', price: 0, image: '', category: '', countInStock: 0, description: ''
  });
  
  // ✅ 1. STATE LƯU THÔNG SỐ KỸ THUẬT
  const [specs, setSpecs] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Tải dữ liệu cũ khi vào trang
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get('/products');
        // Xử lý trường hợp data trả về là { products: [...] } hoặc mảng trực tiếp
        const productList = data.products || data; 
        const product = productList.find(p => p._id === id);
        
        if (product) {
          // Khôi phục dữ liệu vào form
          setFormData({
            name: product.name || '',
            slug: product.slug || '',
            price: product.price || 0,
            image: product.image || '',
            category: product.category || '',
            countInStock: product.countInStock || 0,
            description: product.description || ''
          });
          // ✅ 2. LOAD THÔNG SỐ KỸ THUẬT CŨ VÀO STATE
          setSpecs(product.specs || []);
        }
        setLoading(false);
      } catch (error) { 
        console.error("Lỗi tải dữ liệu:", error); 
        alert("Lỗi tải dữ liệu!");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ 3. CÁC HÀM XỬ LÝ THÔNG SỐ KỸ THUẬT
  const handleSpecChange = (index, field, val) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const addSpecField = () => {
    setSpecs([...specs, { name: '', value: '' }]); 
  };

  const removeSpecField = (index) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ 4. GỘP THÔNG SỐ (SPECS) VÀO DỮ LIỆU GỬI LÊN BACKEND
      const productData = {
        ...formData,
        specs
      };

      await api.put(`/products/${id}`, productData);
      alert('Cập nhật thành công!');
      navigate('/admin/products');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="text-center mt-10 font-bold text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Cập nhật sản phẩm</h1>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Tên sản phẩm</label>
              <input type="text" name="name" value={formData.name} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Slug</label>
              <input type="text" name="slug" value={formData.slug} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Giá</label>
              <input type="number" name="price" value={formData.price} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Kho</label>
              <input type="number" name="countInStock" value={formData.countInStock} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Danh mục</label>
            <input type="text" name="category" value={formData.category} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Ảnh (URL)</label>
            <input type="text" name="image" value={formData.image} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Mô tả</label>
            <textarea name="description" value={formData.description} required rows="4" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" onChange={handleChange}></textarea>
          </div>

          {/* ✅ 5. GIAO DIỆN QUẢN LÝ THÔNG SỐ KỸ THUẬT */}
          <div className="border-t pt-4 mt-6">
            <label className="block text-sm font-bold mb-2">Thông số kỹ thuật</label>
            
            {specs.map((spec, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Tên thông số (VD: RAM, Màn hình...)"
                  value={spec.name}
                  onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                  className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <input
                  type="text"
                  placeholder="Giá trị (VD: 8GB, 6.7 inch...)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSpecField(index)}
                  className="text-red-500 hover:bg-red-50 p-3 rounded transition"
                  title="Xóa thông số này"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addSpecField}
              className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-2 rounded transition"
            >
              <FaPlus /> Thêm thông số
            </button>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 mt-6 shadow-md transition">
            LƯU THAY ĐỔI
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;