import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; 
import { useLocation, useParams } from "react-router-dom"; 
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa"; 

// ❌ Không cần import ChatBot.css nữa
// import "./ChatBot.css"; 

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Chào bạn! Mình là AI TechZone. Mình có thể giúp bạn tìm sản phẩm hoặc tư vấn kỹ thuật ạ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Hooks hệ thống
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const contextData = {
        currentUrl: location.pathname,
        productId: location.pathname.includes("/product/") ? id : null,
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/ai/client/chat",
        {
          message: userMsg,
          userId: user ? user._id : null,
          context: contextData,
        }
      );

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
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      
      {/* NÚT MỞ CHAT (Tròn) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#724ae8] hover:bg-[#5f3dc4] text-white rounded-full shadow-xl flex items-center justify-center text-2xl transition-all hover:scale-110 animate-bounce"
        >
          <FaRobot />
        </button>
      )}

      {/* CỬA SỔ CHAT */}
      {isOpen && (
        <div className="w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-[#724ae8] p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <FaRobot className="text-xl" />
              <span>Trợ lý ảo TechZone</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Nội dung Chat */}
          <div className="flex-1 p-4 bg-gray-50 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                    msg.sender === "user"
                      ? "bg-[#724ae8] text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Hiệu ứng đang gõ... */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bạn cần hỗ trợ gì..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-[#724ae8] focus:ring-1 focus:ring-[#724ae8] rounded-full outline-none text-sm transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-[#724ae8] hover:bg-[#5f3dc4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <FaPaperPlane className="text-sm ml-[-2px] mt-[1px]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;