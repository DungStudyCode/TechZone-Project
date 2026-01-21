// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home/Home";
import ProductDetail from "./pages/Product/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Cart/Checkout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Auth/Profile";
import About from "./pages/Home/About";
import Contact from "./pages/Home/Contact";
import Policy from "./pages/Home/Policy";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import ChatBot from './components/ChatBot';

// --- 1. THÊM IMPORT NÀY (BẮT BUỘC) ---
import Products from "./pages/Product/Products";

// --- CÁC COMPONENT ADMIN ---
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminProductForm from "./pages/Admin/AdminProductForm";
import AIInsights from "./pages/admin/AIInsights";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen flex flex-col font-sans">
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* --- CÁC TRANG CÔNG KHAI --- */}
            <Route path="/" element={<Home />} />

            {/* --- 2. THÊM ROUTE NÀY VÀO ĐÂY --- */}
            {/* Khi đường dẫn là /products thì hiển thị trang Products */}
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

            {/* --- CÁC TRANG ADMIN --- */}
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/product/new"
              element={
                <AdminRoute>
                  <AdminProductForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/product/:id/edit"
              element={
                <AdminRoute>
                  <AdminProductForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/ai-insights"
              element={
                <AdminRoute>
                  <AIInsights />
                </AdminRoute>
              }
            />
            
          </Routes>
          
          <ChatBot />
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
