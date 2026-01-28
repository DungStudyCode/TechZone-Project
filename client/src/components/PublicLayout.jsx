// client/src/components/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatBot from './ChatBot';

const PublicLayout = () => {
  return (
    <>
      <Navbar /> {/* Navbar chỉ hiện ở Public */}
      
      <div className="flex-1">
        {/* Outlet là nơi nội dung các trang con (Home, Product...) sẽ hiện ra */}
        <Outlet /> 
      </div>

      <ChatBot /> {/* Chatbot cho khách hàng */}
      <Footer /> {/* Footer chỉ hiện ở Public */}
    </>
  );
};

export default PublicLayout;