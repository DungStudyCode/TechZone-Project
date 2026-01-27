// client/src/pages/Product/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { FaShoppingCart, FaCheck, FaTimes, FaMobileAlt, FaMicrochip, FaMemory, FaBatteryFull, FaStar, FaUserCircle } from 'react-icons/fa';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  // State cho Review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // ✅ SỬA 1: Khởi tạo state userInfo trực tiếp từ localStorage (Lazy Initialization)
  // Cách này giúp lấy dữ liệu ngay lần render đầu tiên và tránh lỗi set state trong useEffect
  const [userInfo] = useState(() => {
    const storedUser = localStorage.getItem("userInfo");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [refresh, setRefresh] = useState(0);

  // 1. useEffect chịu trách nhiệm tải dữ liệu sản phẩm
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`); 
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setLoading(false);
      }
    };

    loadData();
    
    // ✅ SỬA 2: Đã xóa phần setUserInfo(user) ở đây vì đã xử lý ở useState bên trên rồi.
    
  }, [slug, refresh]); 

  const handleAddToCart = () => {
    if (product.countInStock > 0) {
      addToCart(product, qty);
      alert("Đã thêm vào giỏ hàng!");
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await api.post(
        `/products/${product._id}/reviews`,
        { rating, comment },
        config
      );

      alert("Đánh giá thành công!");
      setComment("");
      setRating(5);
      
      setRefresh(prev => prev + 1); 
      
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi gửi đánh giá");
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... Phần UI giữ nguyên không thay đổi ... */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          {/* Cột Trái: Ảnh */}
          <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="max-h-[400px] object-contain mix-blend-multiply" />
          </div>

          {/* Cột Phải: Thông tin */}
          <div className="md:w-1/2 p-8">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {product.brand}
            </span>
            
            <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4 text-yellow-500 text-sm">
                <span className="font-bold mr-2">{product.rating?.toFixed(1) || 0}</span>
                <FaStar />
                <span className="text-gray-400 ml-2">({product.numReviews} đánh giá)</span>
            </div>

            <div className="text-3xl font-extrabold text-red-600 mb-6">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </div>

            <div className="mb-6">
              {product.countInStock > 0 ? (
                <span className="flex items-center text-green-600 font-bold bg-green-50 w-fit px-3 py-1 rounded">
                  <FaCheck className="mr-2" /> Còn hàng
                </span>
              ) : (
                <span className="flex items-center text-red-600 font-bold bg-red-50 w-fit px-3 py-1 rounded">
                  <FaTimes className="mr-2" /> Tạm hết hàng
                </span>
              )}
            </div>

            {product.specs && (
               <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase">Thông số kỹ thuật</h3>
                  <div className="grid grid-cols-1 gap-3">
                     <div className="flex items-center">
                        <FaMobileAlt className="text-gray-400 w-6" />
                        <span className="text-sm text-gray-500 w-24 ml-2">Màn hình:</span>
                        <span className="font-medium text-gray-800">{product.specs.screen || 'Đang cập nhật'}</span>
                     </div>
                     <div className="flex items-center">
                        <FaMicrochip className="text-gray-400 w-6" />
                        <span className="text-sm text-gray-500 w-24 ml-2">Chipset:</span>
                        <span className="font-medium text-gray-800">{product.specs.chip || 'Đang cập nhật'}</span>
                     </div>
                     <div className="flex items-center">
                        <FaMemory className="text-gray-400 w-6" />
                        <span className="text-sm text-gray-500 w-24 ml-2">RAM:</span>
                        <span className="font-medium text-gray-800">{product.specs.ram || 'Đang cập nhật'}</span>
                     </div>
                     <div className="flex items-center">
                        <FaBatteryFull className="text-gray-400 w-6" />
                        <span className="text-sm text-gray-500 w-24 ml-2">Pin:</span>
                        <span className="font-medium text-gray-800">{product.specs.battery || 'Đang cập nhật'}</span>
                     </div>
                  </div>
               </div>
            )}

            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100" disabled={product.countInStock === 0}>-</button>
                <span className="px-4 font-bold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.countInStock, q + 1))} className="px-3 py-2 hover:bg-gray-100" disabled={product.countInStock === 0}>+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                  ${product.countInStock > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <FaShoppingCart />
                {product.countInStock > 0 ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-8 border-t border-gray-100">
           <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
           <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá từ khách hàng</h2>
          
          {product.reviews && product.reviews.length === 0 && (
             <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                Chưa có đánh giá nào. Hãy là người đầu tiên!
             </div>
          )}

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {product.reviews && product.reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-gray-800 block">{review.name}</strong>
                    <div className="flex text-yellow-400 text-xs">
                       {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                       ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <p className="text-gray-600 text-sm ml-12 bg-gray-50 p-3 rounded-lg rounded-tl-none">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Viết đánh giá của bạn</h2>
          
          {userInfo ? (
            <form onSubmit={submitReviewHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá của bạn</label>
                <div className="flex items-center gap-2 mb-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <FaStar />
                      </button>
                   ))}
                   <span className="ml-2 font-bold text-gray-700">{rating} Sao</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá</label>
                <textarea
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Sản phẩm dùng thế nào? Hãy chia sẻ cảm nhận..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#724ae8] text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
              >
                Gửi Đánh Giá
              </button>
            </form>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
              <FaUserCircle className="mx-auto text-4xl text-blue-300 mb-3" />
              <p className="text-blue-800 font-medium mb-3">Vui lòng đăng nhập để viết đánh giá</p>
              <Link 
                to="/login" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;