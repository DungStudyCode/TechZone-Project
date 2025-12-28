// client/src/pages/Product/Products.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Hook để lấy từ khóa từ URL
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Lấy từ khóa tìm kiếm từ URL (ví dụ: ?keyword=samsung -> searchTerm = "samsung")
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('keyword') || '';

  // 1. TẢI TẤT CẢ SẢN PHẨM (Chỉ tải 1 lần khi vào trang)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products'); // Luôn lấy tất cả về
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. LOGIC LỌC SẢN PHẨM (Xử lý ngay tại trình duyệt)
  const filteredProducts = products.filter((product) => {
    // Điều kiện 1: Phải khớp Danh mục (nếu đang chọn danh mục cụ thể)
    // Lưu ý: So sánh chữ thường (toLowerCase) để chính xác hơn
    const matchCategory = 
        activeCategory === 'All' || 
        (product.category && product.category.toLowerCase() === activeCategory.toLowerCase());

    // Điều kiện 2: Phải khớp Từ khóa tìm kiếm (nếu có)
    const matchSearch = 
        searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Sản phẩm phải thỏa mãn CẢ 2 điều kiện
    return matchCategory && matchSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      
      {/* Header & Bộ lọc */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-100 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">
                {searchTerm ? `Tìm kiếm: "${searchTerm}"` : 'Cửa hàng'}
            </h1>
            <p className="text-gray-500 mt-2">
                Hiển thị {filteredProducts.length} sản phẩm
            </p>
        </div>

        {/* Các nút lọc danh mục */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {['All', 'Điện thoại', 'Laptop', 'Phụ kiện'].map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full border text-sm font-bold whitespace-nowrap transition-all
                        ${activeCategory === cat 
                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg transform scale-105' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-purple-600 hover:text-purple-600'}`}
                >
                    {cat === 'All' ? 'Tất cả' : cat}
                </button>
            ))}
        </div>
      </div>

      {/* Grid Sản phẩm */}
      {loading ? (
        <div className="flex justify-center py-32">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
      )}
      
      {/* Thông báo nếu không tìm thấy */}
      {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" 
                alt="Not found" 
                className="w-24 h-24 mx-auto opacity-20 mb-4"
              />
              <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
              <button 
                onClick={() => { setActiveCategory('All'); window.location.href='/products'; }}
                className="mt-4 text-purple-600 font-bold hover:underline"
              >
                Xóa bộ lọc
              </button>
          </div>
      )}
    </div>
  );
};

export default Products;