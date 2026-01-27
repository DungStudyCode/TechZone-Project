// client/src/pages/Admin/AIInsights.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaUserFriends, FaChartLine, FaRobot, FaLightbulb } from 'react-icons/fa';

const AIInsights = () => {
  const [analysisResult, setAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(""); // 'customer' hoặc 'strategy'

  // Hàm gọi API
  const handleAnalyze = async (type) => {
    setLoading(true);
    setActiveTab(type);
    setAnalysisResult(""); // Xóa kết quả cũ để hiện loading

    try {
      // 1. Lấy Token Admin từ LocalStorage
      const userInfo = localStorage.getItem("userInfo") 
        ? JSON.parse(localStorage.getItem("userInfo")) 
        : null;

      if (!userInfo || !userInfo.token) {
        alert("Vui lòng đăng nhập quyền Admin!");
        return;
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json"
        }
      };

      // 2. Chọn URL API dựa trên nút bấm
      let url = "";
      if (type === 'customer') url = "http://localhost:5000/api/ai/admin/analyze-customer";
      if (type === 'strategy') url = "http://localhost:5000/api/ai/admin/analyze-strategy";

      // 3. Gọi Backend
      const { data } = await axios.post(url, {}, config);
      setAnalysisResult(data.analysis);
      
    } catch (error) {
      console.error(error);
      const errMessage = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      setAnalysisResult("❌ Lỗi: " + errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
       {/* Header */}
       <div className="text-center mb-10">
         <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
            <FaRobot className="text-[#724ae8] text-3xl" />
         </div>
         <h2 className="text-3xl font-bold text-gray-800">TechZone AI Brain Center</h2>
         <p className="text-gray-500 mt-2">Trợ lý ảo phân tích dữ liệu chuyên sâu dành cho Quản trị viên</p>
       </div>

       {/* Các nút chức năng */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <button 
           onClick={() => handleAnalyze('customer')}
           disabled={loading}
           className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg
             ${activeTab === 'customer' 
               ? 'border-[#724ae8] bg-[#fdfaff]' 
               : 'border-gray-100 bg-white hover:border-purple-200'}
           `}
         >
           <div className="flex items-center gap-4">
             <div className={`p-4 rounded-xl ${activeTab === 'customer' ? 'bg-[#724ae8] text-white' : 'bg-purple-50 text-[#724ae8]'}`}>
               <FaUserFriends className="text-2xl" />
             </div>
             <div className="text-left">
               <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#724ae8] transition-colors">Phân Tích Khách Hàng</h3>
               <p className="text-sm text-gray-500">Đánh giá cảm xúc & Gợi ý giữ chân</p>
             </div>
           </div>
         </button>

         <button 
           onClick={() => handleAnalyze('strategy')}
           disabled={loading}
           className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg
             ${activeTab === 'strategy' 
               ? 'border-[#724ae8] bg-[#fdfaff]' 
               : 'border-gray-100 bg-white hover:border-purple-200'}
           `}
         >
           <div className="flex items-center gap-4">
             <div className={`p-4 rounded-xl ${activeTab === 'strategy' ? 'bg-[#724ae8] text-white' : 'bg-blue-50 text-blue-600'}`}>
               <FaChartLine className="text-2xl" />
             </div>
             <div className="text-left">
               <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#724ae8] transition-colors">Chiến Lược Kinh Doanh</h3>
               <p className="text-sm text-gray-500">Xu hướng doanh thu & Nhập hàng</p>
             </div>
           </div>
         </button>
       </div>

       {/* Khu vực hiển thị kết quả */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
         {/* Tiêu đề khung kết quả */}
         <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
           <span className="font-semibold text-gray-700 flex items-center gap-2">
             <FaLightbulb className="text-yellow-500" /> 
             {activeTab === 'customer' ? 'Báo cáo Phân tích Khách hàng' : 
              activeTab === 'strategy' ? 'Báo cáo Chiến lược Kinh doanh' : 'Kết quả Phân tích'}
           </span>
           {loading && <span className="text-xs text-[#724ae8] font-medium animate-pulse">AI đang suy nghĩ...</span>}
         </div>

         <div className="p-8">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-64 space-y-4">
               <div className="w-12 h-12 border-4 border-[#724ae8] border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-400">Đang đọc dữ liệu từ Database & Tổng hợp...</p>
             </div>
           ) : analysisResult ? (
             <div className="prose max-w-none">
               {/* Hiển thị văn bản có xuống dòng */}
               <div className="text-gray-800 leading-relaxed whitespace-pre-line font-medium text-base">
                 {analysisResult}
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400 opacity-60">
               <FaRobot className="text-8xl mb-4 text-gray-200" />
               <p>Chọn một chức năng bên trên để bắt đầu.</p>
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

export default AIInsights;