import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FaBoxOpen, FaClock, FaCheckCircle, FaShippingFast, 
  FaRegListAlt, FaChevronRight, FaCalendarAlt 
} from 'react-icons/fa';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Hàm định dạng màu sắc theo trạng thái
  const getStatusBadge = (order) => {
    if (order.isDelivered) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700 border border-green-200">
          <FaCheckCircle /> Đã giao hàng
        </span>
      );
    }
    if (order.isPaid) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700 border border-blue-200">
          <FaShippingFast /> Đang xử lý
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-yellow-100 text-yellow-700 border border-yellow-200">
        <FaClock /> Chờ thanh toán
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <FaRegListAlt size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Đơn hàng của tôi</h1>
              <p className="text-gray-500 text-sm font-medium">Theo dõi và quản lý lịch sử mua sắm của bạn</p>
            </div>
          </div>
          <Link to="/products" className="text-purple-600 font-bold hover:underline flex items-center gap-2">
            Tiếp tục mua sắm <FaChevronRight size={12}/>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl shadow-gray-200/50 border border-gray-100 animate-fade-in">
            <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <FaBoxOpen size={80} className="text-gray-200" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có đơn hàng nào!</h2>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">Có vẻ như bạn chưa đặt mua sản phẩm nào. Hãy khám phá các siêu phẩm công nghệ ngay nhé!</p>
            <Link to="/products" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:shadow-lg hover:shadow-purple-200 transition-all uppercase tracking-wider text-sm">
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 group">
                
                {/* Order Top Info */}
                <div className="p-6 md:p-8 flex flex-wrap justify-between items-center gap-6 border-b border-gray-50 bg-gray-50/30">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Mã đơn hàng</p>
                      <p className="font-mono font-bold text-purple-600">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="hidden sm:block h-10 w-px bg-gray-200"></div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Ngày đặt hàng</p>
                      <div className="flex items-center gap-2 text-gray-700 font-bold">
                        <FaCalendarAlt size={12} className="text-gray-400" />
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order)}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-6 md:p-8">
                  <div className="space-y-6">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm md:text-base truncate mb-1">{item.name}</h4>
                          <p className="text-xs text-gray-400 font-medium">Số lượng: <span className="text-gray-700">{item.qty}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-800">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 md:px-8 py-5 bg-gray-50/50 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-gray-500 uppercase text-[10px]">Tổng thanh toán:</span>
                    <span className="text-2xl font-black text-red-600 drop-shadow-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                    </span>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Link 
                      to={`/order/${order._id}`} 
                      className="flex-1 sm:flex-none text-center bg-white border-2 border-gray-200 text-gray-700 px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm"
                    >
                      Chi tiết đơn hàng
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;