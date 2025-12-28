// client/src/pages/Admin/AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaCheck, FaTimes, FaTruck, FaBoxOpen } from 'react-icons/fa';

// Hàm format tiền
const formatPrice = (price) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Hàm format ngày tháng
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN');
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SỬA LỖI LINTER: Đưa hàm fetchOrders vào trong useEffect ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // Dependency rỗng nghĩa là chỉ chạy 1 lần khi vào trang

  // Hàm tải lại dữ liệu khi cần (dùng cho nút cập nhật)
  const reloadOrders = async () => {
    try {
        const { data } = await api.get('/orders');
        setOrders(data);
    } catch (error) {
        console.error("Lỗi reload:", error);
    }
  };

  // --- HÀM XỬ LÝ: Đánh dấu đã giao hàng ---
  const markAsDelivered = async (id) => {
    if (window.confirm('Xác nhận đơn hàng này đã được giao đến khách?')) {
      try {
        await api.put(`/orders/${id}/deliver`, { status: 'Delivered' });
        alert("Cập nhật thành công!");
        reloadOrders(); // Gọi hàm reload riêng
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi cập nhật");
      }
    }
  };

  if (loading) return (
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
                <th className="px-5 py-4">Tổng tiền</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-center">Hành động</th>
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
                    <p className="text-gray-500 text-xs mt-1">{formatDate(order.createdAt)}</p>
                  </td>

                  {/* Cột 2: Khách hàng */}
                  <td className="px-5 py-4 text-sm">
                    <p className="font-bold text-gray-800">
                        {order.user?.name || "Khách lẻ"}
                    </p>
                    {order.shippingAddress && (
                        <>
                            <p className="text-gray-500 text-xs">{order.shippingAddress.phone}</p>
                            <p className="text-gray-400 text-xs truncate w-40" title={order.shippingAddress.address}>
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
                          <p className="text-xs font-semibold text-gray-700 line-clamp-1 w-32" title={item.name}>{item.name}</p>
                          <p className="text-[10px] text-gray-500">
                            x{item.quantity} {item.color ? `| ${item.color}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </td>

                  {/* Cột 4: Tổng tiền & Thanh toán */}
                  <td className="px-5 py-4 text-sm">
                    <div className="font-bold text-red-600 mb-1">{formatPrice(order.totalPrice)}</div>
                    {order.paymentMethod === 'COD' ? (
                         <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">COD</span>
                    ) : (
                         <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded border border-green-200">Paid</span>
                    )}
                  </td>

                  {/* Cột 5: Trạng thái Giao hàng */}
                  <td className="px-5 py-4 text-sm">
                    {order.isDelivered || order.status === 'Delivered' ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                        <FaCheck /> Đã giao
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 animate-pulse">
                        <FaTruck /> Đang giao
                      </span>
                    )}
                  </td>

                  {/* Cột 6: Hành động (Nút xác nhận) */}
                  <td className="px-5 py-4 text-center">
                    {!order.isDelivered && order.status !== 'Delivered' && (
                      <button 
                        onClick={() => markAsDelivered(order._id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm hover:shadow flex items-center gap-1 mx-auto"
                        title="Xác nhận đã giao hàng"
                      >
                        <FaBoxOpen /> Giao hàng
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center text-gray-400">
                <FaBoxOpen className="text-4xl mb-3 opacity-20"/>
                <p>Chưa có đơn hàng nào!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;