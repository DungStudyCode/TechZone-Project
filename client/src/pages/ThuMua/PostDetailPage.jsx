// client/src/pages/ThuMua/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// ✅ 1. Import api xịn thay cho axios
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserCircle, FaArrowLeft, FaCommentDots, FaTrash, FaCheckCircle, FaUndo, FaMapMarkerAlt } from 'react-icons/fa';

const PostDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const { user } = useAuth(); 
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // ✅ 2. Bỏ localhost, gọi api cực ngắn
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết:", error);
      }
    };
    fetchPost();
  }, [id]);

  const handleContactSeller = async () => {
    if (!user) return alert('Bạn cần đăng nhập để chat với người bán!');
    if (post.author && user._id === post.author._id) return alert('Đây là bài đăng của chính bạn mà!');

    try {
      // ✅ 3. Bỏ localhost và bỏ luôn việc truyền Header thủ công
      const { data } = await api.post('/chats', { 
        postId: post._id, 
        sellerId: post.author._id 
      });
      navigate(`/messenger?chatId=${data._id}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Lỗi khi tạo phòng chat');
    }
  };

  const handleToggleStatus = async () => {
    try {
      // ✅ 4. Gọi api đổi trạng thái sạch sẽ
      const { data } = await api.put(`/posts/${post._id}/status`, {});
      setPost(data); 
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này vĩnh viễn không?')) {
      try {
        // ✅ 5. Gọi api xóa sạch sẽ
        await api.delete(`/posts/${post._id}`);
        alert('Đã xóa thành công!');
        navigate('/thu-mua'); 
      } catch (error) {
        console.error("Lỗi chi tiết:", error);
        alert('Lỗi xóa bài đăng');
      }
    }
  };

  if (!post) return <div className="text-center py-20">Đang tải dữ liệu...</div>;

  const isOwnerOrAdmin = user && (user.isAdmin || user._id === post.author?._id);
  
  const isSoldOut = post.status === 'sold';

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link to="/thu-mua" className="flex items-center gap-2 text-purple-600 mb-6 font-medium hover:underline w-fit">
          <FaArrowLeft /> Quay lại Chợ công nghệ
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
            
            {isSoldOut && (
              <div className="absolute top-10 -right-12 bg-red-600 text-white font-black text-xl py-2 px-16 transform rotate-45 shadow-lg z-10">
                ĐÃ BÁN
              </div>
            )}

            <div className="flex justify-between items-start mb-4 pr-10">
              <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
              <span className={`font-bold px-3 py-1 rounded text-sm whitespace-nowrap ${isSoldOut ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-700'}`}>
                {post.condition}
              </span>
            </div>
            
            <p className={`text-3xl font-black mb-6 ${isSoldOut ? 'text-gray-400 line-through' : 'text-red-600'}`}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(post.price)}
            </p>

            <div className={`bg-gray-50 rounded-xl mb-6 flex justify-center h-80 overflow-hidden ${isSoldOut ? 'opacity-50 grayscale' : ''}`}>
              <img src={post.images?.[0] || 'https://via.placeholder.com/600x400'} alt="Product" className="object-contain h-full" />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-lg mb-3">Mô tả chi tiết:</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {post.location && post.location.coordinates && post.location.coordinates.length === 2 && (
              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" /> Khu vực giao dịch
                </h3>
                <div className="w-full h-[350px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner relative">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=$${post.location.coordinates[1]},${post.location.coordinates[0]}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    title="Bản đồ vị trí người bán"
                  ></iframe>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center italic">
                  * Vị trí trên bản đồ là khu vực tương đối do người bán ghim khi đăng bài.
                </p>
              </div>
            )}

            {isOwnerOrAdmin && (
              <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <h4 className="font-bold text-orange-800 mb-3 text-sm uppercase tracking-wide">⚙️ Khu vực Quản lý bài đăng</h4>
                <div className="flex gap-3">
                  <button 
                    onClick={handleToggleStatus}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition ${isSoldOut ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                  >
                    {isSoldOut ? <><FaUndo /> Đổi lại: Còn hàng</> : <><FaCheckCircle /> Đánh dấu: Đã bán</>}
                  </button>
                  <button 
                    onClick={handleDeletePost}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition"
                  >
                    <FaTrash /> Xóa bài đăng
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-fit sticky top-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm border-2 border-white ring-2 ring-purple-100">
                {post.author?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{post.author?.name || 'Người dùng ẩn danh'}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${isSoldOut ? 'bg-gray-300' : 'bg-green-500 animate-pulse'}`}></span> 
                  {isSoldOut ? 'Ngừng giao dịch' : 'Đang hoạt động'}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-500">Khu vực:</span>
                <span className="font-medium text-gray-800">{post.area}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-500">Đăng lúc:</span>
                <span className="font-medium text-gray-800">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {isSoldOut ? (
              <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                Sản phẩm đã được bán
              </button>
            ) : (
              <button 
                onClick={handleContactSeller}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
              >
                <FaCommentDots className="text-xl" /> Chat với người bán ngay
              </button>
            )}
            
            <div className="mt-5 text-center text-[11px] text-gray-400 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              🛡️ Giao dịch an toàn. TechZone khuyến cáo bạn nên kiểm tra kỹ hàng hóa trước khi thanh toán. Không chuyển tiền trước dưới mọi hình thức.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;