// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Navbar có thể thêm sau
import Home from './pages/Home/Home';
import ProductDetail from './pages/Product/ProductDetail'; // Import trang chi tiết sản phẩm
import Cart from './pages/Cart/Cart'; // Import trang giỏ hàng
import Checkout from './pages/Cart/Checkout'; // Import trang thanh toán
import AdminOrders from './pages/Admin/AdminOrders';// Import trang quản lý đơn hàng
import Login from './pages/Auth/Login'; // Import trang đăng nhập


function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen pb-10 font-sans">
        
        <Navbar /> {/* <-- Navbar luôn hiển thị */}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} /> {/* <-- Route mới */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;