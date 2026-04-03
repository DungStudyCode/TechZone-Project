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
import Wishlist from "./pages/Product/Wishlist"; // <-- THÊM DÒNG NÀY
import Support from "./pages/Support/Support"; // <-- THÊM DÒNG NÀY

// ✅ IMPORT CÁC TRANG THU MUA VÀ MESSENGER VỪA TẠO
import ThuMuaPage from "./pages/ThuMua/ThuMuaPage";
import PostDetailPage from "./pages/ThuMua/PostDetailPage"; 
import MessengerPage from "./pages/ThuMua/MessengerPage"; // <-- THÊM DÒNG NÀY
import MyOrders from "./pages/Cart/MyOrders"; // <-- THÊM DÒNG NÀY
import ScrollToTop from "./components/ScrollToTop";
import OrderDetail from "./pages/Order/OrderDetail"; // <-- THÊM DÒNG NÀY

// --- ADMIN ---
import Dashboard from "./pages/Admin/Dashboard"; 
import ProductList from "./pages/Admin/ProductList"; 
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminProductForm from "./pages/Admin/AdminProductForm"; 
import AIInsights from "./pages/Admin/AIInsights";
import AdminUserList from "./pages/Admin/AdminUserList"; 

// LƯU Ý: LAYOUT DÀNH CHO KHÁCH HÀNG (Có Footer + Chatbot)
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
      {/* COMPONENT NÀY SẼ ĐƯỢC RENDER Ở MỌI TRANG, NÊN ĐƯỢC ĐẶT Ở NGOÀI CÙNG */}
      <ScrollToTop /> {/* Đảm bảo cuộn lên đầu trang mỗi khi chuyển trang */}
      <div className="bg-gray-100 min-h-screen flex flex-col font-sans">
        
        {/* NAVBAR ĐỂ Ở NGOÀI CÙNG (Hiện trên TẤT CẢ các trang) */}
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
              <Route path="/support" element={<Support />} /> {/* <-- THÊM DÒNG NÀY */}
           
              {/* ✅ CỤM TÍNH NĂNG CHỢ THU MUA */}
              <Route path="/thu-mua" element={<ThuMuaPage />} />
              <Route path="/thu-mua/post/:id" element={<PostDetailPage />} /> 
              <Route path="/messenger" element={<MessengerPage />} /> {/* <-- ĐÃ GẮN VÀO ĐÂY */}
              <Route path="/my-orders" element={<MyOrders />} /> {/* <-- ĐÃ GẮN VÀO ĐÂY */}
              <Route path="/wishlist" element={<Wishlist />} /> {/* <-- ĐÃ GẮN VÀO ĐÂY */}
              <Route path="/order/:id" element={<OrderDetail />} />
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
              <Route path="users" element={<AdminUserList />} />
            </Route>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;