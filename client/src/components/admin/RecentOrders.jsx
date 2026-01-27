import React from 'react';

const RecentOrders = () => {
  // Dữ liệu giả lập
  const orders = [
    { id: '#OD123', user: 'Nguyễn Văn A', date: '22/01/2026', total: '25.000.000đ', status: 'Delivered' },
    { id: '#OD124', user: 'Trần Thị B', date: '22/01/2026', total: '1.200.000đ', status: 'Pending' },
    { id: '#OD125', user: 'Lê Văn C', date: '21/01/2026', total: '5.600.000đ', status: 'Cancelled' },
    { id: '#OD126', user: 'Phạm Thị D', date: '21/01/2026', total: '890.000đ', status: 'Delivered' },
    { id: '#OD127', user: 'Hoàng Long', date: '20/01/2026', total: '32.000.000đ', status: 'Processing' },
  ];

  // Hàm chọn màu cho trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">📦 Đơn Hàng Gần Đây</h3>
        <button className="text-[#724ae8] text-sm font-medium hover:underline">Xem tất cả</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-xs uppercase font-semibold border-b border-gray-100">
              <th className="pb-3 pl-2">Mã Đơn</th>
              <th className="pb-3">Khách hàng</th>
              <th className="pb-3">Tổng tiền</th>
              <th className="pb-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order, index) => (
              <tr key={index} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                <td className="py-4 pl-2 font-medium text-gray-700">{order.id}</td>
                <td className="py-4 text-gray-600">{order.user}</td>
                <td className="py-4 font-bold text-gray-800">{order.total}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status === 'Delivered' ? 'Đã giao' : 
                     order.status === 'Pending' ? 'Chờ duyệt' :
                     order.status === 'Processing' ? 'Đang xử lý' : 'Đã hủy'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;