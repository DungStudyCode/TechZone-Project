// client/src/pages/Product/Products.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

const BRANDS_BY_CATEGORY = {
  'Điện thoại': ['Apple', 'Samsung', 'Xiaomi', 'OPPO'], 
  'Laptop': ['Apple', 'Dell', 'ASUS', 'HP', 'Lenovo'], 
  'Tablet': ['iPad', 'Samsung', 'Xiaomi'], 
  'Phụ kiện': ['Apple', 'Sony', 'JBL', 'Anker', 'Baseus'],
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || 'All';
  const brand = searchParams.get('brand') || 'All';
  const sort = searchParams.get('sort') || 'newest';

  // 1. GỌI API (Chỉ lấy theo Từ khóa và Danh mục, phần Hãng để Frontend lo)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = '/products?';
        const params = new URLSearchParams();
        
        if (keyword) params.append('keyword', keyword);
        if (category !== 'All') params.append('category', category);
        // Đã gỡ phần gửi Brand lên API để lấy TOÀN BỘ sản phẩm của danh mục đó về

        const { data } = await api.get(url + params.toString());
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category]); // Xóa brand khỏi dependency của API

  // 2. HÀM XỬ LÝ SIÊU THÔNG MINH (Vừa Lọc Hãng, Vừa Sắp Xếp)
  const getProcessedProducts = () => {
    let processed = [...products]; 
    
    // --- BƯỚC 1: LỌC HÃNG THÔNG MINH (Bỏ qua hoa thường, khoảng trắng, nhận diện bí danh) ---
    if (brand !== 'All') {
      processed = processed.filter(p => {
        if (!p.brand) return false;
        
        const dbBrand = p.brand.toLowerCase().trim();
        const selectedBrand = brand.toLowerCase().trim();
        
        // Nếu chọn Apple, tự động gom luôn iPhone, iPad, Macbook
        if (selectedBrand === 'apple' && (dbBrand === 'iphone' || dbBrand === 'ipad' || dbBrand === 'macbook')) {
            return true;
        }
        
        // So sánh chứa từ khóa (VD: gõ "Samsung" vẫn nhận "Samsung Galaxy")
        return dbBrand.includes(selectedBrand) || selectedBrand.includes(dbBrand);
      });
    }

    // --- BƯỚC 2: SẮP XẾP SẢN PHẨM ---
    if (sort === 'price_asc') {
        processed.sort((a, b) => a.price - b.price); 
    } else if (sort === 'price_desc') {
        processed.sort((a, b) => b.price - a.price); 
    } else if (sort === 'name_asc') {
        processed.sort((a, b) => a.name.localeCompare(b.name)); 
    } else if (sort === 'name_desc') {
        processed.sort((a, b) => b.name.localeCompare(a.name)); 
    }
    
    return processed;
  };

  // Lấy danh sách cuối cùng đã qua Xử lý để hiển thị
  const displayProducts = getProcessedProducts();

  const handleCategoryChange = (newCategory) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', newCategory);
    params.delete('brand'); 
    setSearchParams(params);
  };

  const handleBrandChange = (newBrand) => {
    const params = new URLSearchParams(searchParams);
    params.set('brand', newBrand);
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen font-sans">
      
      <div className="flex flex-col mb-6 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 uppercase tracking-wider">
            {keyword ? `Kết quả cho: "${keyword}"` : (category !== 'All' ? category : 'Tất cả sản phẩm')}
        </h1>

        {/* Nút lọc Danh mục */}
        <div className="flex gap-3 overflow-x-auto pb-2 w-full custom-scrollbar">
            {['All', 'Điện thoại', 'Laptop', 'Tablet', 'Phụ kiện'].map(cat => (
                <button 
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-6 py-2.5 rounded-full border text-sm font-bold whitespace-nowrap transition-all
                        ${category === cat 
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-purple-600 hover:text-purple-600'}`}
                >
                    {cat === 'All' ? 'Tất cả danh mục' : cat}
                </button>
            ))}
        </div>

        {/* Nút lọc Hãng */}
        {category !== 'All' && BRANDS_BY_CATEGORY[category] && (
          <div className="flex gap-3 overflow-x-auto mt-4 pt-4 border-t border-gray-50 w-full animate-fade-in-up">
              <span className="text-gray-500 font-medium py-2 text-sm flex-shrink-0">Chọn hãng:</span>
              <button 
                  onClick={() => handleBrandChange('All')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors
                      ${brand === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                  Tất cả
              </button>
              {BRANDS_BY_CATEGORY[category].map(b => (
                  <button 
                      key={b}
                      onClick={() => handleBrandChange(b)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors
                          ${brand === b ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}
                  >
                      {b}
                  </button>
              ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-32">
             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4"></div>
             <p className="text-gray-500 font-medium">Đang tìm kiếm sản phẩm...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-gray-500 font-medium">
                Tìm thấy <strong className="text-purple-600">{displayProducts.length}</strong> sản phẩm phù hợp
            </p>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Sắp xếp theo:</span>
              <select 
                value={sort}
                onChange={handleSortChange}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer bg-white shadow-sm hover:border-purple-300 transition-colors"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá: Từ Thấp đến Cao</option>
                <option value="price_desc">Giá: Từ Cao đến Thấp</option>
                <option value="name_asc">Tên: Từ A - Z</option>
                <option value="name_desc">Tên: Từ Z - A</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
              ))}
          </div>
        </>
      )}
      
      {!loading && displayProducts.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 mt-8">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" 
                alt="Not found" 
                className="w-24 h-24 mx-auto opacity-30 mb-4 drop-shadow-sm"
              />
              <p className="text-gray-600 text-lg font-medium">Rất tiếc, không có sản phẩm nào khớp với lựa chọn của bạn.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="mt-6 bg-purple-100 text-purple-700 px-6 py-2 rounded-full font-bold hover:bg-purple-200 transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
          </div>
      )}
    </div>
  );
};

export default Products;