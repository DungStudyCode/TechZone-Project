// client/src/components/ThuMua/PostComposer.jsx
import React, { useState } from 'react';
// ✅ 1. IMPORT API XỊN THAY CHO AXIOS
import api from '../../services/api'; 
import { useAuth } from '../../contexts/AuthContext'; 
import { FaCamera, FaPaperPlane, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

const PostComposer = ({ onPostSuccess }) => {
  const { user } = useAuth(); 
  
  const [formData, setFormData] = useState({
    title: '', content: '', price: '', category: 'Điện thoại', condition: 'Cũ', area: ''
  });
  
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationName, setLocationName] = useState("");

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([16.065, 108.22]); 
  const [selectedPos, setSelectedPos] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    setPreview([...preview, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreview(preview.filter((_, i) => i !== index));
  };

  const handleOpenMap = () => {
    setShowMapModal(true);
    if (navigator.geolocation && !lat) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLoc = [position.coords.latitude, position.coords.longitude];
          setMapCenter(currentLoc);
          setSelectedPos(currentLoc); 
        },
        (error) => {
          console.warn("Chưa có quyền vị trí, dùng vị trí mặc định", error);
        }
      );
    } else if (lat && lng) {
      setMapCenter([lat, lng]);
      setSelectedPos([lat, lng]);
    }
  };

  const confirmLocation = () => {
    if (selectedPos) {
      setLat(selectedPos[0]);
      setLng(selectedPos[1]);
      setLocationName("📍 Đã ghim vị trí tùy chỉnh");
    }
    setShowMapModal(false);
  };

  const handleSubmit = async () => {
    if (!user) return alert('Bạn cần đăng nhập để đăng tin nhé!');
    if (!formData.title || !formData.price || !formData.area) return alert('Vui lòng nhập đủ Tiêu đề, Giá và Khu vực!');

    setIsLoading(true);
    try {
      const postData = {
        ...formData,
        price: Number(formData.price),
        images: ['https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg'], // Giả lập
        lat, lng  
      };

      // ✅ 2. GỌI API RÚT GỌN (Đã bỏ localhost:5000 và bỏ luôn phần gắn Token thủ công)
      await api.post('/posts', postData);

      setFormData({ title: '', content: '', price: '', category: 'Điện thoại', condition: 'Cũ', area: '' });
      setImages([]); setPreview([]); setLat(null); setLng(null); setLocationName("");
      alert('Đăng tin thành công!');
      if (onPostSuccess) onPostSuccess();
    } catch (error) {
      console.error('Lỗi đăng tin:', error);
      alert('Đăng tin thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input 
            type="text" name="title" value={formData.title} onChange={handleChange}
            placeholder="Tiêu đề (VD: Bán iPhone 13 Pro Max)..."
            className="bg-gray-50 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200 border border-gray-100"
          />
          <div className="flex gap-2">
            <input 
              type="text" name="area" value={formData.area} onChange={handleChange}
              placeholder="Khu vực (VD: Quận 1, TP.HCM)..."
              className="flex-1 bg-gray-50 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200 border border-gray-100"
            />
            <button 
              type="button" 
              onClick={handleOpenMap}
              className={`px-3 rounded-lg text-sm font-bold transition-colors whitespace-nowrap border ${
                lat ? 'bg-green-50 border-green-200 text-green-700' : 'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100'
              }`}
            >
              {locationName || "📍 Chọn trên bản đồ"}
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user ? user.name.charAt(0).toUpperCase() : 'TZ'}
          </div>
          <textarea 
            name="content" value={formData.content} onChange={handleChange}
            className="w-full bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none text-sm border border-gray-100"
            placeholder="Mô tả chi tiết tình trạng máy, phụ kiện đi kèm..." rows="3"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Giá bán (VNĐ)..." className="bg-gray-50 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-purple-200 border border-gray-100 font-bold text-red-600"/>
          <select name="category" value={formData.category} onChange={handleChange} className="bg-gray-50 rounded-lg p-2 text-sm outline-none border border-gray-100">
            <option value="Điện thoại">Điện thoại</option>
            <option value="Laptop">Laptop</option>
            <option value="Tablet">Tablet</option>
            <option value="Phụ kiện">Phụ kiện</option>
          </select>
          <select name="condition" value={formData.condition} onChange={handleChange} className="bg-gray-50 rounded-lg p-2 text-sm outline-none border border-gray-100">
            <option value="Mới">Mới (Nguyên seal)</option>
            <option value="Cũ">Cũ (Đã sử dụng)</option>
            <option value="Lỗi">Lỗi / Xác</option>
          </select>
        </div>

        {preview.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {preview.map((url, i) => (
              <div key={i} className="relative group aspect-square">
                <img src={url} alt="preview" className="w-full h-full object-cover rounded-lg border shadow-sm" />
                <button 
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center border-t pt-3">
          <label className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer transition-colors">
            <FaCamera className="text-green-500" />
            <span className="text-sm font-medium">Thêm ảnh</span>
            <input type="file" multiple hidden onChange={handleImageChange} accept="image/*" />
          </label>

          <button 
            onClick={handleSubmit} disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${isLoading ? 'bg-gray-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'}`}
          >
            {isLoading ? 'Đang xử lý...' : <>Đăng tin <FaPaperPlane /></>}
          </button>
        </div>
      </div>

      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col animation-fade-in">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" /> Chọn vị trí giao dịch chính xác
                </h3>
                <p className="text-xs text-gray-500 mt-1">Chạm vào bản đồ để ghim vị trí trong ngõ hẻm của bạn</p>
              </div>
              <button onClick={() => setShowMapModal(false)} className="text-gray-400 hover:text-red-500 bg-white rounded-full p-2 shadow-sm border">
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className="h-[60vh] w-full relative bg-gray-100">
              <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler onLocationSelect={setSelectedPos} />
                {selectedPos && <Marker position={selectedPos} icon={customIcon} />}
              </MapContainer>
            </div>

            <div className="p-4 bg-white border-t flex justify-end gap-3 items-center">
              {!selectedPos && <span className="text-sm text-orange-500 italic mr-auto">Vui lòng click vào bản đồ để chọn vị trí!</span>}
              <button onClick={() => setShowMapModal(false)} className="px-5 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium transition">
                Hủy
              </button>
              <button 
                onClick={confirmLocation} 
                disabled={!selectedPos}
                className="px-5 py-2.5 rounded-xl text-white bg-purple-600 hover:bg-purple-700 font-bold shadow-md shadow-purple-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận vị trí này
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostComposer;