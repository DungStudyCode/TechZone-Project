// client/src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaMinus,
  FaCommentDots,
} from "react-icons/fa";
import api from "../services/api"; // Đảm bảo đúng đường dẫn tới file cấu hình axios
import { Link } from "react-router-dom";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Xin chào! TechZone có thể giúp gì cho bạn hôm nay?",
      sender: "bot",
      products: [], // Tin nhắn chào mặc định không có sản phẩm
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: input });

      const botMessage = {
        text: data.reply,
        sender: "bot",
        products: data.products || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // ✅ SỬA LỖI Ở ĐÂY: In lỗi ra console để biến 'error' được sử dụng
      console.error("Lỗi Chatbot:", error);

      setMessages((prev) => [
        ...prev,
        { text: "Lỗi kết nối, vui lòng thử lại!", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM FORMAT TIỀN ---
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans">
      {/* Nút bật tắt Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#724ae8] text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all animate-bounce"
        >
          <FaCommentDots size={28} />
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#724ae8] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <FaRobot className="text-2xl" />
              <div>
                <h3 className="font-bold">Trợ lý TechZone</h3>
                <span className="text-xs text-green-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>{" "}
                  Online
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="hover:text-gray-200"
              >
                <FaMinus />
              </button>
            </div>
          </div>

          {/* Nội dung Chat */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                {/* Bong bóng Chat Text */}
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#724ae8] text-white rounded-br-none"
                      : "bg-white text-gray-700 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* --- KHU VỰC HIỂN THỊ SẢN PHẨM (Chỉ Bot mới có) --- */}
                {msg.sender === "bot" &&
                  msg.products &&
                  msg.products.length > 0 && (
                    <div className="mt-2 w-[85%] space-y-2">
                      <p className="text-xs text-gray-500 font-medium ml-1">
                        Sản phẩm đề xuất:
                      </p>

                      {/* Danh sách thẻ sản phẩm */}
                      <div className="flex flex-col gap-2">
                        {msg.products.map((prod) => (
                          <Link
                            to={`/product/${prod.slug}`}
                            key={prod._id}
                            className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition group"
                          >
                            {/* ẢNH SẢN PHẨM (Clickable) */}
                            <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-100">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                              />
                            </div>

                            {/* THÔNG TIN */}
                            <div className="flex-1 min-w-0">
                              {/* Tên sản phẩm */}
                              <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-[#724ae8]">
                                {prod.name}
                              </h4>

                              {/* KHU VỰC GIÁ & ĐÁNH GIÁ */}
                              <div className="flex items-center gap-2 mt-1">
                                {/* Giá tiền */}
                                <p className="text-xs text-red-500 font-bold">
                                  {formatPrice(prod.price)}
                                </p>

                                {/* ✅ THÊM: Hiển thị Sao (Chỉ hiện nếu rating > 0) */}
                                {prod.rating > 0 && (
                                  <div className="flex items-center gap-0.5 bg-yellow-50 border border-yellow-100 px-1.5 rounded-sm">
                                    <span className="text-[10px] text-yellow-500">
                                      ★
                                    </span>
                                    <span className="text-[10px] font-bold text-yellow-700">
                                      {prod.rating}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Nút xem chi tiết */}
                              <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block hover:bg-blue-100 transition-colors">
                                Xem chi tiết →
                              </span>
                            </div>
                          </Link>
                        ))} 
                      </div>
                    </div>
                  )}
                {/* --- Kết thúc khu vực sản phẩm --- */}
              </div>
            ))}

            {/* Hiệu ứng đang gõ */}
            {loading && (
              <div className="flex items-start">
                <div className="bg-gray-200 p-3 rounded-xl rounded-bl-none text-gray-500 text-xs animate-pulse">
                  Đang tìm sản phẩm...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Nhập liệu */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              className="flex-1 p-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#724ae8]"
              placeholder="Hỏi về sản phẩm..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#724ae8] text-white p-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-300"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
