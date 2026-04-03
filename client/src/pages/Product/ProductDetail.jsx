// client/src/pages/Product/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext'; // ✅ ĐÃ THÊM IMPORT AuthContext
import { FaShoppingCart, FaCheck, FaTimes, FaMobileAlt, FaMicrochip, FaMemory, FaBatteryFull, FaStar, FaUserCircle, FaInfoCircle, FaHeart } from 'react-icons/fa'; // ✅ ĐÃ THÊM FaHeart

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth(); // ✅ LẤY THÔNG TIN USER TỪ CONTEXT

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [userInfo] = useState(() => {
    const storedUser = localStorage.getItem("userInfo");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [refresh, setRefresh] = useState(0);

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
  }, [slug, refresh]); 

  const handleAddToCart = () => {
    if (product.countInStock > 0) {
      addToCart(product, qty);
      alert("Đã thêm vào giỏ hàng!");
    }
  };

  // ✅ HÀM XỬ LÝ KHI BẤM NÚT THẢ TIM
  const toggleWishlistHandler = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.post('/users/wishlist', { productId: product._id }, config); 
      alert("Đã cập nhật danh sách yêu thích thành công! ❤️");
    } catch (error) {
      console.error("Lỗi khi thả tim:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}` } };
      await api.post(`/products/${product._id}/reviews`, { rating, comment }, config);
      alert("Đánh giá thành công!");
      setComment(""); setRating(5); setRefresh(prev => prev + 1); 
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi gửi đánh giá");
    }
  };

  const getSpecValue = (keyToFind) => {
    if (!product || !product.specs) return 'Đang cập nhật';
    
    if (Array.isArray(product.specs)) {
      const foundSpec = product.specs.find(s => 
        s.keyName && s.keyName.toLowerCase().trim() === keyToFind.toLowerCase().trim()
      );
      return foundSpec && foundSpec.value ? foundSpec.value : 'Đang cập nhật';
    }
    
    const oldKeys = { 'Màn hình': 'screen', 'Chipset': 'chip', 'RAM': 'ram', 'Pin': 'battery' };
    return product.specs[oldKeys[keyToFind]] || 'Đang cập nhật';
  };

  if (loading) return <div className="flex justify-center items-center py-40"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Không tìm thấy sản phẩm</div>;

  return (
    <div className="container mx-auto px-4 py-8 font-sans">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
        <div className="md:flex">
          
          <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center border-r border-gray-100">
            <img src={product.image} alt={product.name} className="max-h-[500px] object-contain mix-blend-multiply hover:scale-105 transition duration-500" />
          </div>

          <div className="md:w-1/2 p-8 lg:p-12">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {product.brand}
            </span>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mt-4 mb-2 leading-tight">{product.name}</h1>
            
            <div className="flex items-center mb-6 text-yellow-500 text-sm">
                <span className="font-bold mr-2 text-base">{product.rating?.toFixed(1) || 0}</span>
                <FaStar />
                <span className="text-gray-400 ml-2 font-medium">({product.numReviews} đánh giá)</span>
            </div>

            <div className="text-4xl font-black text-red-600 mb-6 drop-shadow-sm">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </div>

            <div className="mb-8">
              {product.countInStock > 0 ? (
                <span className="flex items-center text-green-700 font-bold bg-green-50 border border-green-200 w-fit px-4 py-1.5 rounded-lg shadow-sm">
                  <FaCheck className="mr-2" /> Còn hàng
                </span>
              ) : (
                <span className="flex items-center text-red-600 font-bold bg-red-50 border border-red-200 w-fit px-4 py-1.5 rounded-lg shadow-sm">
                  <FaTimes className="mr-2" /> Tạm hết hàng
                </span>
              )}
            </div>

            {product.specs && (
               <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500"/> Thông số kỹ thuật
                  </h3>
                  <div className="grid grid-cols-1 gap-3.5">
                     <div className="flex items-start">
                        <FaMobileAlt className="text-gray-400 w-6 mt-0.5" />
                        <span className="text-sm text-gray-500 w-24 ml-2 flex-shrink-0">Màn hình:</span>
                        <span className="font-medium text-gray-800">{getSpecValue('Màn hình')}</span>
                     </div>
                     <div className="flex items-start">
                        <FaMicrochip className="text-gray-400 w-6 mt-0.5" />
                        <span className="text-sm text-gray-500 w-24 ml-2 flex-shrink-0">Chipset:</span>
                        <span className="font-medium text-gray-800">{getSpecValue('Chipset')}</span>
                     </div>
                     <div className="flex items-start">
                        <FaMemory className="text-gray-400 w-6 mt-0.5" />
                        <span className="text-sm text-gray-500 w-24 ml-2 flex-shrink-0">RAM:</span>
                        <span className="font-medium text-gray-800">{getSpecValue('RAM')}</span>
                     </div>
                     <div className="flex items-start">
                        <FaBatteryFull className="text-gray-400 w-6 mt-0.5" />
                        <span className="text-sm text-gray-500 w-24 ml-2 flex-shrink-0">Pin:</span>
                        <span className="font-medium text-gray-800">{getSpecValue('Pin')}</span>
                     </div>
                  </div>
               </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
              <div className="flex items-center border-2 border-gray-200 rounded-xl w-full sm:w-auto h-14 bg-white">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-5 text-xl text-gray-500 hover:text-black hover:bg-gray-50 h-full rounded-l-xl transition" disabled={product.countInStock === 0}>-</button>
                <span className="px-6 font-bold text-lg">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.countInStock, q + 1))} className="px-5 text-xl text-gray-500 hover:text-black hover:bg-gray-50 h-full rounded-r-xl transition" disabled={product.countInStock === 0}>+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className={`flex-1 w-full h-14 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 text-lg
                  ${product.countInStock > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl text-white transform hover:-translate-y-1' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <FaShoppingCart size={20} />
                {product.countInStock > 0 ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}
              </button>

              {/* ✅ NÚT THẢ TIM (YÊU THÍCH) MỚI THÊM VÀO */}
              <button 
                onClick={toggleWishlistHandler}
                className="flex shrink-0 items-center justify-center w-14 h-14 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm border border-red-100 hover:shadow-red-200 hover:-translate-y-1"
                title="Yêu thích"
              >
                <FaHeart size={24} />
              </button>
            </div>
          </div>
        </div>
        
        {Array.isArray(product.specs) && product.specs.length > 0 && (
          <div className="p-8 lg:p-12 border-t border-gray-100 bg-gray-50">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Cấu hình chi tiết</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left text-gray-600">
                <tbody className="divide-y divide-gray-100">
                  {product.specs.map((spec, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-800 bg-gray-50 w-1/3 align-top border-r border-gray-100">
                        {spec.keyName}
                      </td>
                      <td className="py-4 px-6 align-top whitespace-pre-line text-gray-700">
                        {spec.value || 'Đang cập nhật'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="p-8 lg:p-12 border-t border-gray-100">
           <h3 className="text-2xl font-bold mb-6 text-gray-800">Đặc điểm nổi bật</h3>
           <p className="text-gray-600 leading-loose whitespace-pre-line text-lg">{product.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá từ khách hàng</h2>
          
          {product.reviews && product.reviews.length === 0 && (
             <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                <span className="text-4xl block mb-3">📝</span>
                Chưa có đánh giá nào. Hãy là người đầu tiên!
             </div>
          )}

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            {product.reviews && product.reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl shadow-inner">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-gray-800 block text-lg">{review.name}</strong>
                    <div className="flex text-yellow-400 text-sm mt-1">
                       {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"} />
                       ))}
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-gray-400 font-medium">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <p className="text-gray-600 text-base ml-16 bg-gray-50 p-4 rounded-xl rounded-tl-sm border border-gray-100">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit sticky top-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Viết đánh giá của bạn</h2>
          
          {userInfo ? (
            <form onSubmit={submitReviewHandler} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Chất lượng sản phẩm</label>
                <div className="flex items-center gap-2 mb-2 bg-gray-50 w-fit p-3 rounded-xl border border-gray-100">
                   {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        className={`text-3xl transition-all duration-200 hover:scale-110 ${star <= rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200 hover:text-yellow-200'}`}
                      >
                        <FaStar />
                      </button>
                   ))}
                   <span className="ml-3 font-bold text-gray-700 bg-white px-3 py-1 rounded shadow-sm text-sm">{rating} Sao</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Trải nghiệm của bạn</label>
                <textarea
                  rows="5"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Sản phẩm dùng thế nào? Cầm có sướng tay không? Pin trâu không?..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white focus:bg-white text-gray-700"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#724ae8] text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition duration-300 shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 text-lg"
              >
                GỬI ĐÁNH GIÁ
              </button>
            </form>
          ) : (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-10 text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FaUserCircle className="text-5xl text-blue-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Chưa đăng nhập!</h4>
              <p className="text-gray-500 mb-6">Vui lòng đăng nhập để chia sẻ trải nghiệm của bạn về sản phẩm này nhé.</p>
              <Link 
                to="/login" 
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
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