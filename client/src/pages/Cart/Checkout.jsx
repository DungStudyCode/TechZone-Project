import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext'; // Kiểm tra lại đường dẫn nếu file bạn nằm chỗ khác
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Hàm format tiền tệ
const formatPrice = (price) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const Checkout = () => {
  // SỬA LỖI: Đổi cconst thành const
  // Lấy thêm hàm clearCart từ context để xóa giỏ sau khi mua
  const { cartItems, clearCart } = useCart(); 
  const navigate = useNavigate();

  // State lưu thông tin form
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: ''
  });

  // Tính lại tổng tiền
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Chuẩn bị dữ liệu gửi lên Server
    const orderData = {
      customerInfo: formData,
      orderItems: cartItems.map(item => ({
        product: item._id || item.product, // ID sản phẩm gốc
        name: item.productName,
        image: item.image || item.productImage,
        price: item.price,
        qty: item.quantity,
        sku: item.sku,
        color: item.color,
        storage: item.storage
      })),
      totalPrice: totalPrice
    };

    try {
      const res = await api.post('/orders', orderData);
      
      if (res.status === 201) {
        alert("Đặt hàng thành công! Mã đơn: " + res.data._id);
        
        // LOGIC QUAN TRỌNG:
        if (typeof clearCart === 'function') {
           clearCart(); // 1. Xóa giỏ hàng
        } else {
           // Fallback nếu bạn chưa kịp update CartContext
           localStorage.removeItem('cartItems');
           window.location.reload(); 
        }

        navigate("/"); // 2. Chuyển hướng về trang chủ
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi đặt hàng: " + (error.response?.data?.message || error.message));
    }
  };

  if (cartItems.length === 0) return <div className="text-center mt-10 text-xl">Giỏ hàng trống!</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Xác nhận đơn hàng</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* FORM THÔNG TIN */}
        <div className="md:w-1/2 bg-white p-6 rounded shadow">
          <h3 className="font-bold text-lg mb-4">Thông tin giao hàng</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 font-medium">Họ tên</label>
              <input type="text" name="name" required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Email</label>
              <input type="email" name="email" required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Số điện thoại</label>
              <input type="text" name="phone" required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Địa chỉ nhận hàng</label>
              <textarea name="address" required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" rows="3" onChange={handleChange}></textarea>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition duration-200">
              XÁC NHẬN ĐẶT HÀNG
            </button>
          </form>
        </div>

        {/* TÓM TẮT ĐƠN HÀNG */}
        <div className="md:w-1/2 bg-gray-50 p-6 rounded border h-fit">
          <h3 className="font-bold text-lg mb-4">Đơn hàng của bạn</h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm border-b pb-2 last:border-0">
                <div>
                    <span className="font-medium">{item.productName}</span> 
                    <div className="text-xs text-gray-500">x{item.quantity} | {item.color}</div>
                </div>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-xl text-red-600">
            <span>Tổng cộng:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;