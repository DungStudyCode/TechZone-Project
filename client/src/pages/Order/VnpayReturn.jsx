// client/src/pages/Order/VnpayReturn.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';

const VnpayReturn = () => {
  // Trạng thái: 'loading' (đang xử lý), 'success' (thành công), 'fail' (thất bại)
  const [status, setStatus] = useState('loading'); 
  const location = useLocation();

useEffect(() => {
    const verifyPayment = async () => {
      // ✅ CHUYỂN ĐIỀU KIỆN KIỂM TRA VÀO BÊN TRONG HÀM ASYNC NÀY
      if (!location.search) {
        setStatus('fail');
        return; // Dừng luôn, không chạy API bên dưới nữa
      }

      try {
        const { data } = await api.get(`/payment/vnpay_return${location.search}`);
        
        if (data.code === '00') {
          setStatus('success');
        } else {
          setStatus('fail');
        }
      } catch (error) {
        console.error('Lỗi xác thực thanh toán VNPay:', error);
        setStatus('fail');
      }
    };

    // Chỉ việc gọi hàm ở đây, code cực kỳ gọn gàng và ESLint sẽ hết kêu!
    verifyPayment();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-5xl text-purple-600 mb-6" />
            <h2 className="text-2xl font-black text-gray-800 mb-2">Đang xác thực...</h2>
            <p className="text-gray-500 text-sm">Vui lòng không đóng trình duyệt, hệ thống đang kiểm tra giao dịch với ngân hàng.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <FaCheckCircle className="text-5xl" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-500 text-sm mb-8">
              Cảm ơn bạn đã mua sắm tại TechZone. Đơn hàng của bạn đã được thanh toán và đang được chờ xử lý.
            </p>
            <Link 
              to="/my-orders" 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
            >
              Xem đơn hàng của bạn <FaArrowRight />
            </Link>
          </div>
        )}

        {status === 'fail' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <FaTimesCircle className="text-5xl" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Giao dịch thất bại</h2>
            <p className="text-gray-500 text-sm mb-8">
              Thanh toán bị hủy hoặc đã xảy ra sự cố. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
            </p>
            <Link 
              to="/cart" 
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
            >
              Quay lại Giỏ hàng
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VnpayReturn;