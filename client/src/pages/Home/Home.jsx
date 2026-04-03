// client/src/pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { FaTruck, FaHeadset, FaUndo, FaShieldAlt, FaArrowRight, FaLaptop, FaMobileAlt, FaHeadphones, FaTabletAlt, FaCamera, FaClock } from 'react-icons/fa';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams] = useSearchParams(); 
  const keyword = searchParams.get('keyword'); 

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = keyword ? `/products?keyword=${keyword}` : '/products';
        const { data } = await api.get(url);
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]);

  // --- HÀM MỚI: ĐẾM SỐ LƯỢNG SẢN PHẨM THỰC TẾ THEO DANH MỤC ---
  const getCategoryCount = (categoryName) => {
    if (!products || products.length === 0) return 0;
    // Lọc và đếm những sản phẩm có category trùng khớp
    return products.filter(product => product.category === categoryName).length;
  };

  return (
    <div className="font-sans">
      
      {/* 1. HERO BANNER */}
      {!keyword && (
        <div className="relative bg-gray-900 text-white h-[500px] flex items-center">
            <div className="absolute inset-0 overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop" 
                    alt="Hero Banner" 
                    className="w-full h-full object-cover opacity-40"
                />
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-2xl animate-fade-in-up">
                    <span className="text-purple-400 font-bold tracking-wider uppercase mb-2 block">Công nghệ tương lai</span>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Nâng Tầm Trải Nghiệm <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Kỹ Thuật Số</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-8">
                        Khám phá các dòng sản phẩm công nghệ đỉnh cao với mức giá ưu đãi nhất thị trường.
                    </p>
                    <div className="flex gap-4">
                        <a href="#products" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold transition transform hover:scale-105 shadow-lg flex items-center gap-2">
                            Mua Ngay <FaArrowRight />
                        </a>
                        <Link to="/about" className="bg-transparent border border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-full font-bold transition">
                            Tìm Hiểu Thêm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 2. DỊCH VỤ CAM KẾT */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600"><FaTruck size={24}/></div>
                <div>
                    <h4 className="font-bold text-gray-800">Miễn phí vận chuyển</h4>
                    <p className="text-xs text-gray-500">Cho đơn hàng trên 50tr</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600"><FaUndo size={24}/></div>
                <div>
                    <h4 className="font-bold text-gray-800">Hoàn tiền 100%</h4>
                    <p className="text-xs text-gray-500">Trong 30 ngày đầu tiên</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><FaShieldAlt size={24}/></div>
                <div>
                    <h4 className="font-bold text-gray-800">Bảo hành chính hãng</h4>
                    <p className="text-xs text-gray-500">Cam kết 100% Authentic</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full text-red-600"><FaHeadset size={24}/></div>
                <div>
                    <h4 className="font-bold text-gray-800">Hỗ trợ 24/7</h4>
                    <p className="text-xs text-gray-500">Hotline: 1900 1000</p>
                </div>
            </div>
        </div>
      </div>

      {/* 3. DANH MỤC NỔI BẬT */}
      {!keyword && (
        <section className="py-16 bg-gray-50 mt-8">
          <div className="container mx-auto px-4 max-w-6xl">
            
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-wider">Danh Mục Sản Phẩm</h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-3 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <Link to="/products?category=Điện thoại" className="group block">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4 bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner">
                    <FaMobileAlt />
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Điện thoại</h3>
                  <p className="text-xs text-gray-400 mt-1">{getCategoryCount('Điện thoại')} sản phẩm</p>
                </div>
              </Link>

              <Link to="/products?category=Laptop" className="group block">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm hover:shadow-xl hover:border-purple-200 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4 bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors shadow-inner">
                    <FaLaptop />
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Laptop</h3>
                  <p className="text-xs text-gray-400 mt-1">{getCategoryCount('Laptop')} sản phẩm</p>
                </div>
              </Link>

              <Link to="/products?category=Tablet" className="group block">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm hover:shadow-xl hover:border-green-200 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4 bg-green-50 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors shadow-inner">
                    <FaTabletAlt />
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">Tablet</h3>
                  <p className="text-xs text-gray-400 mt-1">{getCategoryCount('Tablet')} sản phẩm</p>
                </div>
              </Link>

              <Link to="/products?category=Phụ kiện" className="group block">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4 bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-inner">
                    <FaHeadphones />
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Âm thanh</h3>
                  <p className="text-xs text-gray-400 mt-1">{getCategoryCount('Phụ kiện')} sản phẩm</p>
                </div>
              </Link>

              <Link to="/products?category=Smartwatch" className="group block">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm hover:shadow-xl hover:border-pink-200 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4 bg-pink-50 text-pink-600 group-hover:bg-pink-500 group-hover:text-white transition-colors shadow-inner">
                    <FaClock />
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">Smartwatch</h3>
                  <p className="text-xs text-gray-400 mt-1">{getCategoryCount('Smartwatch')} sản phẩm</p>
                </div>
              </Link>

              <Link to="/products?category=Camera" className="group block">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm hover:shadow-xl hover:border-teal-200 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4 bg-teal-50 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors shadow-inner">
                    <FaCamera />
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">Camera</h3>
                  <p className="text-xs text-gray-400 mt-1">{getCategoryCount('Camera')} sản phẩm</p>
                </div>
              </Link>

            </div>
          </div>
        </section>
      )}

      {/* 4. DANH SÁCH SẢN PHẨM */}
      <div id="products" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">
                    {keyword ? `Kết quả tìm kiếm: "${keyword}"` : "SẢN PHẨM NỔI BẬT"}
                </h2>
                <div className="w-24 h-1 bg-purple-600 mx-auto rounded-full mt-3"></div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <>
                    {!loading && products.length === 0 && (
                        <div className="text-center text-gray-500 text-lg py-10">
                            Không tìm thấy sản phẩm nào phù hợp.
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* 5. BANNER KHUYẾN MÃI */}
      {!keyword && (
          <div className="container mx-auto px-4 py-16">
            <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-2xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">BLACK FRIDAY - SIÊU SALE ĐỔ BỘ</h2>
                    <p className="text-lg text-purple-200 mb-8 max-w-2xl mx-auto">
                        Giảm giá lên đến 50% cho các sản phẩm Apple, Samsung và Laptop Gaming. Số lượng có hạn, đừng bỏ lỡ!
                    </p>
                    <Link to="/products" className="bg-white text-purple-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg inline-block">
                        Xem Tất Cả Ưu Đãi
                    </Link>
                </div>
            </div>
          </div>
      )}

      {/* 6. NEWSLETTER */}
      <div className="bg-purple-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Đăng ký nhận tin mới nhất</h2>
            <p className="mb-8 opacity-80">Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt sớm nhất.</p>
            <div className="max-w-lg mx-auto flex gap-2">
                <input 
                    type="email" 
                    placeholder="Nhập địa chỉ email của bạn..." 
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg font-bold transition">
                    Đăng Ký
                </button>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Home;