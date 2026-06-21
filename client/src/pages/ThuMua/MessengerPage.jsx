// client/src/pages/ThuMua/MessengerPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react"; 
import { toast } from "react-toastify"; 
import {
  FaPaperPlane,
  FaArrowLeft,
  FaImage,
  FaSmile,
  FaCheckCircle,
  FaCheckDouble,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";

const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/'|"/g, "").replace(/\/api\/?$/, "");
  return "https://api.techzoneshop.online";
};

const socket = io(getSocketUrl(), { transports: ["websocket", "polling"] });

const NOTIFICATION_SOUND_URL = 'https://actions.google.com/sounds/v1/water/water_drop.ogg';

const MessengerPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialChatId = query.get("chatId");

  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const emojiPickerRef = useRef(null); 
  const fileInputRef = useRef(null); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get("/chats");
        setConversations(data);
        if (initialChatId) {
          const foundChat = data.find((c) => c._id === initialChatId);
          if (foundChat) setCurrentChat(foundChat);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách chat:", error);
      }
    };

    if (user) {
      socket.emit("setup_user", user._id);
      fetchConversations();
    }
  }, [user, initialChatId]);

  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (!currentChat || !user) return;
      try {
        const { data } = await api.get(
          `/chats/${currentChat._id}?page=1&limit=20`,
        );
        await api.put(`/chats/${currentChat._id}/read`);

        setTimeout(() => {
          setMessages(data);
          setPage(1);
          setHasMore(data.length === 20);
          socket.emit("join_chat", currentChat._id);
          socket.emit("mark_read", {
            conversationId: currentChat._id,
            userId: user._id,
          });

          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
        }, 0);
      } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
      }
    };
    fetchInitialMessages();
  }, [currentChat, user]);

  const handleScroll = async () => {
    const container = chatContainerRef.current;
    if (!container || isLoadMoreLoading || !hasMore) return;

    if (container.scrollTop === 0) {
      setIsLoadMoreLoading(true);
      previousScrollHeightRef.current = container.scrollHeight;

      try {
        const nextPage = page + 1;
        const { data } = await api.get(
          `/chats/${currentChat._id}?page=${nextPage}&limit=20`,
        );

        if (data.length < 20) setHasMore(false);

        setMessages((prev) => [...data, ...prev]);
        setPage(nextPage);

        setTimeout(() => {
          container.scrollTop =
            container.scrollHeight - previousScrollHeightRef.current;
        }, 0);
      } catch (error) {
        console.error("Lỗi khi tải thêm lịch sử chat:", error);
      } finally {
        setIsLoadMoreLoading(false);
      }
    }
  };

  useEffect(() => {
    const messageHandler = (message) => {
      const isMyMessage = message.sender._id === user._id;

      if (!isMyMessage) {
          const audio = new Audio(NOTIFICATION_SOUND_URL);
          audio.play().catch(() => console.log('Trình duyệt chặn phát âm thanh'));

          if (!currentChat || currentChat._id !== message.conversationId) {
              const msgPreview = message.imageUrl ? '[Hình ảnh]' : message.text;
              toast.info(`💬 ${message.sender.name}: ${msgPreview}`, {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  theme: "light",
              });
          }
      }

      setConversations(prev => {
          let updated = [...prev];
          const chatIndex = updated.findIndex(c => c._id === message.conversationId);
          
          if (chatIndex > -1) {
              const [chat] = updated.splice(chatIndex, 1);
              chat.lastMessage = message; 
              updated.unshift(chat);      
          } else {
              api.get('/chats').then(res => setConversations(res.data));
          }
          return updated;
      });

      if (currentChat && currentChat._id === message.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });

        if (!isMyMessage) {
            socket.emit("mark_read", {
              conversationId: currentChat._id,
              userId: user._id,
            });
            api.put(`/chats/${currentChat._id}/read`);
        }

        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
        }, 50);
      }
    };

    const typingHandler = () => setFriendTyping(true);
    const stopTypingHandler = () => setFriendTyping(false);

    const readHandler = () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.sender._id === user._id ? { ...m, status: "read" } : m,
        ),
      );
    };

    socket.on("receive_message", messageHandler);
    socket.on("friend_typing", typingHandler);
    socket.on("friend_stopped_typing", stopTypingHandler);
    socket.on("messages_read", readHandler);

    return () => {
      socket.off("receive_message", messageHandler);
      socket.off("friend_typing", typingHandler);
      socket.off("friend_stopped_typing", stopTypingHandler);
      socket.off("messages_read", readHandler);
    };
  }, [currentChat, user]);

  const handleDeleteChat = async (conversationId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa vĩnh viễn toàn bộ lịch sử trò chuyện này? Thao tác này không thể khôi phục.",
      )
    )
      return;

    try {
      await api.delete(`/chats/${conversationId}`);
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      setCurrentChat(null);
      setMessages([]);
    } catch (error) {
      console.error("Lỗi khi xóa hội thoại:", error);
      alert("Không thể xóa cuộc trò chuyện vào lúc này. Vui lòng thử lại!");
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing_start", {
        conversationId: currentChat._id,
        userId: user._id,
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing_stop", {
        conversationId: currentChat._id,
        userId: user._id,
      });
    }, 2000);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentChat) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data: uploadData } = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl =
        typeof uploadData === "string"
          ? uploadData
          : uploadData.image || uploadData.url || uploadData.imageUrl;

      const { data: msgData } = await api.post("/chats/message", {
        conversationId: currentChat._id,
        text: "", 
        imageUrl: imageUrl,
      });

      const receiver = currentChat.participants.find((p) => p._id !== user._id);
      socket.emit("send_message", {
        ...msgData,
        conversationId: currentChat._id,
        receiverId: receiver._id,
      });

      setMessages([...messages, msgData]);
      
      setConversations((prev) => {
        let updated = [...prev];
        const idx = updated.findIndex((c) => c._id === currentChat._id);
        if (idx > -1) {
          const [chat] = updated.splice(idx, 1);
          chat.lastMessage = msgData;
          updated.unshift(chat);
        }
        return updated;
      });

      setTimeout(() => {
        if (chatContainerRef.current)
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
      }, 50);
    } catch (error) {
      console.error("Lỗi gửi ảnh:", error);
      alert("Gửi ảnh thất bại! Vui lòng thử lại.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    socket.emit("typing_stop", {
      conversationId: currentChat._id,
      userId: user._id,
    });

    try {
      const { data } = await api.post("/chats/message", {
        conversationId: currentChat._id,
        text: newMessage,
      });

      const receiver = currentChat.participants.find((p) => p._id !== user._id);
      socket.emit("send_message", {
        ...data,
        conversationId: currentChat._id,
        receiverId: receiver._id,
      });

      setMessages([...messages, data]);
      setNewMessage("");
      
      setConversations((prev) => {
        let updated = [...prev];
        const idx = updated.findIndex((c) => c._id === currentChat._id);
        if (idx > -1) {
          const [chat] = updated.splice(idx, 1);
          chat.lastMessage = data;
          updated.unshift(chat);
        }
        return updated;
      });

      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }, 50);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  const getFriendInfo = (participants) => {
    return (
      participants.find((p) => p._id !== user._id) || { name: "Người dùng" }
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user)
    return (
      <div className="text-center mt-20 font-bold text-gray-500">
        Vui lòng đăng nhập để xem tin nhắn.
      </div>
    );

  return (
    <div className="bg-gray-100 h-[calc(100vh-80px)] flex justify-center p-0 md:p-4">
      {/* 🚀 Đã sửa: Cho form ôm sát viền ở mobile, có bo góc ở màn hình PC */}
      <div className="w-full md:max-w-6xl md:w-full bg-white md:rounded-[2rem] shadow-none md:shadow-xl border-0 md:border border-gray-100 flex overflow-hidden">
        
        {/* ========================================== */}
        {/* SIDEBAR TRÁI: DANH SÁCH CUỘC TRÒ CHUYỆN */}
        {/* 🚀 Đã sửa logic: Ẩn trên mobile nếu đã chọn chat, hiện full w-full */}
        {/* ========================================== */}
        <div className={`${currentChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-100 bg-white flex-col`}>
          <div className="p-5 border-b border-gray-100 flex items-center gap-4">
            <Link
              to="/thu-mua"
              className="text-gray-400 hover:text-purple-600 transition p-2 bg-gray-50 rounded-full"
            >
              <FaArrowLeft />
            </Link>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              Chat
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-center text-sm text-gray-400 mt-10 font-medium">
                Chưa có cuộc trò chuyện nào.
              </p>
            ) : (
              conversations.map((c) => {
                const friend = getFriendInfo(c.participants);
                const isActive = currentChat?._id === c._id;
                
                const lastMsg = c.lastMessage?.imageUrl
                  ? "[Hình ảnh]"
                  : c.lastMessage?.text || "Chưa có tin nhắn...";
                const isUnread =
                  c.lastMessage?.status === "sent" &&
                  c.lastMessage?.sender !== user._id;

                return (
                  <div
                    key={c._id}
                    onClick={() => setCurrentChat(c)}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${isActive ? "bg-purple-600 text-white shadow-md hidden md:flex" : "hover:bg-purple-50 bg-white"}`}
                  >
                    <div className="relative">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full flex justify-center items-center font-black text-lg border-2 border-white shadow-sm ${isActive ? "bg-white text-purple-600" : "bg-gradient-to-tr from-purple-500 to-blue-500 text-white"}`}
                        >
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4
                          className={`truncate text-[15px] ${isActive ? "text-white font-bold" : (isUnread ? "text-gray-900 font-black" : "text-gray-800 font-bold")}`}
                        >
                          {friend.name}
                        </h4>
                        <span
                          className={`text-[10px] ${isActive ? "text-purple-200" : (isUnread ? "text-purple-600 font-bold" : "text-gray-400")}`}
                        >
                          {formatTime(c.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p
                          className={`text-xs truncate max-w-[80%] ${isUnread && !isActive ? "font-black text-gray-900" : isActive ? "text-purple-100" : "text-gray-500 font-medium"}`}
                        >
                          {c.lastMessage?.sender === user._id
                            ? `Bạn: ${lastMsg}`
                            : lastMsg}
                        </p>
                        {isUnread && !isActive && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm animate-pulse"></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* KHU VỰC CHAT BÊN PHẢI */}
        {/* 🚀 Đã sửa logic: Ẩn trên mobile nếu chưa chọn chat, chiếm w-full khi mở */}
        {/* ========================================== */}
        <div className={`${!currentChat ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 flex-col bg-[#F9FAFB] relative`}>
          {!currentChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <FaPaperPlane className="text-4xl text-purple-200" />
              </div>
              <p className="font-bold text-gray-500">
                Khám phá & Trò chuyện ngay
              </p>
              <p className="text-sm mt-2">
                Chọn một cuộc trò chuyện để bắt đầu
              </p>
            </div>
          ) : (
            <>
              {/* Header Chat */}
              <div className="px-4 md:px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex justify-between items-center shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* 🚀 NÚT BACK DÀNH RIÊNG CHO MOBILE */}
                  <button 
                    onClick={() => setCurrentChat(null)}
                    className="md:hidden text-gray-400 hover:text-purple-600 p-2 -ml-2 rounded-full transition-colors"
                  >
                    <FaArrowLeft size={18} />
                  </button>

                  {getFriendInfo(currentChat.participants).avatar ? (
                    <img
                      src={getFriendInfo(currentChat.participants).avatar}
                      alt="avatar"
                      className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-tr from-purple-600 to-blue-500 text-white rounded-full flex justify-center items-center font-black text-lg">
                      {getFriendInfo(currentChat.participants)
                        .name.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-black text-gray-800 text-base md:text-lg tracking-tight truncate max-w-[150px] sm:max-w-[200px]">
                      {getFriendInfo(currentChat.participants).name}
                    </h3>
                    <p className="text-[10px] md:text-xs text-green-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>{" "}
                      Đang hoạt động
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  {currentChat.post && (
                    <Link
                      to={`/thu-mua/post/${currentChat.post._id}`}
                      className="flex items-center gap-2 md:gap-3 bg-white px-3 md:px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group"
                    >
                      <img
                        src={currentChat.post.images[0]}
                        alt="sp"
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover"
                      />
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-gray-700 truncate w-24 md:w-32 text-xs group-hover:text-purple-600 transition-colors">
                          {currentChat.post.title}
                        </p>
                        <p className="text-red-600 font-black text-xs md:text-sm">
                          {currentChat.post.price > 0
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(currentChat.post.price)
                            : "Thỏa thuận"}
                        </p>
                      </div>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteChat(currentChat._id)}
                    className="p-2.5 md:p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm shrink-0"
                    title="Xóa cuộc trò chuyện này"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              {/* Hộp hiển thị tin nhắn */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scroll-smooth custom-scrollbar"
              >
                {isLoadMoreLoading && (
                  <div className="text-center py-2 text-xs text-purple-600 font-bold flex justify-center items-center gap-2">
                    <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang tải tin nhắn cũ...
                  </div>
                )}

                {messages.map((m, i) => {
                  const isMe = m.sender._id === user._id;
                  return (
                    <div
                      key={i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%]`}
                      >
                        <div
                          className={`px-4 md:px-5 py-2.5 md:py-3 rounded-2xl text-[14px] md:text-[15px] leading-relaxed shadow-sm font-medium
                            ${
                              isMe
                                ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-sm"
                                : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                            }`}
                        >
                          {m.imageUrl && (
                            <img
                              src={m.imageUrl}
                              alt="attached"
                              className="max-w-[180px] md:max-w-[250px] rounded-xl mb-1 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          )}
                          {m.text && <span className="break-words block">{m.text}</span>}
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {formatTime(m.createdAt)}
                          </span>
                          {isMe &&
                            (m.status === "read" ? (
                              <FaCheckDouble
                                className="text-[10px] text-blue-500"
                                title="Đã xem"
                              />
                            ) : (
                              <FaCheckCircle
                                className="text-[10px] text-gray-300"
                                title="Đã gửi"
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {friendTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 w-16">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Thanh nhập liệu */}
              <div className="p-3 md:p-4 bg-white border-t border-gray-100 z-10 relative">
                {/* Bảng chọn Emoji Nổi */}
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-[70px] left-2 md:left-4 z-50 shadow-2xl rounded-lg"
                  >
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      width={window.innerWidth < 640 ? 280 : 300} 
                      height={350}
                    />
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2 md:gap-3"
                >
                  <div className="flex gap-1 md:gap-2 pb-2 relative">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={isUploadingImage}
                      className="text-purple-500 hover:text-purple-700 p-2 transition disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <FaSpinner className="text-xl animate-spin" />
                      ) : (
                        <FaImage className="text-xl" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-purple-500 hover:text-purple-700 p-2 transition"
                    >
                      <FaSmile className="text-xl" />
                    </button>
                  </div>

                  <textarea
                    placeholder="Aa"
                    rows="1"
                    className="flex-1 bg-gray-100 text-gray-800 rounded-3xl px-4 md:px-5 py-3 md:py-3.5 outline-none focus:ring-2 focus:ring-purple-200 text-[14px] md:text-[15px] font-medium resize-none custom-scrollbar"
                    style={{ minHeight: "45px", maxHeight: "100px" }}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />

                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-11 h-11 md:w-12 md:h-12 mb-0.5 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/30 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <FaPaperPlane className="text-[14px] md:text-[16px] ml-[-2px]" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessengerPage;