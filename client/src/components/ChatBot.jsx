import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // Hook lấy thông tin User
import { useLocation, useParams } from "react-router-dom"; // Hook lấy URL
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa"; // Icon
import "./ChatBot.css"; // Import file CSS vừa tạo

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false); // Trạng thái đóng/mở
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Chào bạn! Mình là AI TechZone. Mình có thể giúp bạn tìm sản phẩm hoặc tư vấn kỹ thuật ạ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy ngữ cảnh hệ thống
  const { user } = useAuth(); // Lấy user đã đăng nhập
  const location = useLocation(); // Lấy đường dẫn hiện tại (ví dụ: /product/123)
  const { id } = useParams(); // Lấy ID sản phẩm từ URL (nếu có)

  // Ref để tự cuộn xuống cuối chat
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Hiển thị tin nhắn User ngay lập tức
    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // 2. Chuẩn bị "Ngữ cảnh" (Context) để gửi cho AI
      // AI cần biết khách đang đứng ở đâu để tư vấn đúng chỗ
      const contextData = {
        currentUrl: location.pathname,
        productId: location.pathname.includes("/product/") ? id : null,
      };

      // 3. Gọi API Backend (Route bạn vừa tạo ở bước trước)
      // ✅ Code mới (Chỉ định rõ Server Backend)
      const { data } = await axios.post(
        "http://localhost:5000/api/ai/client/chat",
        {
          message: userMsg,
          userId: user ? user._id : null,
          context: contextData,
        },
      );

      // 4. Hiển thị câu trả lời của AI
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "😓 Xin lỗi, server AI đang quá tải. Bạn thử lại sau nhé!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Nút tròn nổi (Chỉ hiện khi Chat đóng) */}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <FaRobot className="icon-bounce" />
        </button>
      )}

      {/* Cửa sổ Chat (Chỉ hiện khi Chat mở) */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="flex items-center gap-2">
              <FaRobot style={{ fontSize: "20px" }} />
              <span>Trợ lý ảo TechZone</span>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          {/* Nội dung Chat */}
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <span className="typing-dot">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <form onSubmit={handleSend} className="chatbot-footer">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bạn cần hỗ trợ gì..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
