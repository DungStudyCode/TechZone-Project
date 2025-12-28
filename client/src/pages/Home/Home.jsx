// client/src/pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { FaTruck, FaHeadset, FaUndo, FaShieldAlt, FaArrowRight, FaLaptop, FaMobileAlt, FaHeadphones } from 'react-icons/fa';

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

  return (
    <div className="font-sans">
      
      {/* 1. HERO BANNER (Phần mở đầu hoành tráng) */}
      {!keyword && (
        <div className="relative bg-gray-900 text-white h-[500px] flex items-center">
            {/* Ảnh nền */}
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

      {/* 2. DỊCH VỤ CAM KẾT (Tạo độ uy tín) */}
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

      {/* 3. DANH MỤC NỔI BẬT (Giúp khách tìm nhanh) */}
      {!keyword && (
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center uppercase">Danh mục sản phẩm</h2>
            <div className="flex justify-center gap-8 flex-wrap">
                <div className="group cursor-pointer">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                        <FaMobileAlt size={32} />
                    </div>
                    <p className="text-center mt-3 font-medium text-gray-700 group-hover:text-purple-600">Điện thoại</p>
                </div>
                <div className="group cursor-pointer">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                        <FaLaptop size={32} />
                    </div>
                    <p className="text-center mt-3 font-medium text-gray-700 group-hover:text-purple-600">Laptop</p>
                </div>
                <div className="group cursor-pointer">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                        <FaHeadphones size={32} />
                    </div>
                    <p className="text-center mt-3 font-medium text-gray-700 group-hover:text-purple-600">Phụ kiện</p>
                </div>
            </div>
          </div>
      )}

      {/* 4. DANH SÁCH SẢN PHẨM (Phần chính) */}
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

      {/* 5. BANNER KHUYẾN MÃI (Quảng cáo giữa trang) */}
      {!keyword && (
          <div className="container mx-auto px-4 py-16">
            <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-2xl p-12 text-center text-white relative overflow-hidden">
                {/* Họa tiết trang trí */}
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

      {/* 6. NEWSLETTER (Đăng ký nhận tin) */}
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