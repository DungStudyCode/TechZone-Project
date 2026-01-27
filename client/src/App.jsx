// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
// --- COMPONENTS CHUNG ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatBot from './components/ChatBot';
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout"; 

// --- CÁC TRANG CÔNG KHAI ---
import Home from "./pages/Home/Home";
import Products from "./pages/Product/Products";
import ProductDetail from "./pages/Product/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Cart/Checkout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Auth/Profile";
import About from "./pages/Home/About";
import Contact from "./pages/Home/Contact";
import Policy from "./pages/Home/Policy";

// --- CÁC TRANG ADMIN ---
import Dashboard from "./pages/Admin/Dashboard"; 
import ProductList from "./pages/Admin/ProductList"; 
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminProductForm from "./pages/Admin/AdminProductForm"; // Form dùng chung cho Create/Edit
import AIInsights from "./pages/Admin/AIInsights";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen flex flex-col font-sans">
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* =========================================
                KHU VỰC KHÁCH HÀNG (PUBLIC)
            ========================================= */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/policy" element={<Policy />} />

            {/* =========================================
                KHU VỰC QUẢN TRỊ (ADMIN)
            ========================================= */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              {/* Trang chủ Admin */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Quản lý Sản phẩm */}
              <Route path="products" element={<ProductList />} />
              
              {/* ✅ ĐÃ SỬA: Đổi 'product/new' thành 'product/create' để khớp với URL */}
              <Route path="product/create" element={<AdminProductForm />} />
              
              <Route path="product/:id/edit" element={<AdminProductForm />} />

              {/* Quản lý Đơn hàng */}
              <Route path="orders" element={<AdminOrders />} />

              {/* Các tính năng khác */}
              <Route path="ai-insights" element={<AIInsights />} />

              <Route path="users" element={<div><h2>Quản lý khách hàng (Coming Soon)</h2></div>} />
            </Route>

          </Routes>
          
          <ChatBot />
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;