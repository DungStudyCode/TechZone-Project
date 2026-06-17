// client/src/pages/Admin/AdminProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaSave, FaArrowLeft, FaCloudUploadAlt, FaTrash, FaPlus, FaVideo, FaImage, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // --- 1. STATE CƠ BẢN ---
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Điện thoại');
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState(''); // Link YouTube

  // --- 2. STATE HÌNH ẢNH ---
  const [mainImage, setMainImage] = useState(''); // Ảnh chính
  const [galleryImages, setGalleryImages] = useState([]); // Mảng ảnh phụ
  const [imageUrl, setImageUrl] = useState(''); // State lưu link ảnh dán từ URL
  const [uploading, setUploading] = useState(false);

  // --- 3. STATE THÔNG SỐ KỸ THUẬT (ĐỘNG) ---
  const [specs, setSpecs] = useState([
    { keyName: 'Màn hình', value: '' },
    { keyName: 'Chipset', value: '' },
    { keyName: 'RAM', value: '' },
    { keyName: 'Pin', value: '' }
  ]);

  const [loading, setLoading] = useState(false);

  // ✅ HÀM MỚI: Tự động trích xuất ID video và tạo link Embed hợp lệ
  const formatYoutubeUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url; // Đã chuẩn thì giữ nguyên
    
    // Dùng Regex để lấy đúng 11 ký tự ID của YouTube từ mọi loại link
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  // --- TẢI DỮ LIỆU CŨ KHI Ở CHẾ ĐỘ SỬA ---
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setName(data.name || '');
          setBrand(data.brand || '');
          setCategory(data.category || 'Điện thoại');
          setPrice(data.price || 0);
          setDiscount(data.discount || 0);
          setCountInStock(data.countInStock || 0);
          setDescription(data.description || '');
          setVideo(data.video || '');
          
          setMainImage(data.image || '');
          setGalleryImages(data.images || []);

          if (data.specs && data.specs.length > 0) {
             setSpecs(data.specs);
          }
        } catch (error) {
          console.error("Lỗi tải SP:", error);
          toast.error('Lỗi tải dữ liệu sản phẩm');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  // --- CÁC HÀM XỬ LÝ THÔNG SỐ KỸ THUẬT ---
  const handleAddSpec = () => {
    setSpecs([...specs, { keyName: '', value: '' }]);
  };

  const handleRemoveSpec = (indexToRemove) => {
    setSpecs(specs.filter((_, index) => index !== indexToRemove));
  };

  const handleSpecChange = (index, field, newValue) => {
    const updatedSpecs = [...specs];
    updatedSpecs[index][field] = newValue;
    setSpecs(updatedSpecs);
  };

  // --- CÁC HÀM XỬ LÝ HÌNH ẢNH (UPLOAD TỪ MÁY) ---
  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]); // Chú ý key là 'images' khớp với Backend
    }

    setUploading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      const { data } = await api.post('/upload', formData, config);
      const uploadedPaths = data.images; // Backend trả về mảng các link ảnh
      
      // Nếu chưa có ảnh chính, lấy ảnh đầu tiên làm ảnh chính
      if (!mainImage && uploadedPaths.length > 0) {
        setMainImage(uploadedPaths[0]);
      }
      
      setGalleryImages(prev => [...prev, ...uploadedPaths]);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải ảnh: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input file
    }
  };

  // --- CÁC HÀM XỬ LÝ HÌNH ẢNH (THÊM BẰNG LINK URL) ---
  const handleAddImageUrl = () => {
    if (imageUrl.trim() !== '') {
      const newUrl = imageUrl.trim();
      setGalleryImages(prev => [...prev, newUrl]);
      
      // Nếu chưa có ảnh chính thì lấy luôn link này làm ảnh chính
      if (!mainImage) {
        setMainImage(newUrl);
      }
      
      setImageUrl(''); // Xóa ô input sau khi thêm
      toast.success('Đã thêm ảnh từ URL!');
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    const newGallery = galleryImages.filter((_, index) => index !== indexToRemove);
    setGalleryImages(newGallery);
    // Nếu vô tình xóa ảnh đang làm ảnh chính, thì bỏ ảnh chính luôn
    if (galleryImages[indexToRemove] === mainImage) {
      setMainImage(newGallery.length > 0 ? newGallery[0] : '');
    }
  };

  // --- HÀM SUBMIT LƯU SẢN PHẨM ---
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!mainImage) {
      return toast.warn('Vui lòng chọn ít nhất 1 ảnh làm ảnh đại diện!');
    }

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Lọc bỏ các thông số trống
      const validSpecs = specs.filter(s => s.keyName.trim() !== '' && s.value.trim() !== '');

      const productData = {
        name, brand, category, price, discount, countInStock,
        description, 
        video: formatYoutubeUrl(video), // ✅ ĐÃ CẬP NHẬT: Ép chuẩn link trước khi lưu vào DB
        image: mainImage,
        images: galleryImages, // Gửi nguyên mảng ảnh lên Backend
        specs: validSpecs
      };

      if (isEditMode) {
        await api.put(`/products/${id}`, productData, config);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await api.post('/products', productData, config);
        toast.success('Thêm sản phẩm mới thành công!');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/products" className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-purple-600 transition">
              <FaArrowLeft />
            </Link>
            <h1 className="text-2xl font-black text-gray-800">
              {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
          </div>
          <button 
            onClick={submitHandler} disabled={loading}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FaSave /> LƯU SẢN PHẨM</>}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* ========================================== */}
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN & MÔ TẢ           */}
          {/* ========================================== */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* THÔNG TIN CHUNG */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Thương hiệu *</label>
                  <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="VD: Apple, Samsung..." required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục *</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Điện thoại">📱 Điện thoại</option>
                    <option value="Laptop">💻 Laptop</option>
                    <option value="Tablet">💊 Tablet</option>
                    <option value="Phụ kiện">🎧 Phụ kiện</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GIÁ & KHO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">Giá & Kho hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                  <input type="number" min="0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Giảm giá (%)</label>
                  <input type="number" min="0" max="100" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số lượng kho *</label>
                  <input type="number" min="0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* MÔ TẢ (RICH TEXT) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">Đặc điểm nổi bật</h3>
              <div className="h-72 mb-12">
                <ReactQuill 
                  theme="snow" 
                  value={description} 
                  onChange={setDescription} 
                  className="h-full rounded-xl"
                  placeholder="Viết bài mô tả sản phẩm tại đây..."
                />
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* CỘT PHẢI: ẢNH, VIDEO & THÔNG SỐ              */}
          {/* ========================================== */}
          <div className="space-y-6">
            
            {/* THƯ VIỆN ẢNH */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FaImage className="text-purple-500"/> Thư viện ảnh</h3>
                
                {/* NÚT TẢI ẢNH (MULTIPLE) */}
                <label className="cursor-pointer bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-100 transition flex items-center gap-1">
                  {uploading ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div> : <><FaCloudUploadAlt /> Tải ảnh lên</>}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={uploadFileHandler} disabled={uploading}/>
                </label>
              </div>

              {/* Ô NHẬP LINK ẢNH TỪ WEB */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <FaLink className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-9 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-gray-50" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="Hoặc dán link URL ảnh vào đây..." 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddImageUrl}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition"
                >
                  Thêm
                </button>
              </div>

              {galleryImages.length === 0 ? (
                <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  Chưa có ảnh nào. Bạn có thể tải lên từ máy hoặc dán link URL.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {galleryImages.map((img, index) => (
                    <div key={index} className={`relative aspect-square rounded-xl border-2 overflow-hidden group ${mainImage === img ? 'border-purple-600 shadow-md' : 'border-gray-100'}`}>
                      <img src={img} alt={`gallery-${index}`} className="w-full h-full object-cover bg-gray-50" />
                      
                      {/* Lớp mờ và nút chức năng khi hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        {mainImage !== img && (
                          <button type="button" onClick={() => setMainImage(img)} className="bg-white text-purple-600 text-[10px] font-bold px-2 py-1 rounded shadow hover:bg-purple-50">
                            Làm ảnh chính
                          </button>
                        )}
                        <button type="button" onClick={() => removeGalleryImage(index)} className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                          <FaTrash size={12}/>
                        </button>
                      </div>

                      {mainImage === img && (
                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">MAIN</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* VIDEO YOUTUBE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2"><FaVideo className="text-red-500"/> Video Review</h3>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
                value={video} 
                onChange={(e) => setVideo(e.target.value)} 
                placeholder="Dán link YouTube bất kỳ (Ví dụ: https://www.youtube.com/watch?v=...)" 
              />
              {video && (
                <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-gray-200">
                  {/* ✅ ĐÃ CẬP NHẬT: Tự động format link khi preview để chống lỗi sameorigin */}
                  <iframe src={formatYoutubeUrl(video)} title="Video Preview" className="w-full h-full" allowFullScreen></iframe>
                </div>
              )}
            </div>

            {/* THÔNG SỐ KỸ THUẬT */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-800">Thông số kỹ thuật</h3>
                <button type="button" onClick={handleAddSpec} className="text-purple-600 bg-purple-50 p-1.5 rounded-lg hover:bg-purple-100 transition">
                  <FaPlus />
                </button>
              </div>

              <div className="space-y-3">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <input 
                      type="text" placeholder="Tên (VD: RAM)" value={spec.keyName} 
                      onChange={(e) => handleSpecChange(index, 'keyName', e.target.value)}
                      className="w-1/3 p-2 text-sm bg-transparent border-b border-gray-200 focus:border-purple-500 outline-none font-bold text-gray-700" 
                    />
                    <input 
                      type="text" placeholder="Giá trị (VD: 8GB)" value={spec.value} 
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      className="w-full p-2 text-sm bg-transparent border-b border-gray-200 focus:border-purple-500 outline-none" 
                    />
                    <button type="button" onClick={() => handleRemoveSpec(index)} className="p-2 text-gray-400 hover:text-red-500 transition">
                      <FaTrash size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;