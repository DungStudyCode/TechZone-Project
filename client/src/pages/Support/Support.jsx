import React, { useState } from "react";
import { 
  FaSearch, FaShippingFast, FaShieldAlt, FaUndo, FaQuestionCircle, 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaChevronDown, FaPaperPlane 
} from "react-icons/fa";

const Support = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      q: "TechZone có giao hàng trong ngày không?",
      a: "Dạ có! Với các đơn hàng nội thành Hà Nội và TP.HCM, chúng tôi hỗ trợ giao nhanh trong 2h-4h kể từ khi xác nhận đơn hàng."
    },
    {
      q: "Chính sách bảo hành iPhone tại TechZone như thế nào?",
      a: "Tất cả iPhone chính hãng tại TechZone được bảo hành 12 tháng theo tiêu chuẩn Apple Việt Nam. Ngoài ra, chúng tôi tặng gói bảo hành 1 đổi 1 trong 30 ngày đầu nếu có lỗi phần cứng."
    },
    {
      q: "Tôi có được kiểm tra hàng trước khi thanh toán không?",
      a: "Hoàn toàn được! Bạn có quyền mở hộp kiểm tra ngoại quan sản phẩm trước khi thanh toán cho Shipper để đảm bảo hàng không móp méo, trầy xước."
    },
    {
      q: "TechZone có hỗ trợ trả góp 0% không?",
      a: "Chúng tôi hỗ trợ trả góp 0% qua thẻ tín dụng của hơn 20 ngân hàng phổ biến hoặc trả góp qua các công ty tài chính như Home Credit, FE Credit."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* 1. HERO SECTION: SEARCH */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            TechZone có thể giúp gì cho bạn?
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input 
              type="text" 
              placeholder="Nhập vấn đề bạn đang gặp phải (ví dụ: Bảo hành, Giao hàng...)"
              className="w-full py-5 pl-14 pr-6 rounded-2xl shadow-2xl outline-none text-lg font-medium focus:ring-4 focus:ring-white/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10">
        
        {/* 2. QUICK CATEGORIES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: <FaShippingFast />, title: "Vận chuyển", desc: "Theo dõi & Phí ship", color: "text-blue-500 bg-blue-50" },
            { icon: <FaShieldAlt />, title: "Bảo hành", desc: "Chính sách hậu mãi", color: "text-purple-500 bg-purple-50" },
            { icon: <FaUndo />, title: "Đổi trả", desc: "Quy trình hoàn tiền", color: "text-red-500 bg-red-50" },
            { icon: <FaQuestionCircle />, title: "Hướng dẫn", desc: "Cách thức mua hàng", color: "text-green-500 bg-green-50" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-xl transition-all cursor-pointer group">
              <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 3. FAQ SECTION (Accordion) */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
              Câu hỏi thường gặp
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <button 
                    onClick={() => toggleFAQ(idx)}
                    className="w-full p-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-gray-700">{faq.q}</span>
                    <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${activeIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${activeIndex === idx ? 'max-h-40 border-t border-gray-50' : 'max-h-0'}`}>
                    <p className="p-5 text-gray-500 leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. CONTACT SECTION */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-black text-gray-800 mb-6">Liên hệ trực tiếp</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Hotline 24/7</p>
                    <p className="font-bold text-gray-800 text-lg">0818 284 523</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email hỗ trợ</p>
                    <p className="font-bold text-gray-800">support@techzone.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Trụ sở chính</p>
                    <p className="font-bold text-gray-800 text-sm leading-relaxed">Sơn Trà, TP-Đà Nẵng</p>
                  </div>
                </div>

                <hr className="border-gray-50 my-6" />

                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaPaperPlane className="text-purple-600 text-sm" /> Gửi tin nhắn nhanh
                  </h4>
                  <input type="email" placeholder="Email của bạn" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 mb-3 outline-none focus:border-purple-400" />
                  <textarea placeholder="Bạn cần giúp gì?" rows="3" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 mb-4 outline-none focus:border-purple-400"></textarea>
                  <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-100">
                    Gửi yêu cầu
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Support;