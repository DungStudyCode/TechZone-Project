// client/src/pages/Product/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaShoppingCart, FaCheck, FaTimes, FaMobileAlt, FaMicrochip, 
  FaMemory, FaBatteryFull, FaStar, FaUserCircle, FaInfoCircle, 
  FaHeart, FaChevronRight, FaBolt, FaShieldAlt, FaVideo 
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState(""); 
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [refresh, setRefresh] = useState(0);

  // ✅ HÀM MỚI: Bóc tách ID YouTube và tạo link nhúng an toàn
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('/embed/')) return url;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  // ==========================================
  // 1. TẢI DỮ LIỆU SẢN PHẨM & GỢI Ý
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 

        const { data: productData } = await api.get(`/products/${slug}`); 
        setProduct(productData);
        setMainImage(productData.image);

        if (productData && productData._id) {
          try {
            const { data: relatedData } = await api.get(`/products/${productData._id}/related`);
            setRelatedProducts(relatedData);
          } catch (err) {
            console.log("Không lấy được sản phẩm gợi ý");
            console.error(err);
          }
        }
        
        setLoading(false);
      } catch (error) {
        toast.error("Không thể tải thông tin sản phẩm!");
        setLoading(false);
        console.error(error);
      }
    };
    loadData();
  }, [slug, refresh]); 

  // ==========================================
  // 2. XỬ LÝ CÁC NÚT BẤM
  // ==========================================
  const handleAddToCart = () => {
    if (product.countInStock > 0) {
      const finalPrice = product.price - (product.price * (product.discount || 0) / 100);
      const productToCart = { ...product, price: finalPrice };
      
      addToCart(productToCart, qty);
      toast.success("Đã thêm vào giỏ hàng!");
    }
  };

  const handleBuyNow = () => {
    if (product.countInStock > 0) {
      const finalPrice = product.price - (product.price * (product.discount || 0) / 100);
      const productToCart = { ...product, price: finalPrice };
      
      addToCart(productToCart, qty);
      navigate('/cart');
    }
  };

  const toggleWishlistHandler = async () => {
    if (!user) return toast.warn("Vui lòng đăng nhập để lưu vào yêu thích!");
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.post('/users/wishlist', { productId: product._id }, config); 
      toast.success("Đã cập nhật danh sách yêu thích! ❤️");
    } catch (error) {
      toast.error("Lỗi khi thêm vào yêu thích.");
      console.error(error);
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` } };
      await api.post(`/products/${product._id}/reviews`, { rating, comment }, config);
      toast.success("Cảm ơn bạn đã gửi đánh giá!");
      setComment(""); setRating(5); setRefresh(prev => prev + 1); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
    }
  };

  // ==========================================
  // 3. HÀM XỬ LÝ THÔNG SỐ KỸ THUẬT
  // ==========================================
  const getSpecValue = (keyToFind) => {
    if (!product || !product.specs) return 'Đang cập nhật';
    if (Array.isArray(product.specs)) {
      const foundSpec = product.specs.find(s => s.keyName && s.keyName.toLowerCase().includes(keyToFind.toLowerCase()));
      return foundSpec && foundSpec.value ? foundSpec.value : 'Đang cập nhật';
    }
    const oldKeys = { 'màn hình': 'screen', 'chip': 'chip', 'ram': 'ram', 'pin': 'battery' };
    const matchingKey = Object.keys(oldKeys).find(k => keyToFind.toLowerCase().includes(k));
    return matchingKey ? (product.specs[oldKeys[matchingKey]] || 'Đang cập nhật') : 'Đang cập nhật';
  };

  // ==========================================
  // 4. RENDER GIAO DIỆN
  // ==========================================
  if (loading) return <div className="flex justify-center items-center py-40 min-h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div></div>;
  if (!product) return <div className="text-center py-20 text-xl text-gray-500 font-bold min-h-screen flex items-center justify-center">Sản phẩm không tồn tại hoặc đã bị xóa.</div>;

  const galleryImages = product.images?.length > 0 ? product.images : [product.image];

  const originalPrice = product.price;
  const discountPercent = product.discount || 0;
  const finalPrice = originalPrice - (originalPrice * discountPercent / 100);

  return (
    <div className="container mx-auto px-4 py-8 font-sans bg-[#f8f9fc] min-h-screen">
      
      {/* BREADCRUMB */}
      <nav className="flex text-sm text-gray-500 mb-6 font-medium animate-[fadeIn_0.5s_ease-out]">
        <Link to="/" className="hover:text-purple-600 transition-colors">Trang chủ</Link>
        <FaChevronRight className="mx-2 text-xs mt-1 text-gray-400" />
        <Link to="/products" className="hover:text-purple-600 transition-colors">Sản phẩm</Link>
        <FaChevronRight className="mx-2 text-xs mt-1 text-gray-400" />
        <span className="text-purple-600 font-bold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      {/* KHỐI 1: THÔNG TIN SẢN PHẨM */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-12 border border-gray-100 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="md:flex">
          
          {/* CỘT TRÁI: GALLERY ẢNH */}
          <div className="md:w-1/2 p-8 lg:p-12 bg-white flex flex-col items-center justify-center border-r border-gray-100 relative group">
            {product.countInStock === 0 && (
              <div className="absolute top-4 left-4 z-10 bg-gray-800 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                Hết hàng
              </div>
            )}
            
            <div className="w-full h-[400px] flex items-center justify-center mb-8 relative overflow-hidden">
              <img src={mainImage} alt={product.name} className="max-h-full object-contain mix-blend-multiply transform transition-transform duration-500 group-hover:scale-105" />
            </div>

            <div className="flex gap-4 justify-center w-full px-4 overflow-x-auto custom-scrollbar pb-2">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} onClick={() => setMainImage(img)}
                  className={`w-20 h-20 rounded-xl border-2 p-2 cursor-pointer transition-all duration-300 flex-shrink-0 ${mainImage === img ? 'border-purple-600 shadow-md scale-105' : 'border-gray-100 hover:border-purple-300'}`}
                >
                  <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT & MUA HÀNG */}
          <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-purple-100">
                {product.brand}
              </span>
              <span className="flex items-center text-yellow-500 text-sm font-bold bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <FaStar className="mr-1 mb-0.5" /> {product.rating?.toFixed(1) || 0} ({product.numReviews || 0} đánh giá)
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-end gap-4 mb-6 flex-wrap">
              <div className="text-4xl font-black text-red-600 tracking-tight">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
              </div>
              
              {discountPercent > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-lg text-gray-400 line-through font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                  </div>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-md">
                    -{discountPercent}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <div className={`flex items-center px-4 py-2 rounded-xl font-bold border ${product.countInStock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {product.countInStock > 0 ? <><FaCheck className="mr-2 text-lg" /> Còn {product.countInStock} sản phẩm</> : <><FaTimes className="mr-2 text-lg" /> Tạm hết hàng</>}
              </div>
              <div className="flex items-center px-4 py-2 rounded-xl font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <FaShieldAlt className="mr-2 text-lg" /> Bảo hành 12 tháng
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-inner">
               <h3 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                 <FaInfoCircle className="text-purple-500 text-base"/> Cấu hình tóm tắt
               </h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="flex items-center text-sm"><FaMobileAlt className="text-gray-400 w-6" /><span className="text-gray-600 font-medium">{getSpecValue('màn hình')}</span></div>
                  <div className="flex items-center text-sm"><FaMicrochip className="text-gray-400 w-6" /><span className="text-gray-600 font-medium">{getSpecValue('chip')}</span></div>
                  <div className="flex items-center text-sm"><FaMemory className="text-gray-400 w-6" /><span className="text-gray-600 font-medium">{getSpecValue('ram')}</span></div>
                  <div className="flex items-center text-sm"><FaBatteryFull className="text-gray-400 w-6" /><span className="text-gray-600 font-medium">{getSpecValue('pin')}</span></div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4 mt-auto">
              <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl w-full sm:w-32 h-14 bg-white shrink-0">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-full text-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-l-xl transition-colors font-medium">-</button>
                <span className="font-black text-lg text-gray-800">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.countInStock, q + 1))} className="w-10 h-full text-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-r-xl transition-colors font-medium">+</button>
              </div>
              
              <button onClick={handleAddToCart} disabled={product.countInStock === 0} className="flex-1 h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 disabled:border-gray-200 disabled:text-gray-400">
                <FaShoppingCart size={18} /> THÊM VÀO GIỎ
              </button>

              <button onClick={handleBuyNow} disabled={product.countInStock === 0} className="flex-1 h-14 rounded-xl font-black flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-red-500/40 hover:-translate-y-1 disabled:from-gray-300 disabled:to-gray-300">
                <FaBolt size={18} /> MUA NGAY
              </button>

              <button onClick={toggleWishlistHandler} className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl transition-all duration-300 bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white shadow-sm border border-pink-100 hover:shadow-pink-200 hover:-translate-y-1">
                <FaHeart size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 2: ĐẶC ĐIỂM NỔI BẬT & CẤU HÌNH CHI TIẾT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
           <h3 className="text-2xl font-black mb-8 text-gray-900 flex items-center gap-3">Đặc điểm nổi bật</h3>
           
           <div 
             className="text-gray-600 leading-relaxed text-base md:text-lg prose prose-purple max-w-none overflow-hidden break-words prose-img:rounded-xl prose-img:max-w-full"
             dangerouslySetInnerHTML={{ __html: product.description || 'Đang cập nhật thông tin.' }}
           />

           {/* ✅ THÊM MỚI: HIỂN THỊ VIDEO YOUTUBE NẾU CÓ VÀ HỢP LỆ */}
           {product.video && getYouTubeEmbedUrl(product.video) && (
             <div className="mt-10 border-t border-gray-100 pt-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaVideo className="text-red-500" /> Video Review
                </h4>
                <div className="aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 relative">
                  <iframe 
                    src={getYouTubeEmbedUrl(product.video)} 
                    title="Video Review" 
                    className="absolute top-0 left-0 w-full h-full" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
             </div>
           )}
        </div>

        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit sticky top-6">
          <h3 className="text-xl font-black mb-6 text-gray-900">Cấu hình chi tiết</h3>
          
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <tbody>
                {Array.isArray(product.specs) && product.specs.length > 0 ? product.specs.map((spec, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0 even:bg-gray-50 hover:bg-purple-50 transition-colors">
                    <th className="py-3 px-4 text-gray-500 font-medium w-1/3 bg-gray-50/50 align-top">{spec.keyName}</th>
                    <td className="py-3 px-4 text-gray-900 font-bold w-2/3 break-words leading-relaxed">{spec.value || 'Đang cập nhật'}</td>
                  </tr>
                )) : (
                   <tr><td className="py-4 text-center text-gray-500">Chưa có thông tin cấu hình chi tiết</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KHỐI 3: REVIEW VÀ FORM ĐÁNH GIÁ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 animate-[fadeIn_0.8s_ease-out]">
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-2xl font-black mb-6 text-gray-900">Đánh giá từ khách hàng</h3>
          {(!product.reviews || product.reviews.length === 0) && (
            <div className="bg-purple-50 text-purple-600 p-5 rounded-2xl text-sm font-medium border border-purple-100 flex items-center gap-3">
              <FaInfoCircle size={20} /> Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
            </div>
          )}
          <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {product.reviews && product.reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-50 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold uppercase text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{review.name}</p>
                      <div className="flex text-yellow-400 text-xs mt-1 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{review.createdAt?.substring(0, 10)}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mt-3 bg-gray-50 p-4 rounded-2xl">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit">
          <h3 className="text-2xl font-black mb-6 text-gray-900">Viết đánh giá của bạn</h3>
          {user ? (
            <form onSubmit={submitReviewHandler} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Chất lượng sản phẩm</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full lg:w-1/2 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium text-gray-700 appearance-none cursor-pointer">
                  <option value="5">⭐⭐⭐⭐⭐ - Tuyệt vời</option>
                  <option value="4">⭐⭐⭐⭐ - Rất tốt</option>
                  <option value="3">⭐⭐⭐ - Khá tốt</option>
                  <option value="2">⭐⭐ - Trung bình</option>
                  <option value="1">⭐ - Kém</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Trải nghiệm của bạn</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows="4" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium text-gray-700 resize-none" placeholder="Sản phẩm dùng thế nào? Pin có trâu không?..."></textarea>
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1">GỬI ĐÁNH GIÁ</button>
            </form>
          ) : (
            <div className="bg-purple-50 p-8 rounded-3xl text-center border border-purple-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-purple-300"><FaUserCircle size={32} /></div>
              <p className="text-gray-600 mb-6 font-medium text-sm leading-relaxed">Vui lòng đăng nhập để chia sẻ cảm nhận.</p>
              <Link to={`/login?redirect=/product/${slug}`} className="inline-block bg-purple-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:bg-purple-700 transition-colors">Đăng nhập ngay</Link>
            </div>
          )}
        </div>
      </div>

      {/* KHỐI 4: SẢN PHẨM GỢI Ý */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 mb-8 animate-[fadeIn_1s_ease-out]">
          <div className="flex items-center justify-between mb-8 pb-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sản phẩm tương tự</h2>
            <Link to="/products" className="text-purple-600 font-bold hover:text-purple-800 text-sm flex items-center gap-1 hover:underline underline-offset-4">Xem tất cả <FaChevronRight className="text-xs"/></Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((item, index) => {
              const itemDiscount = item.discount || 0;
              const itemFinalPrice = item.price - (item.price * itemDiscount / 100);

              return (
                <Link to={`/product/${item.slug}`} key={item._id} className="bg-white rounded-3xl p-5 border border-gray-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative aspect-square mb-5 bg-[#f8f9fc] rounded-2xl overflow-hidden flex items-center justify-center p-4">
                    <img src={item.image} alt={item.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
                    {itemDiscount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">-{itemDiscount}%</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">{item.brand}</p>
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-relaxed group-hover:text-purple-600 transition-colors">{item.name}</h4>
                    </div>
                    <div className="mt-4 flex flex-col justify-end">
                      <span className="font-black text-red-600 text-lg tracking-tight">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemFinalPrice)}
                      </span>
                      {itemDiscount > 0 && (
                        <span className="text-xs text-gray-400 line-through mt-0.5">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;