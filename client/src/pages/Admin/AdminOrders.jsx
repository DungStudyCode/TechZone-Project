// client/src/pages/Admin/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  FaCheck,
  FaTruck,
  FaBoxOpen,
  FaClipboardList,
  FaTimesCircle,
  FaUndoAlt
} from "react-icons/fa"; 

// Hàm format tiền
const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

// Hàm format ngày tháng
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("vi-VN");
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mảng trạng thái chuẩn E-commerce
  const statusOptions = [
    'Chờ xác nhận', 
    'Đang xử lý', 
    'Đang giao hàng', 
    'Đã giao hàng', 
    'Đã hủy', 
    'Hoàn trả/Hoàn tiền'
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ HÀM DUY NHẤT: XỬ LÝ KHI CHỌN TRẠNG THÁI MỚI TỪ DROPDOWN
  const handleStatusChange = async (orderId, newStatus) => {
    if (window.confirm(`Bạn muốn đổi trạng thái đơn hàng thành: "${newStatus}"?`)) {
      try {
        await api.put(`/orders/${orderId}/status`, { status: newStatus });
        alert("Cập nhật trạng thái thành công!");
        fetchOrders(); // Load lại danh sách
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi cập nhật trạng thái");
      }
    }
  };

  // Hàm render giao diện Trạng thái (Pill) dựa trên chữ
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Đã giao hàng':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[11px] font-bold flex items-center w-fit gap-1"><FaCheck /> {status}</span>;
      case 'Đang giao hàng':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[11px] font-bold flex items-center w-fit gap-1 animate-pulse"><FaTruck /> {status}</span>;
      case 'Đang xử lý':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-[11px] font-bold flex items-center w-fit gap-1"><FaBoxOpen /> {status}</span>;
      case 'Đã hủy':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-[11px] font-bold flex items-center w-fit gap-1"><FaTimesCircle /> {status}</span>;
      case 'Hoàn trả/Hoàn tiền':
        return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-[11px] font-bold flex items-center w-fit gap-1"><FaUndoAlt /> {status}</span>;
      default: // Chờ xác nhận
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-[11px] font-bold flex items-center w-fit gap-1"><FaClipboardList /> {status}</span>;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-purple-700 pl-4">
          Quản lý Đơn hàng
        </h1>
        <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-bold shadow-sm">
          Tổng đơn: {orders.length}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-purple-50 text-left text-xs font-bold text-purple-800 uppercase tracking-wider border-b border-purple-100">
                <th className="px-5 py-4">Mã đơn / Ngày</th>
                <th className="px-5 py-4">Khách hàng</th>
                <th className="px-5 py-4">Sản phẩm</th>
                <th className="px-5 py-4">Thanh toán</th>
                <th className="px-5 py-4">Trạng thái hiện tại</th>
                <th className="px-5 py-4 text-center">Cập nhật Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Cột 1: ID & Ngày */}
                  <td className="px-5 py-4 text-sm">
                    <p className="font-mono text-purple-600 font-bold text-xs">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </td>

                  {/* Cột 2: Khách hàng */}
                  <td className="px-5 py-4 text-sm">
                    <p className="font-bold text-gray-800">{order.user?.name || "Khách lẻ"}</p>
                    {order.shippingAddress && (
                      <>
                        <p className="text-gray-500 text-xs">{order.shippingAddress.phone}</p>
                        <p className="text-gray-400 text-xs truncate w-32" title={order.shippingAddress.address}>
                          {order.shippingAddress.city}
                        </p>
                      </>
                    )}
                  </td>

                  {/* Cột 3: Sản phẩm */}
                  <td className="px-5 py-4 text-sm">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2 last:mb-0">
                        <img src={item.image} alt="" className="w-8 h-8 object-contain border rounded bg-white" />
                        <div>
                          <p className="text-xs font-semibold text-gray-700 line-clamp-1 w-32" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-gray-500">x{item.qty || item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </td>

                  {/* Cột 4: Tổng tiền & Thanh toán */}
                  <td className="px-5 py-4 text-sm">
                    <div className="font-bold text-red-600 mb-1">{formatPrice(order.totalPrice)}</div>
                    {order.isPaid ? (
                      <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded border border-green-200">
                        Đã thanh toán ({order.paymentMethod})
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        Chưa thanh toán ({order.paymentMethod})
                      </span>
                    )}
                  </td>

                  {/* Cột 5: Trạng thái hiện tại */}
                  <td className="px-5 py-4 text-sm">
                    {renderStatusBadge(order.status)}
                  </td>

                  {/* Cột 6: Dropdown Cập nhật Trạng thái */}
                  <td className="px-5 py-4 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={order.status === 'Đã giao hàng' || order.status === 'Đã hủy' || order.status === 'Hoàn trả/Hoàn tiền'}
                      className={`text-xs border rounded-lg px-2 py-1 outline-none font-medium cursor-pointer shadow-sm
                        ${order.status === 'Đã giao hàng' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-purple-300 text-purple-700 hover:border-purple-500'}
                      `}
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center text-gray-400">
              <FaBoxOpen className="text-4xl mb-3 opacity-20" />
              <p>Chưa có đơn hàng nào!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;