// client/src/pages/Admin/AdminProductForm.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const AdminProductForm = () => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  
  // --- STATE MỚI CHO THÔNG SỐ KỸ THUẬT ---
  const [specs, setSpecs] = useState({
    screen: '',
    chip: '',
    ram: '',
    battery: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get('/products');
          const product = data.find(p => p._id === id);
          if (product) {
            setName(product.name);
            setSlug(product.slug);
            setPrice(product.price);
            setImage(product.image);
            setCategory(product.category);
            setBrand(product.brand || '');
            setCountInStock(product.countInStock);
            setDescription(product.description);
            // Load thông số cũ (nếu có)
            if (product.specs) setSpecs(product.specs);
          }
        } catch (error) {
          console.error("Lỗi:", error);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEditMode) {
      const generatedSlug = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-');
      setSlug(generatedSlug);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gửi cả specs lên server
      const productData = { name, slug, price, image, category, brand, countInStock, description, specs };

      if (isEditMode) {
        await api.put(`/products/${id}`, productData);
        alert('Cập nhật thành công!');
      } else {
        await api.post('/products', productData);
        alert('Thêm mới thành công!');
      }
      navigate('/admin/products');
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/admin/products" className="text-gray-500 hover:text-purple-700 flex items-center gap-2 mb-6"><FaArrowLeft /> Quay lại</Link>
      
      <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-purple-50 px-8 py-6 border-b border-purple-100">
            <h1 className="text-2xl font-bold text-purple-900">{isEditMode ? `Sửa: ${name}` : 'Thêm sản phẩm'}</h1>
        </div>

        <form onSubmit={submitHandler} className="p-8 space-y-6">
          {/* Tên & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="font-bold block mb-2">Tên sản phẩm</label><input type="text" required className="w-full border rounded p-3" value={name} onChange={handleNameChange} /></div>
            <div><label className="font-bold block mb-2">Slug</label><input type="text" required className="w-full border rounded p-3 bg-gray-50" value={slug} onChange={e => setSlug(e.target.value)} /></div>
          </div>

          {/* Giá & Kho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="font-bold block mb-2">Giá (VNĐ)</label><input type="number" required className="w-full border rounded p-3" value={price} onChange={e => setPrice(e.target.value)} /></div>
            <div><label className="font-bold block mb-2">Số lượng kho</label><input type="number" required className="w-full border rounded p-3" value={countInStock} onChange={e => setCountInStock(e.target.value)} /></div>
          </div>

          {/* Danh mục & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className="font-bold block mb-2">Danh mục</label><input type="text" required className="w-full border rounded p-3" value={category} onChange={e => setCategory(e.target.value)} /></div>
             <div><label className="font-bold block mb-2">Thương hiệu</label><input type="text" required className="w-full border rounded p-3" value={brand} onChange={e => setBrand(e.target.value)} /></div>
          </div>

          {/* Ảnh */}
          <div><label className="font-bold block mb-2">Link Ảnh</label><input type="text" required className="w-full border rounded p-3" value={image} onChange={e => setImage(e.target.value)} /></div>

          {/* --- PHẦN MỚI: THÔNG SỐ KỸ THUẬT --- */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-4 text-gray-700">Thông số kỹ thuật</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-semibold block mb-1">Màn hình</label>
                    <input type="text" className="w-full border rounded p-2" placeholder="Ví dụ: 6.7 inch OLED" 
                           value={specs.screen} onChange={(e) => setSpecs({...specs, screen: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm font-semibold block mb-1">Chip xử lý</label>
                    <input type="text" className="w-full border rounded p-2" placeholder="Ví dụ: Apple A17 Pro" 
                           value={specs.chip} onChange={(e) => setSpecs({...specs, chip: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm font-semibold block mb-1">RAM</label>
                    <input type="text" className="w-full border rounded p-2" placeholder="Ví dụ: 8GB" 
                           value={specs.ram} onChange={(e) => setSpecs({...specs, ram: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm font-semibold block mb-1">Pin / Sạc</label>
                    <input type="text" className="w-full border rounded p-2" placeholder="Ví dụ: 4422 mAh, 20W" 
                           value={specs.battery} onChange={(e) => setSpecs({...specs, battery: e.target.value})} />
                </div>
            </div>
          </div>

          {/* Mô tả */}
          <div><label className="font-bold block mb-2">Mô tả</label><textarea rows="4" className="w-full border rounded p-3" value={description} onChange={e => setDescription(e.target.value)}></textarea></div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition">
            {loading ? 'Đang xử lý...' : <><FaSave className="inline mr-2"/> LƯU SẢN PHẨM</>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminProductForm;