// client/src/pages/Home/Contact.jsx
import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập gửi form
    alert(`Cảm ơn ${formData.name}! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.`);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-gray-500">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Cột Trái: Thông tin liên hệ */}
          <div className="bg-purple-900 text-white p-10 md:w-2/5 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-6">Thông tin liên lạc</h2>
              <p className="text-purple-200 mb-8">
                Hãy để lại tin nhắn hoặc ghé thăm cửa hàng trực tiếp để trải nghiệm sản phẩm.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="mt-1 text-purple-400 text-xl" />
                  <div>
                    <h4 className="font-bold">Địa chỉ</h4>
                    <p className="text-sm opacity-80">31/20 Phạm Quang Ảnh, Quận Sơn Trà, TP-Đà Nẵng</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaPhoneAlt className="mt-1 text-purple-400 text-xl" />
                  <div>
                    <h4 className="font-bold">Hotline</h4>
                    <p className="text-sm opacity-80">0818 284 523 (8:00 - 21:00)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaEnvelope className="mt-1 text-purple-400 text-xl" />
                  <div>
                    <h4 className="font-bold">Email</h4>
                    <p className="text-sm opacity-80">support@techzone.vn</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaClock className="mt-1 text-purple-400 text-xl" />
                  <div>
                    <h4 className="font-bold">Giờ làm việc</h4>
                    <p className="text-sm opacity-80">Thứ 2 - CN: 8:00 - 22:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Icons giả lập */}
            <div className="mt-10">
                <p className="font-bold mb-4">Mạng xã hội</p>
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition">F</div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition">I</div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition">Y</div>
                </div>
            </div>
          </div>

          {/* Cột Phải: Form Điền */}
          <div className="p-10 md:w-3/5">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Họ tên</label>
                  <input 
                    type="text" required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-500 bg-gray-50"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-500 bg-gray-50"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung</label>
                  <textarea 
                    rows="5" required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-500 bg-gray-50"
                    placeholder="Bạn cần hỗ trợ gì..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
              </div>

              <button type="submit" className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition shadow-lg w-full md:w-auto">
                Gửi ngay
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;