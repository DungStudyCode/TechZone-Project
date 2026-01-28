// client/src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// --- COMPONENTS ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatBot from './components/ChatBot';
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout"; 

// --- CÁC TRANG ---
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

// --- ADMIN ---
import Dashboard from "./pages/Admin/Dashboard"; 
import ProductList from "./pages/Admin/ProductList"; 
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminProductForm from "./pages/Admin/AdminProductForm"; 
import AIInsights from "./pages/Admin/AIInsights";

// ✅ 1. TẠO LAYOUT RIÊNG CHO KHÁCH HÀNG (Có Footer + Chatbot)
const PublicLayoutWithFooter = () => {
  return (
    <>
      <div className="flex-1">
        <Outlet /> {/* Nội dung trang (Home, Products...) */}
      </div>
      <ChatBot />
      <Footer /> {/* Footer chỉ nằm ở đây */}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen flex flex-col font-sans">
        
        {/* ✅ 2. NAVBAR ĐỂ Ở NGOÀI CÙNG (Hiện trên TẤT CẢ các trang, kể cả Admin) */}
        <Navbar />

        <Routes>
            {/* =========================================
                GROUP 1: TRANG KHÁCH HÀNG (Có Footer)
            ========================================= */}
            <Route element={<PublicLayoutWithFooter />}>
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
            </Route>

            {/* =========================================
                GROUP 2: TRANG ADMIN (Không có Footer)
            ========================================= */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="product/create" element={<AdminProductForm />} />
              <Route path="product/:id/edit" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="ai-insights" element={<AIInsights />} />
              <Route path="users" element={<div><h2>Quản lý khách hàng</h2></div>} />
            </Route>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;