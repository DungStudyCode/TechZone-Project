// client/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 font-sans border-t border-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Cột 1: Thông tin chung */}
        <div>
          <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
             <span className="bg-purple-600 text-white px-2 rounded">TZ</span> TechZone
          </h3>
          <p className="text-sm mb-4 leading-relaxed opacity-80">
            Hệ thống bán lẻ thiết bị công nghệ chính hãng hàng đầu Việt Nam. Chất lượng - Uy tín - Tận tâm.
          </p>
          <div className="flex gap-4">
             <a href="#" className="hover:text-purple-400 transition"><FaFacebook size={20}/></a>
             <a href="#" className="hover:text-pink-400 transition"><FaInstagram size={20}/></a>
             <a href="#" className="hover:text-red-500 transition"><FaYoutube size={20}/></a>
          </div>
        </div>

        {/* Cột 2: Về chúng tôi (Đã gắn link) */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Về chúng tôi</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-purple-400 transition">Giới thiệu công ty</Link></li>
            <li><Link to="/careers" className="hover:text-purple-400 transition">Tuyển dụng</Link></li>
            <li><Link to="/contact" className="hover:text-purple-400 transition">Gửi góp ý, khiếu nại</Link></li>
            <li><Link to="/contact" className="hover:text-purple-400 transition">Tìm siêu thị</Link></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ khách hàng (Link đến các phần của trang Policy) */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/policy#guide" className="hover:text-purple-400 transition">Hướng dẫn mua hàng</Link></li>
            <li><Link to="/policy#warranty" className="hover:text-purple-400 transition">Chính sách bảo hành</Link></li>
            <li><Link to="/policy#shipping" className="hover:text-purple-400 transition">Vận chuyển & Giao nhận</Link></li>
            <li><Link to="/policy#payment" className="hover:text-purple-400 transition">Phương thức thanh toán</Link></li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Liên hệ</h4>
          <ul className="space-y-3 text-sm">
             <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-purple-500"/>
                <span>31/20 Phạm Quang Ảnh, Quận Sơn Trà, TP-Đà Nẵng</span>
             </li>
             <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-purple-500"/>
                <span>0818 284 523</span>
             </li>
             <li className="flex items-center gap-3">
                <FaEnvelope className="text-purple-500"/>
                <span>support@techzone.vn</span>
             </li>
          </ul>
        </div>

      </div>
      
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm opacity-60">
        &copy; {new Date().getFullYear()} TechZone. All rights reserved. Designed by DungStudyCode.
      </div>
    </footer>
  );
};

export default Footer;