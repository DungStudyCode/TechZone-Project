// client/src/pages/Home/About.jsx
import React from 'react';
import { FaAward, FaUsers, FaThumbsUp, FaTruck } from 'react-icons/fa';

const About = () => {
  return (
    <div className="font-sans text-gray-700">
      
      {/* 1. Hero Section */}
      <div className="bg-purple-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về TechZone</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Điểm đến tin cậy cho những tín đồ công nghệ. Chúng tôi không chỉ bán sản phẩm, chúng tôi mang đến trải nghiệm tương lai.
          </p>
        </div>
      </div>

      {/* 2. Câu chuyện thương hiệu */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            {/* ĐÃ THAY ĐỔI LINK ẢNH MỚI TẠI ĐÂY */}
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
              alt="Our Story" 
              className="rounded-xl shadow-2xl w-full object-cover h-[400px]"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Câu chuyện của chúng tôi</h2>
            <p className="mb-4 leading-relaxed">
              Thành lập năm 2025, TechZone bắt đầu với một sứ mệnh đơn giản: Làm cho công nghệ cao cấp trở nên dễ tiếp cận với mọi người Việt Nam. Từ một cửa hàng nhỏ tại TP-Đà Nẵng, chúng tôi đã phát triển thành hệ thống bán lẻ uy tín.
            </p>
            <p className="mb-4 leading-relaxed">
              Chúng tôi cam kết chỉ cung cấp những sản phẩm chính hãng, chất lượng nhất từ các thương hiệu hàng đầu thế giới như Apple, Samsung, Sony, ASUS...
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="border p-4 rounded-lg text-center">
                <h3 className="text-3xl font-bold text-purple-600">1+</h3>
                <p className="text-sm">Năm kinh nghiệm</p>
              </div>
              <div className="border p-4 rounded-lg text-center">
                <h3 className="text-3xl font-bold text-purple-600">10k+</h3>
                <p className="text-sm">Khách hàng hài lòng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Giá trị cốt lõi */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn TechZone?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FaAward />
              </div>
              <h3 className="font-bold mb-2">Chất lượng số 1</h3>
              <p className="text-sm text-gray-500">Cam kết 100% hàng chính hãng, nguyên seal, bảo hành đầy đủ.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FaThumbsUp />
              </div>
              <h3 className="font-bold mb-2">Giá cả cạnh tranh</h3>
              <p className="text-sm text-gray-500">Luôn có mức giá tốt nhất thị trường kèm nhiều ưu đãi hấp dẫn.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FaTruck />
              </div>
              <h3 className="font-bold mb-2">Giao hàng siêu tốc</h3>
              <p className="text-sm text-gray-500">Giao hàng nội thành trong 2h, miễn phí vận chuyển toàn quốc.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FaUsers />
              </div>
              <h3 className="font-bold mb-2">Hỗ trợ tận tâm</h3>
              <p className="text-sm text-gray-500">Đội ngũ kỹ thuật viên giàu kinh nghiệm, hỗ trợ 24/7.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;