// client/src/pages/Order/OrderDetail.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext"; 
import { toast } from 'react-toastify'; // ✅ IMPORT TOAST
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaCreditCard,
  FaPhoneAlt,
  FaChevronLeft,
  FaUser,
  FaTimesCircle
} from "react-icons/fa";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 

// Bọc hàm fetchOrder bằng useCallback
  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng:", error);
      toast.error("Không thể tải dữ liệu đơn hàng!");
    } finally {
      setLoading(false);
    }
  }, [id]); // Thêm id vào mảng dependency

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // --- HÀM XÁC NHẬN ĐÃ NHẬN HÀNG ---
  const markAsSuccessHandler = async () => {
    if (window.confirm("Bạn xác nhận đã nhận được hàng và sản phẩm không có vấn đề gì?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await api.put(`/orders/${id}/success`, {}, config);
        
        toast.success("Cảm ơn bạn đã mua sắm tại TechZone! 🎉");
        fetchOrder(); // ✅ Gọi lại hàm fetch thay vì reload cả trang
      } catch (error) {
        toast.error("Lỗi xác nhận: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // --- HÀM KHÁCH HÀNG TỰ HỦY ĐƠN ---
  const cancelOrderHandler = async () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Quá trình này không thể hoàn tác.")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await api.put(`/orders/${id}/cancel`, {}, config);
        
        toast.success("Đã hủy đơn hàng thành công!");
        fetchOrder(); // ✅ Gọi lại hàm fetch cho mượt, không chớp màn hình
      } catch (error) {
        toast.error("Lỗi hủy đơn: " + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) return <div className="py-40 text-center text-purple-600 font-bold flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div> Đang tải thông tin...</div>;
  if (!order) return <div className="py-40 text-center text-red-500 font-bold">Không tìm thấy đơn hàng!</div>;

  const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <Link to="/my-orders" className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6 font-bold transition-all w-fit">
          <FaChevronLeft /> Quay lại đơn hàng của tôi
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex justify-between relative">
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                {[
                  { label: "Đặt hàng", icon: <FaBox />, status: true },
                  { label: "Xác nhận", icon: <FaCheckCircle />, status: order.isPaid || order.status === "Confirmed" || order.isDelivered || order.status === "Success" || order.status === "Đang xử lý" },
                  { label: "Giao hàng", icon: <FaTruck />, status: order.isDelivered || order.status === "Success" || order.status === "Đang giao hàng" },
                  { label: "Thành công", icon: <FaCheckCircle />, status: order.status === "Success" },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center z-10 bg-white px-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-md transition-all duration-500 ${order.status === 'Đã hủy' ? 'bg-red-500 text-white' : step.status ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                      {order.status === 'Đã hủy' && i === 0 ? <FaTimesCircle /> : step.icon}
                    </div>
                    <span className={`text-[10px] mt-2 font-black uppercase text-center w-16 ${order.status === 'Đã hủy' ? 'text-red-500' : step.status ? "text-purple-600" : "text-gray-400"}`}>
                      {order.status === 'Đã hủy' && i === 0 ? 'Đã hủy' : step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Sản phẩm trong đơn</h3>
              </div>
              <div className="divide-y divide-gray-50 p-6">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-contain bg-gray-50 rounded-xl p-2 hover:scale-105 transition-transform" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">Số lượng: {item.qty}</p>
                    </div>
                    <div className="font-black text-purple-600">{formatPrice(item.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-800 uppercase text-[10px] tracking-widest mb-6 border-b pb-4">Thông tin nhận hàng</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaUser className="text-gray-300" />
                  <p className="text-sm font-bold text-gray-700">{order.shippingAddress?.recipientName || order.user?.name || "Người nhận"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">{order.shippingAddress?.phone || "Chưa cập nhật SĐT"}</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-300 mt-1" />
                  <p className="text-sm text-gray-500 leading-relaxed">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-900 text-white p-8 rounded-[2rem] shadow-xl">
              <h3 className="font-black uppercase text-[10px] tracking-widest mb-6 opacity-60">Chi tiết thanh toán</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm opacity-80">
                  <span>Tạm tính:</span><span>{formatPrice(order.itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-sm opacity-80">
                  <span>Vận chuyển:</span><span>{formatPrice(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-lg font-black pt-4 border-t border-white/10 mt-4">
                  <span>Tổng tiền:</span><span className="text-yellow-400">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 p-3 rounded-xl">
                <FaCreditCard /> Phương thức: {order.paymentMethod === "VNPay" ? "Thanh toán qua VNPay" : order.paymentMethod === "Banking" ? "Chuyển khoản trực tiếp" : "Thanh toán khi nhận hàng"}
              </div>
            </div>

            <div className="space-y-3">
              {order.isDelivered && order.status !== "Success" && order.status !== "Đã hủy" && order.status !== "Hoàn trả/Hoàn tiền" && (
                <button onClick={markAsSuccessHandler} className="w-full py-4 bg-green-500 border-2 border-green-500 rounded-2xl font-bold text-white hover:bg-green-600 transition-all shadow-lg hover:shadow-green-200 animate-bounce">
                  ĐÃ NHẬN ĐƯỢC HÀNG
                </button>
              )}

              {(!order.status || order.status === 'Chờ xác nhận') && !order.isDelivered && order.status !== 'Đã hủy' && (
                <button onClick={cancelOrderHandler} className="w-full py-4 bg-white border-2 border-red-100 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:border-red-200 transition-all">
                  HỦY ĐƠN HÀNG
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;