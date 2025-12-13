// client/src/pages/Cart/Cart.jsx
import React from "react";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  // Tính tổng tiền
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống trơn!</h2>
        <Link to="/" className="text-blue-600 underline">
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* DANH SÁCH SẢN PHẨM */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {cartItems.map((item) => (
              <div
                key={item.sku}
                className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                {/* Ảnh */}
                <img
                  src={item.image || item.productImage}
                  alt={item.productName}
                  className="w-20 h-20 object-contain mix-blend-multiply"
                />

                {/* Thông tin */}
                <div className="flex-1 ml-4">
                  <h3 className="font-bold text-gray-800">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Màu: {item.color} | {item.storage}
                  </p>
                  <p className="text-red-600 font-bold mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Số lượng */}
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                    className="px-2 py-1 border bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-t border-b">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                    className="px-2 py-1 border bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>

                {/* Nút xóa */}
                <button
                  onClick={() => removeFromCart(item.sku)}
                  className="ml-4 text-gray-400 hover:text-red-500 transition"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TỔNG TIỀN & THANH TOÁN */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow sticky top-24">
            <h3 className="text-lg font-bold border-b pb-4 mb-4">
              Tổng đơn hàng
            </h3>
            <div className="flex justify-between mb-4 text-xl font-bold text-red-600">
              <span>Tổng cộng:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full text-center bg-black text-white py-3 rounded font-bold hover:bg-gray-800 transition uppercase"
            >
              Thanh toán ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
