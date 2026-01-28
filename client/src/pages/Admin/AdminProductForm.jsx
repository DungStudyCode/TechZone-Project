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
  const [discount, setDiscount] = useState(0); // ✅ Sẽ thêm ô nhập cho biến này
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  
  const [category, setCategory] = useState('Điện thoại'); 
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  // --- STATE THÔNG SỐ KỸ THUẬT ---
  const [specs, setSpecs] = useState({
    screen: '',
    chip: '',
    ram: '',
    battery: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setName(data.name);
          setPrice(data.price);
          setDiscount(data.discount || 0); // ✅ Load giảm giá
          setImage(data.image);
          setBrand(data.brand);
          setCategory(data.category);
          setCountInStock(data.countInStock);
          setDescription(data.description);
          
          if (data.specs) {
            setSpecs({
              screen: data.specs.screen || '',
              chip: data.specs.chip || '',
              ram: data.specs.ram || '',
              battery: data.specs.battery || ''
            });
          }
        } catch (error) {
          console.error("Lỗi tải SP:", error); // ✅ Fix lỗi 'error defined but never used'
          alert('Lỗi tải dữ liệu sản phẩm');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setSpecs(prev => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const finalSpecs = (category === 'Điện thoại' || category === 'Laptop') ? specs : {};

      const productData = {
        name,
        price,
        discount, // ✅ Gửi discount lên server
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
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Thông tin cơ bản</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Mô tả chi tiết</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-32"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Giá bán & Phân loại</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                {/* ✅ THÊM Ô NHẬP GIẢM GIÁ (Fix lỗi unused var 'discount') */}
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Giảm giá (%)</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="VD: 10"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Số lượng kho</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-600 font-medium mb-1">Danh mục sản phẩm</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Điện thoại">📱 Điện thoại</option>
                    <option value="Laptop">💻 Laptop</option>
                    <option value="Phụ kiện">🎧 Phụ kiện</option>
                    <option value="Tablet">iPad / Tablet</option>
                    <option value="Khác">📦 Khác</option>
                  </select>
                </div>
              </div>
            </div>

            {showSpecs && (
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                   <FaMicrochip className="text-purple-600"/> Thông số kỹ thuật
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">Màn hình</label>
                    <div className="relative">
                        <FaMobileAlt className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="screen" className="w-full pl-10 p-2 border border-gray-300 rounded focus:border-purple-500 outline-none" 
                            value={specs.screen} onChange={handleSpecChange} placeholder="VD: 6.7 inch OLED" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">Chipset</label>
                    <div className="relative">
                        <FaMicrochip className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="chip" className="w-full pl-10 p-2 border border-gray-300 rounded focus:border-purple-500 outline-none" 
                            value={specs.chip} onChange={handleSpecChange} placeholder="VD: Snapdragon 8 Gen 2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">RAM</label>
                    <div className="relative">
                        <FaMemory className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="ram" className="w-full pl-10 p-2 border border-gray-300 rounded focus:border-purple-500 outline-none" 
                            value={specs.ram} onChange={handleSpecChange} placeholder="VD: 8GB" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">Pin</label>
                    <div className="relative">
                        <FaBatteryFull className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="battery" className="w-full pl-10 p-2 border border-gray-300 rounded focus:border-purple-500 outline-none" 
                            value={specs.battery} onChange={handleSpecChange} placeholder="VD: 5000 mAh" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Hình ảnh</h3>
              <div className="mb-4">
                <label className="block text-gray-600 text-sm font-medium mb-1">Link Ảnh (URL)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#724ae8] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Đang xử lý...' : (<><FaSave /> {isEditMode ? 'LƯU THAY ĐỔI' : 'TẠO SẢN PHẨM'}</>)}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;