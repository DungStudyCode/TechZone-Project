// client/src/pages/Product/ProductDetail.jsx
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom"; // Để chuyển trang
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

// Hàm format tiền (tái sử dụng)
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const ProductDetail = () => {
  const { slug } = useParams(); // Lấy slug từ URL (ví dụ: iphone-15-pro-max)
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart(); // Lấy hàm từ context
  const navigate = useNavigate();
  const handleAddToCart = () => {
    if (!selectedVariant) return alert("Vui lòng chọn phiên bản!");

    addToCart(product, selectedVariant, 1);

    // Thông báo đơn giản (hoặc dùng Toast nếu muốn xịn hơn)
    const confirm = window.confirm(
      "Đã thêm vào giỏ! Bạn có muốn đến giỏ hàng ngay không?"
    );
    if (confirm) navigate("/cart");
  };
  // Gọi API lấy chi tiết sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        // Mặc định chọn biến thể đầu tiên (ví dụ bản thấp nhất)
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="text-center mt-10">Đang tải...</div>;
  if (!product)
    return <div className="text-center mt-10">Không tìm thấy sản phẩm!</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg shadow-sm">
        {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
        <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-50 rounded-lg p-4">
          <img
            // Nếu biến thể có ảnh riêng thì dùng, không thì dùng ảnh chung
            src={selectedVariant?.image || product.image}
            alt={product.name}
            className="max-h-[400px] object-contain mix-blend-multiply transition-all duration-300 ease-in-out"
          />
        </div>

        {/* CỘT PHẢI: THÔNG TIN */}
        <div className="w-full md:w-1/2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-gray-500 mt-1">Thương hiệu: {product.brand}</p>
          </div>

          {/* GIÁ TIỀN (Thay đổi theo biến thể đang chọn) */}
          <div className="text-3xl font-bold text-red-600">
            {formatPrice(selectedVariant?.price || 0)}
          </div>

          {/* CHỌN PHIÊN BẢN (VARIANTS) */}
          <div>
            <h3 className="font-semibold mb-3">Chọn phiên bản:</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                    selectedVariant?.sku === variant.sku
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-200"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  {variant.storage} - {variant.color}
                </button>
              ))}
            </div>
          </div>

          {/* NÚT MUA HÀNG */}
          <div className="flex gap-4">
            <button className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
              MUA NGAY
            </button>
            <button
              onClick={handleAddToCart} // <-- Gắn sự kiện click
              className="flex-1 border-2 border-red-600 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition"
            >
              THÊM VÀO GIỎ
            </button>
          </div>

          {/* BẢNG THÔNG SỐ KỸ THUẬT */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-3">Thông số kỹ thuật:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex justify-between border-b pb-2">
                <span>Màn hình:</span>{" "}
                <span className="font-medium">{product.specs.screen}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Chipset:</span>{" "}
                <span className="font-medium">{product.specs.chip}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>RAM:</span>{" "}
                <span className="font-medium">{product.specs.ram}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Pin:</span>{" "}
                <span className="font-medium">{product.specs.battery}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
