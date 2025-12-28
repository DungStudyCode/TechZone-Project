// client/src/pages/Home/Careers.jsx
import React from 'react';

const Careers = () => {
  return (
    <div className="container mx-auto px-4 py-12 font-sans">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Tuyển Dụng TechZone</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gia nhập đội ngũ TechZone để cùng kiến tạo tương lai công nghệ. Chúng tôi luôn chào đón những nhân tài đam mê và nhiệt huyết.
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {/* Job 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-purple-700">Nhân viên Tư vấn Bán hàng</h3>
              <p className="text-sm text-gray-500 mt-1">Hà Nội • Full-time • Lương: 10-15 triệu</p>
              <div className="mt-4 text-gray-700 text-sm">
                <p>• Tư vấn sản phẩm công nghệ cho khách hàng.</p>
                <p>• Quản lý và sắp xếp hàng hóa tại showroom.</p>
              </div>
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-600 hover:text-white transition">Ứng tuyển</button>
          </div>
        </div>

        {/* Job 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-purple-700">Kỹ thuật viên Phần cứng</h3>
              <p className="text-sm text-gray-500 mt-1">TP.HCM • Full-time • Lương: 12-18 triệu</p>
              <div className="mt-4 text-gray-700 text-sm">
                <p>• Kiểm tra, sửa chữa và bảo hành Laptop/PC.</p>
                <p>• Hỗ trợ kỹ thuật cho khách hàng.</p>
              </div>
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-600 hover:text-white transition">Ứng tuyển</button>
          </div>
        </div>

        {/* Job 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-purple-700">Content Marketing</h3>
              <p className="text-sm text-gray-500 mt-1">Remote • Part-time • Lương: Thỏa thuận</p>
              <div className="mt-4 text-gray-700 text-sm">
                <p>• Viết bài review sản phẩm công nghệ.</p>
                <p>• Quản lý Fanpage và lên ý tưởng video TikTok.</p>
              </div>
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-600 hover:text-white transition">Ứng tuyển</button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-12 text-gray-500 text-sm">
        Gửi CV về email: <span className="text-purple-600 font-bold">hr@techzone.vn</span>
      </div>
    </div>
  );
};

export default Careers;