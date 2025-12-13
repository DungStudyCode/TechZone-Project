// client/src/pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Import file api vừa tạo
import ProductCard from '../../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]); // Chứa danh sách SP
  const [loading, setLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState(null);     // Trạng thái lỗi

  // Gọi API khi vào trang web
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products'); // Gọi GET /api/products
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi:", err);
        setError("Không thể tải sản phẩm. Vui lòng kiểm tra Backend.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-center mt-20 text-xl">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center uppercase text-gray-800">
        Sản phẩm nổi bật
      </h1>
      
      {/* Grid hiển thị sản phẩm: Mobile 1 cột, Tablet 2 cột, Desktop 4 cột */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;