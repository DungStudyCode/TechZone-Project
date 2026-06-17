// client/src/pages/Admin/ProductEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Style của trình soạn thảo
import { FaUpload, FaTrash, FaPlus, FaArrowLeft, FaStar, FaVideo } from 'react-icons/fa';

const ProductEdit = () => {
  const { id } = useParams(); // Nếu có ID trên URL -> Chế độ Edit, nếu không -> Chế độ Add
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. STATE CƠ BẢN
  const [formData, setFormData] = useState({
    name: '', brand: '', category: '',
    price: 0, countInStock: 0, discount: 0,
    video: '' // Link YouTube
  });
  const [description, setDescription] = useState('');

  // 2. STATE HÌNH ẢNH
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]); // Mảng chứa các link ảnh

  // 3. STATE THÔNG SỐ KỸ THUẬT (Động)
  const [specs, setSpecs] = useState([{ keyName: '', value: '' }]);

  // Lấy dữ liệu nếu ở chế độ Edit
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setFormData({
            name: data.name, brand: data.brand, category: data.category,
            price: data.price, countInStock: data.countInStock, 
            discount: data.discount || 0, video: data.video || ''
          });
          setDescription(data.description);
          setMainImage(data.image);
          setGalleryImages(data.images || []);
          setSpecs(data.specs && data.specs.length > 0 ? data.specs : [{ keyName: '', value: '' }]);
        } catch (error) {
          toast.error('Lỗi khi tải thông tin sản phẩm');
          console.error(error);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ==========================================
  // ⚙️ LOGIC THÔNG SỐ KỸ THUẬT ĐỘNG
  // ==========================================
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpecField = () => setSpecs([...specs, { keyName: '', value: '' }]);
  
  const removeSpecField = (index) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs.length === 0 ? [{ keyName: '', value: '' }] : newSpecs); // Luôn giữ lại 1 dòng
  };

  // ==========================================
  // 🖼️ LOGIC UPLOAD HÌNH ẢNH (GỌI API)
  // ==========================================
  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('images', files[i]);
    }

    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post('/upload', uploadData, config);
      
      const newImagePaths = data.images;
      
      // Nếu chưa có ảnh chính, lấy ảnh đầu tiên làm ảnh chính luôn
      if (!mainImage && newImagePaths.length > 0) {
        setMainImage(newImagePaths[0]);
      }
      
      // Nối ảnh mới vào mảng ảnh cũ
      setGalleryImages(prev => [...prev, ...newImagePaths]);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      toast.error('Lỗi tải ảnh: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    const newGallery = galleryImages.filter((_, index) => index !== indexToRemove);
    setGalleryImages(newGallery);
    // Nếu xóa trúng ảnh đang làm ảnh chính, thì gỡ ảnh chính
    if (galleryImages[indexToRemove] === mainImage) {
      setMainImage(newGallery.length > 0 ? newGallery[0] : '');
    }
  };

  // ==========================================
  // 🚀 XỬ LÝ LƯU SẢN PHẨM (SUBMIT)
  // ==========================================
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!mainImage) return toast.warn('Vui lòng chọn ít nhất 1 ảnh làm ảnh chính!');
    if (!description || description === '<p><br></p>') return toast.warn('Vui lòng nhập mô tả sản phẩm!');

    // Lọc bỏ các dòng thông số trống
    const validSpecs = specs.filter(s => s.keyName.trim() !== '' && s.value.trim() !== '');

    const productPayload = {
      ...formData,
      description,
      image: mainImage,
      images: galleryImages,
      specs: validSpecs
    };

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      if (id) {
        await api.put(`/products/${id}`, productPayload, config);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await api.post('/products', productPayload, config);
        toast.success('Thêm sản phẩm mới thành công!');
      }
      navigate('/admin/products'); // Chuyển về danh sách
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/products" className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-purple-600 transition-colors">
              <FaArrowLeft />
            </Link>
            <h1 className="text-2xl font-black text-gray-800">
              {id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
          </div>
          <button 
            onClick={submitHandler} disabled={loading}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Lưu sản phẩm'}
          </button>
        </div>

        <form className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN & MÔ TẢ */}
          <div className="xl:col-span-2 space-y-8">
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Thông tin cơ bản</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="VD: iPhone 15 Pro Max 256GB" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Thương hiệu *</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="VD: Apple" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                    <option value="">Chọn danh mục...</option>
                    <option value="Điện thoại">Điện thoại</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Tai nghe">Tai nghe</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Giá & Kho hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Giá bán (VNĐ) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Giảm giá (%)</label>
                  <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} min="0" max="100" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tồn kho *</label>
                  <input type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} min="0" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Đặc điểm nổi bật (Rich Text)</h2>
              <div className="h-64 mb-12">
                <ReactQuill 
                  theme="snow" 
                  value={description} 
                  onChange={setDescription} 
                  className="h-full rounded-xl"
                  placeholder="Nhập mô tả chi tiết sản phẩm... (Có thể bôi đậm, in nghiêng, chèn link)"
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: MEDIA & THÔNG SỐ */}
          <div className="space-y-8">
            
            {/* THƯ VIỆN ẢNH */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">Thư viện ảnh</h2>
                <label className="cursor-pointer bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-100 transition-colors flex items-center gap-2">
                  {uploading ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div> : <><FaUpload /> Tải ảnh lên</>}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={uploadFileHandler} disabled={uploading}/>
                </label>
              </div>

              {galleryImages.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                  Chưa có hình ảnh nào.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {galleryImages.map((img, index) => (
                    <div key={index} className={`relative aspect-square rounded-xl border-2 overflow-hidden group ${mainImage === img ? 'border-purple-500 shadow-md' : 'border-gray-100'}`}>
                      <img src={img} alt={`gallery-${index}`} className="w-full h-full object-cover" />
                      
                      {/* Lớp overlay khi hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        {mainImage !== img && (
                          <button type="button" onClick={() => setMainImage(img)} className="bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded shadow hover:bg-purple-50">
                            Đặt làm chính
                          </button>
                        )}
                        <button type="button" onClick={() => removeGalleryImage(index)} className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                          <FaTrash size={12}/>
                        </button>
                      </div>
                      
                      {/* Badge ảnh chính */}
                      {mainImage === img && (
                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Chính</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* VIDEO YOUTUBE */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><FaVideo className="text-red-500"/> Video (Tùy chọn)</h2>
              <input 
                type="text" name="video" value={formData.video} onChange={handleInputChange} 
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
                placeholder="Dán link YouTube nhúng (VD: https://www.youtube.com/embed/...)" 
              />
              {formData.video && (
                <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-gray-200">
                  <iframe src={formData.video} title="Video Preview" className="w-full h-full" allowFullScreen></iframe>
                </div>
              )}
            </div>

            {/* THÔNG SỐ KỸ THUẬT ĐỘNG */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">Thông số kỹ thuật</h2>
                <button type="button" onClick={addSpecField} className="text-purple-600 bg-purple-50 p-2 rounded-lg hover:bg-purple-100">
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
                    <button type="button" onClick={() => removeSpecField(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <FaTrash size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;