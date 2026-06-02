// client/src/pages/Admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { FaBox, FaChartLine, FaClipboardList, FaUsers } from 'react-icons/fa';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../services/api'; 

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersToday: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    chartData: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        const { data } = await api.get('/orders/dashboard-stats', config);
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu kinh doanh...</div>;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📊 Tổng Quan Kinh Doanh
      </h2>

      {/* --- 4 THẺ THỐNG KÊ (CARDS) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between min-w-0">
          <div>
            <p className="text-gray-500 text-sm font-medium">Tổng Doanh Thu</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1 truncate">
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className="text-green-500 text-xs mt-1 font-bold">+15% so với tháng trước</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600 flex-shrink-0">
            <FaChartLine size={20} />
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between min-w-0">
          <div>
            <p className="text-gray-500 text-sm font-medium">Đơn Hàng Mới</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{stats.ordersToday}</h3>
            <p className="text-blue-500 text-xs mt-1 font-bold">Tổng số đơn: {stats.totalOrders}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600 flex-shrink-0">
            <FaClipboardList size={20} />
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between min-w-0">
          <div>
            <p className="text-gray-500 text-sm font-medium">Khách Hàng</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{stats.totalUsers}</h3>
            <p className="text-yellow-500 text-xs mt-1 font-bold">Thành viên đăng ký</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 flex-shrink-0">
            <FaUsers size={20} />
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between min-w-0">
          <div>
            <p className="text-gray-500 text-sm font-medium">Sản Phẩm</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</h3>
            <p className="text-red-500 text-xs mt-1 font-bold">Kho hàng ổn định</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full text-red-600 flex-shrink-0">
            <FaBox size={20} />
          </div>
        </div>
      </div>

      {/* --- BIỂU ĐỒ & DANH SÁCH ĐƠN HÀNG --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Cột Trái: Biểu Đồ */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              📈 Biểu Đồ Doanh Thu
            </h3>
          </div>
          <div className="h-[250px] md:h-[300px] w-full min-w-0">
            {/* ✅ ĐÃ THÊM ĐIỀU KIỆN ÉP RECHARTS PHẢI ĐỢI */}
            {stats.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(num) => `${num/1000000}M`} tick={{fontSize: 12}} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                Chưa có dữ liệu thống kê doanh thu
              </div>
            )}
          </div>
        </div>

        {/* Cột Phải: Đơn Hàng Gần Đây */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              📦 Đơn Hàng Gần Đây
            </h3>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[300px]">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b">
                  <th className="pb-3">Khách Hàng</th>
                  <th className="pb-3 text-right">Tổng Tiền</th>
                  <th className="pb-3 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-2">
                      <p className="text-sm font-bold text-gray-700 truncate max-w-[100px] md:max-w-xs">{order.user?.name || 'Khách lẻ'}</p>
                      <p className="text-xs text-gray-400">#{order._id.substring(20, 24)}</p>
                    </td>
                    <td className="py-3 text-right text-sm font-bold text-gray-800 whitespace-nowrap">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold
                        ${order.isDelivered 
                          ? 'bg-green-100 text-green-700' 
                          : order.isPaid 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }
                      `}>
                        {order.isDelivered ? 'Đã giao' : order.isPaid ? 'Đã trả' : 'Chờ xử lý'}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-gray-400 text-sm">Chưa có đơn hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;