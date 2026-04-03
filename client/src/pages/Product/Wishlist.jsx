import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaHeartBroken, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // 1. Gọi API lấy danh sách yêu thích khi load trang
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await api.get('/users/wishlist', config);
        setWishlist(data);
      } catch (error) {
        console.error("Lỗi tải wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchWishlist();
  }, [user]);

  // 2. Xóa sản phẩm khỏi Wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Gọi API toggle (vì sản phẩm đang có trong list, toggle sẽ tự thành xóa)
      await api.post('/users/wishlist', { productId }, config);
      
      // Cập nhật lại UI ngay lập tức
      setWishlist(wishlist.filter(item => item._id !== productId));
    } catch (error) {
      console.error("Lỗi xóa khỏi wishlist:", error);
    }
  };

  const formatPrice = (price) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (!user) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
       <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập!</h2>
       <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem danh sách sản phẩm yêu thích.</p>
       <Link to="/login" className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">Đăng nhập ngay</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="container mx-auto max-w-6xl animate-fade-in-up">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-200">
            <FaHeart size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Sản phẩm yêu thích</h1>
            <p className="text-gray-500 font-medium mt-1">Lưu trữ những món đồ công nghệ bạn muốn sở hữu ({wishlist.length} sản phẩm)</p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
           <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
           </div>
        ) : wishlist.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <FaHeartBroken size={60} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có sản phẩm nào!</h2>
            <p className="text-gray-500 mb-8 max-w-md">Danh sách yêu thích của bạn đang trống. Hãy lướt một vòng TechZone và "thả tim" cho những siêu phẩm bạn ưng ý nhé.</p>
            <Link to="/products" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg transition-all hover:-translate-y-1">
              Đi mua sắm ngay <FaArrowRight />
            </Link>
          </div>
        ) : (
          /* DANH SÁCH SẢN PHẨM ĐÃ LƯU */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                
                {/* Nút Xóa (Góc phải) */}
                <div className="flex justify-end mb-2">
                  <button 
                    onClick={() => removeFromWishlist(product._id)}
                    className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    title="Bỏ yêu thích"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                {/* Ảnh sản phẩm */}
                <Link to={`/product/${product._id}`} className="block h-48 bg-gray-50 rounded-xl mb-4 p-4 flex items-center justify-center relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                </Link>

                {/* Thông tin */}
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{product.brand}</span>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold text-gray-800 line-clamp-2 hover:text-purple-600 transition-colors h-10">{product.name}</h3>
                  </Link>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-lg font-black text-red-600 drop-shadow-sm">
                      {formatPrice(product.price)}
                    </span>
                    
                    {/* Nút thêm giỏ hàng */}
                    {product.countInStock > 0 ? (
                      <button 
                        onClick={() => addToCart(product, 1)}
                        className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                        title="Thêm vào giỏ"
                      >
                        <FaShoppingCart size={16} />
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-md">HẾT HÀNG</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;