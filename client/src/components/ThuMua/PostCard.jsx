// client/src/components/ThuMua/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const PostCard = ({ post }) => {
  // Hàm format tiền tệ VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Xác định màu sắc badge dựa trên tình trạng máy
  const conditionColor = 
    post.condition === 'Mới' ? 'bg-green-100 text-green-700' :
    post.condition === 'Cũ' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
      
      {/* Phần Ảnh (Có tỉ lệ cố định để không bị lệch khung) */}
      <Link to={`/thu-mua/post/${post._id}`} className="relative h-48 overflow-hidden bg-gray-100 block">
        <img 
          src={post.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={post.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge Tình trạng máy */}
        <span className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${conditionColor}`}>
          {post.condition}
        </span>
      </Link>

      {/* Phần Nội dung thông tin */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/thu-mua/post/${post._id}`} className="block mb-2">
          <h3 className="text-gray-800 font-semibold text-base line-clamp-2 group-hover:text-purple-600 transition-colors h-12" title={post.title}>
            {post.title}
          </h3>
        </Link>
        
        <p className="text-red-600 font-black text-lg mb-3">
          {formatPrice(post.price)}
        </p>

        {/* Khu vực & Thời gian (Đẩy xuống đáy thẻ) */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1 truncate w-2/3" title={post.area}>
            <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{post.area}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <FaClock className="text-gray-400" />
            <span>{post.timeAgo || 'Vừa xong'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;