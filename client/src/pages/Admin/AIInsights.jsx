import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './AIInsights.css'; // File CSS tùy chỉnh

const AIInsights = () => {
  const [reportData, setReportData] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(''); // 'sentiment' hoặc 'strategy'

  // Hàm gọi API lấy phân tích Review
  const fetchSentimentAnalysis = async () => {
    try {
      setLoading(true);
      setActiveTab('sentiment');
      setReportData(''); 
      
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : ''}`,
        },
      };

      const { data } = await axios.get('/api/admin/ai/sentiment', config);
      setReportData(data.analysis);
    } catch (error) {
      // ✅ SỬA LỖI: In lỗi ra console để ESLint không báo nữa
      console.error("Lỗi Sentiment:", error); 
      setReportData('❌ Lỗi: Không thể kết nối tới não bộ AI.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API lấy phân tích Chiến lược
  const fetchStrategyAnalysis = async () => {
    try {
      setLoading(true);
      setActiveTab('strategy');
      setReportData('');
      
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : ''}`,
        },
      };

      const { data } = await axios.get('/api/admin/ai/strategy', config);
      setReportData(data.analysis);
    } catch (error) {
      // ✅ SỬA LỖI: In lỗi ra console
      console.error("Lỗi Strategy:", error);
      setReportData('❌ Lỗi: AI đang bận hoặc hết hạn ngạch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-dashboard-container">
      <h1 className="ai-title">🧠 TechZone AI Brain Center</h1>
      <p className="ai-subtitle">Trợ lý ảo phân tích dữ liệu chuyên sâu cho quản trị viên</p>

      <div className="ai-controls">
        <button 
          className={`btn-ai ${activeTab === 'sentiment' ? 'active' : ''}`}
          onClick={fetchSentimentAnalysis}
          disabled={loading}
        >
          {loading && activeTab === 'sentiment' ? 'Đang đọc Reviews...' : '🔮 Phân Tích & Giữ Chân Khách'}
        </button>

        <button 
          className={`btn-ai ${activeTab === 'strategy' ? 'active' : ''}`}
          onClick={fetchStrategyAnalysis}
          disabled={loading}
        >
          {loading && activeTab === 'strategy' ? 'Đang tính toán...' : '📈 Tư Vấn Chiến Lược Kinh Doanh'}
        </button>
      </div>

      <div className="ai-report-board">
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>AI đang suy nghĩ và viết báo cáo cho bạn...</p>
          </div>
        )}

        {!loading && reportData && (
          <div className="markdown-content">
            <ReactMarkdown>{reportData}</ReactMarkdown>
          </div>
        )}

        {!loading && !reportData && (
          <div className="empty-state">
            <p>Chọn một chức năng bên trên để bắt đầu phân tích.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;