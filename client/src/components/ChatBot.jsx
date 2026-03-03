// client/src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaMinus,
  FaCommentDots,
} from "react-icons/fa";
import api from "../services/api"; 
import { Link } from "react-router-dom";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Xin chào! TechZone có thể giúp gì cho bạn hôm nay?",
      sender: "bot",
      products: [], 
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
      console.error("Lỗi khi gọi Chatbot:", error);

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
        <div className="w-[350px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
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
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none leading-relaxed"
                  }`}
                >
                  {/* Render HTML để hiển thị link <a> cho bot */}
                  {msg.sender === "bot" ? (
                    <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>

                {/* --- KHU VỰC HIỂN THỊ SẢN PHẨM --- */}
                {msg.sender === "bot" &&
                  msg.products &&
                  msg.products.length > 0 && (
                    <div className="mt-3 w-[90%] space-y-2">
                      <p className="text-xs text-gray-500 font-medium ml-1">
                        Sản phẩm tham khảo:
                      </p>

                      {/* Danh sách thẻ sản phẩm (Giao diện mới: Ảnh to, dễ click) */}
                      <div className="flex flex-col gap-3">
                        {msg.products.map((prod) => (
                          <Link
                            to={`/product/${prod.slug}`}
                            key={prod._id}
                            className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#724ae8] overflow-hidden transition-all group"
                          >
                            {/* ẢNH SẢN PHẨM */}
                            <div className="w-full h-36 bg-gray-50 p-2 flex justify-center items-center border-b border-gray-100 relative">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                              {/* Lớp overlay hiện chữ Mua ngay khi di chuột vào ảnh */}
                              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-[#724ae8] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                                  Xem chi tiết
                                </span>
                              </div>
                            </div>

                            {/* THÔNG TIN */}
                            <div className="p-3">
                              <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#724ae8]">
                                {prod.name}
                              </h4>

                              <div className="flex items-center justify-between mt-2">
                                <p className="text-sm text-red-600 font-bold">
                                  {formatPrice(prod.price)}
                                </p>

                                {/* Hiển thị Sao */}
                                {prod.rating > 0 && (
                                  <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                                    <span className="text-[10px] text-yellow-500">
                                      ★
                                    </span>
                                    <span className="text-xs font-bold text-yellow-700">
                                      {prod.rating}
                                    </span>
                                  </div>
                                )}
                              </div>
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