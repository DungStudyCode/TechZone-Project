// client/src/pages/Cart/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext"; // ✅ THÊM IMPORT useAuth
import api from "../../services/api";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle,
} from "react-icons/fa";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth(); // ✅ Lấy thông tin user (đã chứa addresses)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State lưu thông tin giao hàng
  const [recipientName, setRecipientName] = useState("");
  const [address, setAddress] = useState(""); // Tương ứng với street
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD"); // Mặc định là COD

  // ✅ TỰ ĐỘNG ĐIỀN THÔNG TIN TỪ SỔ ĐỊA CHỈ
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      // Tìm địa chỉ mặc định, không có thì lấy cái đầu tiên
      const defaultAddr =
        user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setRecipientName(defaultAddr.recipientName);
      setPhone(defaultAddr.phoneNumber);
      setCity(defaultAddr.city);
      setAddress(defaultAddr.street);
    } else if (user) {
      // Nếu chưa có sổ địa chỉ thì lấy tạm tên User
      setRecipientName(user.name);
    }
  }, [user]);

  // ✅ HÀM KHI KHÁCH BẤM CHỌN 1 ĐỊA CHỈ TRONG SỔ
  const handleSelectAddress = (addr) => {
    setRecipientName(addr.recipientName);
    setPhone(addr.phoneNumber);
    setCity(addr.city);
    setAddress(addr.street);
  };

  // --- 1. CÔNG THỨC TÍNH TOÁN AN TOÀN ---
  const itemsPrice = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.qty) || 1;
    return acc + price * qty;
  }, 0);

  const shippingPrice = itemsPrice > 50000000 ? 0 : 30000;
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
      const orderItems = cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id,
      }));

      const orderData = {
        orderItems: orderItems,
        shippingAddress: {
          address, // Lấy từ ô Địa chỉ cụ thể (street)
          city,
          phone,
          country: "Vietnam",
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
      };

      const { data } = await api.post("/orders", orderData);

      clearCart();
      alert("Đặt hàng thành công! Mã đơn: " + data._id);
      navigate("/my-orders"); // Đặt xong cho bay về trang Lịch sử đơn hàng luôn cho xịn
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi đặt hàng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-black text-gray-800 mb-8 text-center uppercase tracking-wide">
        Thanh Toán & Đặt Hàng
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* --- CỘT TRÁI: THÔNG TIN GIAO HÀNG --- */}
        <div className="lg:w-2/3 space-y-6">
          <form id="checkout-form" onSubmit={placeOrderHandler}>
            {/* Box 1: Địa chỉ */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner">
                  1
                </span>
                Thông tin giao hàng
              </h2>

              {/* ✅ MỚI: DANH SÁCH SỔ ĐỊA CHỈ */}
              {user?.addresses?.length > 0 && (
                <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-purple-500" /> Chọn nhanh từ
                    sổ địa chỉ:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {user.addresses.map((addr, index) => {
                      const isSelected =
                        address === addr.street && phone === addr.phoneNumber;
                      return (
                        <div
                          key={index}
                          onClick={() => handleSelectAddress(addr)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative ${
                            isSelected
                              ? "border-purple-500 bg-purple-50/50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-purple-300"
                          }`}
                        >
                          {isSelected && (
                            <FaCheckCircle className="absolute top-4 right-4 text-purple-600" />
                          )}
                          <div className="flex items-center gap-2 mb-2 pr-6">
                            <p className="font-bold text-gray-800 text-sm truncate">
                              {addr.recipientName}
                            </p>
                            {addr.isDefault && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">
                            📞 {addr.phoneNumber}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            📍 {addr.street}, {addr.city}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FORM NHẬP TAY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Họ tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="pl-12 w-full border-2 border-gray-100 rounded-2xl py-3.5 focus:border-purple-300 focus:bg-purple-50/30 outline-none transition-all font-bold text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-12 w-full border-2 border-gray-100 rounded-2xl py-3.5 focus:border-purple-300 focus:bg-purple-50/30 outline-none transition-all font-bold text-gray-700"
                      placeholder="09xx..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 border-2 border-gray-100 rounded-2xl py-3.5 focus:border-purple-300 focus:bg-purple-50/30 outline-none transition-all font-bold text-gray-700"
                    placeholder="Hà Nội, TP.HCM..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-12 w-full border-2 border-gray-100 rounded-2xl py-3.5 focus:border-purple-300 focus:bg-purple-50/30 outline-none transition-all font-bold text-gray-700"
                      placeholder="Số nhà, Tên đường..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Phương thức thanh toán */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner">
                  2
                </span>
                Phương thức thanh toán
              </h2>

              <div className="space-y-4">
                <label
                  className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === "COD" ? "border-purple-500 bg-purple-50/50 shadow-sm" : "border-gray-100 hover:border-purple-200"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="ml-4 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl text-green-600 shadow-sm">
                      <FaMoneyBillWave size={24} />
                    </div>
                    <div>
                      <span className="block font-bold text-gray-800">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <span className="text-xs text-gray-500">
                        Thanh toán bằng tiền mặt khi shipper giao tới
                      </span>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === "Banking" ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-gray-100 hover:border-blue-200"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Banking"
                    checked={paymentMethod === "Banking"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-4 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      <FaCreditCard size={24} />
                    </div>
                    <div>
                      <span className="block font-bold text-gray-800">
                        Chuyển khoản Ngân hàng (VietQR)
                      </span>
                      <span className="text-xs text-blue-500 font-medium">
                        Tự động điền số tiền & nội dung
                      </span>
                    </div>
                  </div>
                </label>
                {/* --- HIỂN THỊ QR CODE ĐỘNG KHI CHỌN BANKING --- */}
                {paymentMethod === "Banking" && (
                  <div className="mt-8 p-6 md:p-10 bg-white border-2 border-dashed border-blue-200 rounded-[2.5rem] text-center animate-fade-in relative overflow-hidden">
                    {/* Decor nền tạo cảm giác công nghệ */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-50"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full opacity-50"></div>

                    <div className="relative z-10">
                      <p className="text-blue-800 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                        Hệ thống thanh toán tự động VietQR
                      </p>

                      {/* Vùng chứa mã QR */}
                      <div className="inline-block p-5 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(59,130,246,0.15)] border border-blue-50 mb-8 group transition-transform hover:scale-105">
                        <img
                          src={`https://i.postimg.cc/ZYwxsBcx/Ma-QR.jpg?amount=${totalPrice}&addInfo=TECHZONE%20ORDER%20${user?._id?.slice(-6)}&accountName=NGUYEN%20TIEN%20DUNG`}
                          alt="Mã QR BIDV"
                          className="w-60 h-60 object-contain"
                        />
                        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 font-bold text-xs">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                          Đang chờ quét mã...
                        </div>
                      </div>

                      {/* Thông tin đối chiếu thủ công (Nếu khách cần gõ tay) */}
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center text-sm font-bold">
                          <span className="text-blue-400 uppercase text-[10px]">
                            Chủ TK:
                          </span>
                          <span className="text-gray-800">
                            NGUYEN TIEN DUNG
                          </span>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center text-sm font-bold">
                          <span className="text-blue-400 uppercase text-[10px]">
                            Ngân hàng
                          </span>
                          <span className="text-gray-800">
                            BIDV (Đầu tư & Phát triển VN)
                          </span>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center text-sm font-bold">
                          <span className="text-blue-400 uppercase text-[10px]">
                            Số TK
                          </span>
                          <span className="text-blue-700">5321333317</span>
                        </div>

                        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                          <span className="text-red-400 uppercase text-[10px] font-bold">
                            Số tiền:
                          </span>
                          <span className="font-black text-red-600 text-lg">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-8 text-[11px] text-gray-400 font-medium italic leading-relaxed px-10">
                        * Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống
                        tự động xác nhận đơn hàng trong 30 giây.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-28">
            <h3 className="text-xl font-black text-gray-800 mb-6 pb-4 border-b border-gray-100">
              Đơn hàng của bạn
            </h3>

            <div className="space-y-5 mb-6 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-center group">
                  <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-xl p-2 border border-gray-100 group-hover:scale-105 transition-transform">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate mb-1">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-gray-400">
                      SL: <span className="text-gray-700">{item.qty}</span>
                    </p>
                  </div>
                  <div className="font-black text-sm text-gray-800 shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 py-5 border-t border-gray-100 bg-gray-50/50 rounded-xl px-4">
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Tạm tính:</span>
                <span className="text-gray-800">{formatPrice(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Phí vận chuyển:</span>
                <span
                  className={
                    shippingPrice === 0 ? "text-green-600" : "text-gray-800"
                  }
                >
                  {shippingPrice === 0
                    ? "Miễn phí"
                    : formatPrice(shippingPrice)}
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between pt-6 border-t border-gray-200 mb-8 mt-4">
              <span className="text-sm font-black text-gray-500 uppercase tracking-widest">
                Tổng cộng
              </span>
              <span className="text-3xl font-black text-red-600 drop-shadow-sm">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-red-200 hover:-translate-y-1 transition-all duration-300 text-lg tracking-wide flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>{" "}
                  ĐANG XỬ LÝ
                </>
              ) : (
                "HOÀN TẤT ĐẶT HÀNG"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
