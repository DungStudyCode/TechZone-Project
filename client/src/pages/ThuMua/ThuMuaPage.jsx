// client/src/pages/ThuMua/ThuMuaPage.jsx
import React, { useState, useEffect } from 'react';
// ✅ 1. Import api thay cho axios
import api from '../../services/api'; 
import PostComposer from '../../components/ThuMua/PostComposer';
import PostCard from '../../components/ThuMua/PostCard';
import { FaMapMarkerAlt } from 'react-icons/fa';

const ThuMuaPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const [radius, setRadius] = useState(""); 
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (radius && userLat && userLng) {
          params.radius = radius;
          params.lat = userLat;
          params.lng = userLng;
        }

        // ✅ 2. Gọi API siêu ngắn gọn, đã dọn sạch localhost
        const { data } = await api.get('/posts', { params });
        setPosts(data);
      } catch (error) {
        console.error('Lỗi khi lấy tin đăng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refreshTrigger, radius, userLat, userLng]); 

  const handleFindNearMe = (selectedRadius) => {
    if (selectedRadius === "") {
      setRadius(""); 
      return;
    }

    if (!userLat || !userLng) {
      setLocationStatus("Đang định vị...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          setRadius(selectedRadius);
          setLocationStatus("Đã lấy vị trí");
        },
        (error) => {
          console.warn("Lỗi lấy vị trí:", error);
          setLocationStatus("Lỗi định vị!");
          alert("Vui lòng cấp quyền truy cập vị trí để tìm quanh đây!");
          setRadius(""); 
        }
      );
    } else {
      setRadius(selectedRadius);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-wide">
            Chợ Công Nghệ <span className="text-purple-600">TechZone</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Nền tảng mua bán, trao đổi đồ công nghệ trực tiếp giữa người dùng.
          </p>
        </div>

        <PostComposer onPostSuccess={() => setRefreshTrigger(prev => prev + 1)} />

        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Tin đăng mới nhất 
              {locationStatus === "Đang định vị..." && <span className="text-sm font-normal text-purple-500 animate-pulse">(Đang quét radar...)</span>}
            </h2>
            
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex items-center px-3 text-gray-400 border-r border-gray-100">
                <FaMapMarkerAlt className={radius ? "text-red-500" : ""} />
              </div>
              <select 
                value={radius}
                onChange={(e) => handleFindNearMe(e.target.value)}
                className="bg-transparent text-gray-700 py-1.5 px-3 outline-none text-sm font-medium cursor-pointer"
              >
                <option value="">🗺️ Toàn quốc</option>
                <option value="5">📍 Quanh tôi 5 km</option>
                <option value="10">📍 Quanh tôi 10 km</option>
                <option value="20">📍 Quanh tôi 20 km</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
              Đang tải danh sách tin đăng...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 italic bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
              {radius ? `Không có máy nào được rao bán trong bán kính ${radius}km quanh bạn.` : "Hiện chưa có tin đăng nào. Hãy là người đầu tiên đăng tin nhé!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ThuMuaPage;