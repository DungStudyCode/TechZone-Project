// client/src/pages/Cart/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import api from "../../services/api";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State lưu thông tin giao hàng
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD"); // Mặc định là COD

  // Tự động điền thông tin user nếu đã đăng nhập (Optional)
  const [userInfo, setUserInfo] = useState({});
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserInfo(savedUser);
    if (savedUser.name) {
      // Có thể set default value nếu muốn
    }
  }, []);

  // --- 1. CÔNG THỨC TÍNH TOÁN AN TOÀN (Sửa lỗi NaN) ---
  const itemsPrice = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.qty) || 1;
    return acc + price * qty;
  }, 0);

  const shippingPrice = itemsPrice > 50000000 ? 0 : 30000; // Miễn phí nếu > 50tr, ngược lại 30k
  const totalPrice = itemsPrice + shippingPrice;

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // --- 2. XỬ LÝ ĐẶT HÀNG ---
  const placeOrderHandler = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Giỏ hàng rỗng!");
      return;
    }

    setLoading(true);
    try {
      // 1. CHUẨN HÓA DANH SÁCH SẢN PHẨM
      // Backend cần trường 'product' là ID, nhưng cartItems đang dùng '_id'
      const orderItems = cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id, // <--- QUAN TRỌNG: Gán _id vào trường product
      }));

      // 2. TẠO DỮ LIỆU ĐƠN HÀNG
      const orderData = {
        orderItems: orderItems, // Dùng danh sách đã chuẩn hóa
        shippingAddress: {
          address,
          city,
          phone,
          country: "Vietnam",
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
      };

      // 3. GỬI LÊN SERVER
      // Lưu ý: Cần Token đăng nhập để Backend biết ai đặt (đã xử lý tự động ở api.js nếu setup đúng)
      const { data } = await api.post("/orders", orderData);

      clearCart();
      alert("Đặt hàng thành công! Mã đơn: " + data._id);
      navigate("/");
    } catch (error) {
      console.error(error); // Log ra console để soi lỗi nếu có
      alert(error.response?.data?.message || "Lỗi đặt hàng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center uppercase tracking-wide">
        Thanh Toán & Đặt Hàng
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* --- CỘT TRÁI: THÔNG TIN GIAO HÀNG --- */}
        <div className="lg:w-2/3 space-y-6">
          <form id="checkout-form" onSubmit={placeOrderHandler}>
            {/* Box 1: Địa chỉ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Thông tin giao hàng
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên người nhận
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={userInfo.name || ""}
                      disabled
                      className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder="Ví dụ: 0987..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder="Hà Nội, TP.HCM..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-200 outline-none"
                        placeholder="Số nhà, Tên đường..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Phương thức thanh toán */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                    paymentMethod === "COD"
                      ? "border-purple-500 bg-purple-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="ml-3 flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded text-green-600">
                      <FaMoneyBillWave size={20} />
                    </div>
                    <div>
                      <span className="block font-bold text-gray-800">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <span className="text-xs text-gray-500">
                        Bạn chỉ phải thanh toán khi đã nhận được hàng
                      </span>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition opacity-60 ${
                    paymentMethod === "Banking"
                      ? "border-purple-500 bg-purple-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Banking"
                    disabled
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="ml-3 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded text-blue-600">
                      <FaCreditCard size={20} />
                    </div>
                    <div>
                      <span className="block font-bold text-gray-800">
                        Chuyển khoản ngân hàng / QR Code
                      </span>
                      <span className="text-xs text-gray-500">
                        Tính năng đang bảo trì
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b">
              Đơn hàng của bạn
            </h3>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center gap-4"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-12 h-12 object-contain border rounded bg-white"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">x {item.qty}</p>
                  </div>
                  <div className="font-bold text-sm text-gray-700">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 py-4 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-medium">{formatPrice(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span
                  className={
                    shippingPrice === 0
                      ? "text-green-600 font-bold"
                      : "font-medium"
                  }
                >
                  {shippingPrice === 0
                    ? "Miễn phí"
                    : formatPrice(shippingPrice)}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 mb-8">
              <span className="text-xl font-bold text-gray-800">
                Tổng cộng:
              </span>
              <span className="text-2xl font-extrabold text-red-600">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              type="submit"
              form="checkout-form" // Link với form bên trái
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 text-lg"
            >
              {loading
                ? "ĐANG XỬ LÝ..."
                : `HOÀN TẤT ĐẶT HÀNG (${formatPrice(totalPrice)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
