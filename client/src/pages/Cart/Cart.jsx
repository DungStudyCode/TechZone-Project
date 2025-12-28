// client/src/pages/Cart/Cart.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext"; // Đảm bảo đường dẫn đúng
import { FaTrash, FaArrowLeft, FaLongArrowAltRight } from "react-icons/fa";

const Cart = () => {
  const { cartItems, removeFromCart, updateCartQty } = useCart();
  const navigate = useNavigate();

  // Hàm tính tổng tiền an toàn (tránh NaN)
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price) || 0;
      return acc + price * item.qty;
    }, 0);
  };

  // Hàm format tiền
  const formatPrice = (price) => {
    const amount = parseFloat(price);
    if (isNaN(amount)) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xử lý khi giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
            alt="Empty Cart"
            className="w-32 h-32 mx-auto opacity-50"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-gray-500 mb-8">
          Hãy dạo một vòng và chọn những món đồ ưng ý nhé!
        </p>
        <Link
          to="/"
          className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition shadow-lg inline-flex items-center gap-2"
        >
          <FaArrowLeft /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 border-l-4 border-purple-700 pl-4">
        Giỏ hàng ({cartItems.length})
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* --- CỘT TRÁI: DANH SÁCH SẢN PHẨM --- */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
            {/* Header Bảng */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-bold text-gray-700 text-sm uppercase">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-center">Thành tiền</div>
            </div>

            {/* Danh sách Items */}
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
                >
                  {/* Cột: Hình ảnh & Tên */}
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <Link to={`/product/${item.slug}`} className="shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-contain border rounded-lg bg-white"
                      />
                    </Link>
                    <div>
                      <Link
                        to={`/product/${item.slug}`}
                        className="font-bold text-gray-800 hover:text-purple-700 line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{item.brand}</p>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 text-xs mt-2 hover:underline flex items-center gap-1 md:hidden"
                      >
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  </div>

                  {/* Cột: Đơn giá */}
                  <div className="col-span-2 text-center hidden md:block font-medium text-gray-600">
                    {formatPrice(item.price)}
                  </div>

                  {/* Cột: Số lượng */}
                  <div className="col-span-2 flex justify-center w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateCartQty(item._id, item.qty - 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition"
                        disabled={item.qty <= 1}
                      >
                        -
                      </button>
                      <span className="px-3 font-bold text-gray-700 w-8 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item._id, item.qty + 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition"
                        disabled={item.qty >= item.countInStock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Cột: Thành tiền & Nút Xóa */}
                  <div className="col-span-2 flex items-center justify-between w-full md:w-auto md:justify-center mt-4 md:mt-0">
                    <span className="font-bold text-purple-700 md:hidden">
                      Tổng:{" "}
                    </span>
                    <div className="text-center">
                      <span className="font-bold text-red-600 block">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-400 hover:text-red-500 ml-4 hidden md:block transition"
                      title="Xóa sản phẩm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/"
              className="text-purple-600 font-bold hover:underline flex items-center gap-2"
            >
              <FaArrowLeft /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* --- CỘT PHẢI: TỔNG TIỀN --- */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b">
              Cộng giỏ hàng
            </h3>

            <div className="flex justify-between mb-4 text-gray-600">
              <span>Tạm tính:</span>
              <span className="font-medium">
                {formatPrice(calculateTotal())}
              </span>
            </div>

            <div className="flex justify-between mb-6 pb-6 border-b text-gray-600">
              <span>Phí vận chuyển:</span>
              <span className="text-green-600 font-medium">Miễn phí</span>
            </div>

            <div className="flex justify-between mb-8">
              <span className="text-xl font-bold text-gray-800">
                Tổng cộng:
              </span>
              <span className="text-2xl font-extrabold text-red-600">
                {formatPrice(calculateTotal())}
              </span>
            </div>

            <button
              // SỬA DÒNG NÀY: Đổi 'shipping' thành 'checkout'
              onClick={() => navigate("/login?redirect=checkout")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex justify-center items-center gap-2 text-lg"
            >
              TIẾN HÀNH THANH TOÁN <FaLongArrowAltRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
