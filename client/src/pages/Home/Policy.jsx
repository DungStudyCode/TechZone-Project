// client/src/pages/Home/Policy.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Policy = () => {
  const { hash } = useLocation();

  // Tự động cuộn đến đúng mục khi bấm link (ví dụ: #warranty)
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl font-sans text-gray-700">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Trung Tâm Trợ Giúp</h1>
      
      <div className="space-y-12">
        
        {/* 1. Hướng dẫn mua hàng */}
        <section id="guide" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            🛒 Hướng dẫn mua hàng
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Bước 1:</strong> Tìm kiếm sản phẩm tại ô tìm kiếm hoặc qua danh mục.</li>
            <li><strong>Bước 2:</strong> Chọn sản phẩm ưng ý và bấm "Thêm vào giỏ".</li>
            <li><strong>Bước 3:</strong> Vào giỏ hàng kiểm tra lại số lượng và bấm "Tiến hành thanh toán".</li>
            <li><strong>Bước 4:</strong> Điền thông tin giao hàng và chọn phương thức thanh toán (COD hoặc Chuyển khoản).</li>
            <li><strong>Bước 5:</strong> Bấm "Hoàn tất đặt hàng". Nhân viên sẽ gọi xác nhận trong vòng 15 phút.</li>
          </ul>
        </section>

        {/* 2. Chính sách bảo hành */}
        <section id="warranty" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            🛡️ Chính sách bảo hành
          </h2>
          <p className="mb-4">Tất cả sản phẩm tại TechZone đều là hàng chính hãng và được hưởng chế độ bảo hành đầy đủ:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Điện thoại/Tablet:</strong> Bảo hành 12 tháng, đổi mới trong 30 ngày đầu nếu lỗi NSX.</li>
            <li><strong>Laptop:</strong> Bảo hành 24 tháng, hỗ trợ cài đặt phần mềm trọn đời.</li>
            <li><strong>Phụ kiện:</strong> Bảo hành 6-12 tháng tùy loại.</li>
          </ul>
        </section>

        {/* 3. Vận chuyển & Giao nhận */}
        <section id="shipping" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            🚚 Vận chuyển & Giao nhận
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Nội thành Hà Nội/TP.HCM:</strong> Giao siêu tốc trong 2h.</li>
            <li><strong>Toàn quốc:</strong> Giao hàng qua Viettel Post/Giao Hàng Nhanh (2-4 ngày).</li>
            <li><strong>Phí vận chuyển:</strong> Miễn phí cho đơn hàng &gt; 50.000.000đ. Đơn dưới tính phí 30.000đ.</li>
            <li>Khách hàng được phép <strong>kiểm tra hàng (đồng kiểm)</strong> trước khi thanh toán.</li>
          </ul>
        </section>

        {/* 4. Phương thức thanh toán */}
        <section id="payment" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            💳 Phương thức thanh toán
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>COD (Thanh toán khi nhận hàng):</strong> Áp dụng toàn quốc.</li>
            <li><strong>Chuyển khoản ngân hàng:</strong> Giảm ngay 1% khi thanh toán trước.</li>
            <li><strong>Trả góp 0%:</strong> Qua thẻ tín dụng (Visa/Mastercard).</li>
          </ul>
        </section>

      </div>
    </div>
  );
};

export default Policy;