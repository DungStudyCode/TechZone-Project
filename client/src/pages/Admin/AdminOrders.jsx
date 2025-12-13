import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

// Hàm format tiền
const formatPrice = (price) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Hàm format ngày tháng (Ví dụ: 12/12/2024 14:30)
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN');
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center mt-10">Đang tải dữ liệu...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
          Tổng đơn: {orders.length}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mã đơn / Ngày đặt
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition">
                {/* Cột 1: ID & Date */}
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-mono text-xs text-blue-600 font-bold">
                    #{order._id.slice(-6).toUpperCase()} 
                    {/* Chỉ lấy 6 ký tự cuối của ID cho gọn */}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{formatDate(order.createdAt)}</p>
                </td>

                {/* Cột 2: Khách hàng */}
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-bold">{order.customerInfo.name}</p>
                  <p className="text-gray-500 text-xs">{order.customerInfo.phone}</p>
                  <p className="text-gray-500 text-xs truncate w-40" title={order.customerInfo.address}>
                    {order.customerInfo.address}
                  </p>
                </td>

                {/* Cột 3: Sản phẩm */}
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <img src={item.image} alt="" className="w-8 h-8 object-contain border rounded" />
                      <div>
                        <p className="text-xs font-semibold">{item.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {item.color} | x{item.qty}
                        </p>
                      </div>
                    </div>
                  ))}
                </td>

                {/* Cột 4: Tổng tiền */}
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <span className="text-red-600 font-bold">{formatPrice(order.totalPrice)}</span>
                </td>

                {/* Cột 5: Trạng thái */}
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full 
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-900' : 'bg-green-100 text-green-900'}`}>
                    <span className="relative">{order.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="p-10 text-center text-gray-500">Chưa có đơn hàng nào!</div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <Link to="/" className="text-blue-600 hover:underline">← Quay về trang chủ</Link>
      </div>
    </div>
  );
};

export default AdminOrders;