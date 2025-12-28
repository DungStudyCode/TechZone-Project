import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Gọi API lấy đơn hàng của tôi
      const fetchMyOrders = async () => {
        try {
          // Gửi kèm Token để Backend biết mình là ai (axios interceptor trong api.js đã tự làm việc này nếu bạn cấu hình đúng)
          // Nhưng để chắc ăn, api.js thường đã tự gắn header Authorization
          const { data } = await api.get('/orders/myorders');
          setOrders(data);
        } catch (error) {
          console.error("Lỗi tải đơn hàng:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMyOrders();
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Tài khoản của tôi</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Thông tin cá nhân</h2>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm">Họ tên:</label>
              <p className="font-bold text-lg">{user.name}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm">Email:</label>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
            {user.isAdmin && (
               <div className="mb-6 inline-block bg-black text-white text-xs px-2 py-1 rounded">
                 Administrator Account
               </div>
            )}
            
            <button 
              onClick={logout}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH SỬ MUA HÀNG */}
        <div className="md:w-2/3">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Lịch sử đơn hàng ({orders.length})</h2>
            
            {loading ? (
              <p>Đang tải...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">Bạn chưa mua đơn hàng nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-500 text-sm border-b">
                      <th className="py-2">Mã đơn</th>
                      <th className="py-2">Ngày mua</th>
                      <th className="py-2">Tổng tiền</th>
                      <th className="py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-mono text-blue-600 text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="py-3 text-sm">{formatDate(order.createdAt)}</td>
                        <td className="py-3 font-bold text-gray-800">{formatPrice(order.totalPrice)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold
                            ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
                          `}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;