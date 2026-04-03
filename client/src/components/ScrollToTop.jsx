// client\src\components\ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Lấy ra đường dẫn hiện tại (ví dụ: /product/iphone-15)
  const { pathname } = useLocation();

  useEffect(() => {
    // Mỗi khi đường dẫn thay đổi, ra lệnh cho trình duyệt cuộn lên tọa độ x:0, y:0
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Thêm hiệu ứng cuộn mượt mà (có thể bỏ đi nếu muốn cuộn tức thì)
    });
  }, [pathname]);

  return null; // Component này chạy ngầm, không in ra giao diện gì cả
};

export default ScrollToTop;