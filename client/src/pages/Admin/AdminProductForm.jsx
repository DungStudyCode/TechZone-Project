// client/src/pages/Admin/AdminProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaSave, FaArrowLeft, FaCloudUploadAlt, FaMicrochip, FaMemory, FaBatteryFull, FaMobileAlt } from 'react-icons/fa';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // --- STATE CƠ BẢN ---
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Điện thoại'); 
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  // --- STATE THÔNG SỐ KỸ THUẬT (MẢNG ĐỘNG) ---
  const [specs, setSpecs] = useState([
    { keyName: 'Màn hình', value: '', isFixed: true },
    { keyName: 'Chipset', value: '', isFixed: true },
    { keyName: 'RAM', value: '', isFixed: true },
    { keyName: 'Pin', value: '', isFixed: true }
  ]);

  const [loading, setLoading] = useState(false);

  // --- TẢI DỮ LIỆU (KHI Ở CHẾ ĐỘ SỬA) ---
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setName(data.name);
          setPrice(data.price);
          setDiscount(data.discount || 0);
          setImage(data.image);
          setBrand(data.brand);
          setCategory(data.category);
          setCountInStock(data.countInStock);
          setDescription(data.description);
          
          // Xử lý thông số kỹ thuật (Hỗ trợ cả format cũ và mới)
          if (data.specs) {
            if (Array.isArray(data.specs)) {
              if (data.specs.length > 0) {
                const fixedKeys = ['Màn hình', 'Chipset', 'RAM', 'Pin'];
                setSpecs(data.specs.map(s => ({
                  keyName: s.keyName,
                  value: s.value,
                  isFixed: fixedKeys.includes(s.keyName)
                })));
              }
            } else {
              // Nếu là dữ liệu cấu trúc cũ (Object), tự động chuyển sang Mảng
              setSpecs([
                { keyName: 'Màn hình', value: data.specs.screen || '', isFixed: true },
                { keyName: 'Chipset', value: data.specs.chip || '', isFixed: true },
                { keyName: 'RAM', value: data.specs.ram || '', isFixed: true },
                { keyName: 'Pin', value: data.specs.battery || '', isFixed: true }
              ]);
            }
          }
        } catch (error) {
          console.error("Lỗi tải SP:", error);
          alert('Lỗi tải dữ liệu sản phẩm');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  // --- CÁC HÀM XỬ LÝ THÔNG SỐ ---
  const handleAddSpec = () => {
    setSpecs([...specs, { keyName: '', value: '', isFixed: false }]);
  };

  const handleRemoveSpec = (indexToRemove) => {
    setSpecs(specs.filter((_, index) => index !== indexToRemove));
  };

  const handleSpecChange = (index, field, newValue) => {
    const updatedSpecs = [...specs];
    updatedSpecs[index][field] = newValue;
    setSpecs(updatedSpecs);
  };
  // ------------------------------

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Lọc các thông số không trống và gom lại
      const validSpecs = specs
        .filter(s => s.keyName.trim() !== '' || s.value.trim() !== '')
        .map(s => ({ keyName: s.keyName, value: s.value }));

      const finalSpecs = (category === 'Điện thoại' || category === 'Laptop') ? validSpecs : [];

      const productData = {
        name,
        price,
        discount,
        image,
        brand,
        category,
        countInStock,
        description,
        specs: finalSpecs
      };

      if (isEditMode) {
        await api.put(`/products/${id}`, productData, config);
        alert('Cập nhật thành công!');
      } else {
        await api.post('/products', productData, config);
        alert('Tạo mới thành công!');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const showSpecs = category === 'Điện thoại' || category === 'Laptop';

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/products" className="text-gray-500 hover:text-gray-700">
              <FaArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
          </div>
        </div>

        <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- CỘT TRÁI --- */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Thông tin cơ bản</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Tên sản phẩm</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Mô tả chi tiết</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-32" value={description} onChange={(e) => setDescription(e.target.value)} required ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Giá bán & Phân loại</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Giá bán (VNĐ)</label>
                  <input type="number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Giảm giá (%)</label>
                  <input type="number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="VD: 10" />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Số lượng kho</label>
                  <input type="number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Thương hiệu</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-600 font-medium mb-1">Danh mục sản phẩm</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Điện thoại">📱 Điện thoại</option>
                    <option value="Laptop">💻 Laptop</option>
                    <option value="Phụ kiện">🎧 Phụ kiện</option>
                    <option value="Tablet">iPad / Tablet</option>
                    <option value="Khác">📦 Khác</option>
                  </select>
                </div>
              </div>
            </div>

            {/* --- KHU VỰC THÔNG SỐ KỸ THUẬT --- */}
            {showSpecs && (
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                     <FaMicrochip className="text-purple-600"/> Thông số kỹ thuật
                  </h3>
                  {/* NÚT THÊM THỦ CÔNG */}
                  <button 
                    type="button" 
                    onClick={handleAddSpec}
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-lg text-sm font-bold transition"
                  >
                    + Thêm thông số
                  </button>
                </div>

                {/* 1. Các ô cố định (Có icon) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specs.map((spec, index) => {
                    if (!spec.isFixed) return null;

                    // Gán đúng icon theo tên trường
                    let IconComponent = FaMobileAlt; 
                    if (spec.keyName === 'Chipset') IconComponent = FaMicrochip;
                    if (spec.keyName === 'RAM') IconComponent = FaMemory;
                    if (spec.keyName === 'Pin') IconComponent = FaBatteryFull;

                    return (
                      <div key={index}>
                        <label className="block text-gray-600 text-sm font-medium mb-1">{spec.keyName}</label>
                        <div className="relative">
                          <IconComponent className="absolute left-3 top-3 text-gray-400" />
                          <input 
                            type="text" 
                            className="w-full pl-10 p-2 border border-gray-300 rounded focus:border-purple-500 outline-none" 
                            value={spec.value} 
                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)} 
                            placeholder={`VD: Nhập ${spec.keyName}...`} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Các ô thêm thủ công */}
                {specs.filter(s => !s.isFixed).length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                    <p className="text-sm font-medium text-gray-500 italic mb-2">Các thông số bổ sung (Camera, NFC...):</p>
                    {specs.map((spec, index) => {
                      if (spec.isFixed) return null;
                      return (
                        <div key={index} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            placeholder="Tên (VD: Camera)"
                            value={spec.keyName}
                            onChange={(e) => handleSpecChange(index, 'keyName', e.target.value)}
                            className="w-1/3 p-2 border border-gray-300 rounded focus:border-purple-500 outline-none bg-gray-50 text-sm"
                          />
                          <input 
                            type="text" 
                            placeholder="Giá trị (VD: 108 MP)"
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded focus:border-purple-500 outline-none bg-gray-50 text-sm"
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveSpec(index)}
                            className="text-red-400 hover:bg-red-50 p-2 rounded transition"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- CỘT PHẢI --- */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Hình ảnh</h3>
              <div className="mb-4">
                <label className="block text-gray-600 text-sm font-medium mb-1">Link Ảnh (URL)</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" value={image} onChange={(e) => setImage(e.target.value)} required />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                {image ? (
                   <img src={image} alt="Preview" className="w-full h-48 object-contain rounded" />
                ) : (
                   <div className="py-8 text-gray-400">
                      <FaCloudUploadAlt size={40} className="mx-auto mb-2" />
                      <p className="text-sm">Dán link ảnh vào ô trên để xem trước</p>
                   </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#724ae8] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
              {loading ? 'Đang xử lý...' : (<><FaSave /> {isEditMode ? 'LƯU THAY ĐỔI' : 'TẠO SẢN PHẨM'}</>)}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;