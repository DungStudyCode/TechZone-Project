// clent/src/pages/Auth/PinUnlock.jsx
import React, { useState } from 'react';
import { FaFingerprint, FaBackspace } from 'react-icons/fa';

const PinUnlock = ({ onSuccess }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  // Mã PIN giả lập (Thực tế bạn sẽ gọi API)
  const CORRECT_PIN = "2026"; 

  // ✅ CHUYỂN LOGIC KIỂM TRA TỪ useEffect VÀO ĐÂY
  const handlePadClick = (number) => {
    // Ngăn chặn nhập thêm nếu đang rung báo lỗi hoặc đã đủ 4 số
    if (pin.length >= 4 || error) return;

    const newPin = pin + number;
    setPin(newPin);

    // Kiểm tra ngay khi người dùng bấm đủ số thứ 4
    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        onSuccess(); // Gọi hàm callback thành công
      } else {
        setError(true); // Bật trạng thái lỗi (rung đỏ)
        
        // Chờ 0.5s rồi reset lại
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    // Chỉ cho xóa khi không bị lỗi
    if (!error) {
      setPin(pin.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
          <FaFingerprint size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">Nhập mã PIN</h2>
        <p className="text-sm text-gray-500 mb-8 text-center">Xác thực để truy cập hệ thống TechZone</p>

        {/* CÁC CHẤM TRÒN PIN */}
        <div className={`flex gap-4 mb-10 ${error ? 'animate-bounce' : ''}`}>
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < pin.length ? 'bg-purple-600 scale-110' : error ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* BÀN PHÍM SỐ */}
        <div className="grid grid-cols-3 gap-6 w-full px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button 
              key={num} 
              onClick={() => handlePadClick(num.toString())}
              className="w-16 h-16 rounded-full bg-gray-50 text-2xl font-medium text-gray-800 hover:bg-purple-100 hover:text-purple-600 transition-colors mx-auto"
            >
              {num}
            </button>
          ))}
          <div /> {/* Ô trống góc trái */}
          <button 
            onClick={() => handlePadClick("0")}
            className="w-16 h-16 rounded-full bg-gray-50 text-2xl font-medium text-gray-800 hover:bg-purple-100 hover:text-purple-600 transition-colors mx-auto"
          >
            0
          </button>
          <button 
            onClick={handleDelete}
            className="w-16 h-16 rounded-full text-2xl font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center mx-auto"
          >
            <FaBackspace />
          </button>
        </div>
        
        <button className="mt-8 text-sm text-purple-600 font-bold hover:underline">Quên mã PIN?</button>
      </div>
    </div>
  );
};

export default PinUnlock;