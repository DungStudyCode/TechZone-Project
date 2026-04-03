// client/src/pages/ThuMua/MessengerPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import io from 'socket.io-client';
import { FaPaperPlane, FaUserCircle, FaArrowLeft, FaMobileAlt } from 'react-icons/fa';

const socket = io('http://localhost:5000');

const MessengerPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialChatId = query.get('chatId');

  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // ✅ 1. SỬA LẠI REF CHO TOÀN BỘ KHUNG CHAT
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/chats', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setConversations(data);

        if (initialChatId) {
          const foundChat = data.find(c => c._id === initialChatId);
          if (foundChat) setCurrentChat(foundChat);
        }
      } catch (error) {
        console.error('Lỗi lấy danh sách chat:', error);
      }
    };

    if (user) {
      socket.emit('setup_user', user._id);
      fetchConversations();
    }
  }, [user, initialChatId]); 

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat || !user || !user.token) return; 

      try {
        const { data } = await axios.get(`http://localhost:5000/api/chats/${currentChat._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setMessages(data);
        socket.emit('join_chat', currentChat._id); 
      } catch (error) {
        console.error('Lỗi lấy tin nhắn:', error);
      }
    };

    fetchMessages();
  }, [currentChat, user]);

  // 3. Lắng nghe tin nhắn mới từ Socket.io
  useEffect(() => {
    const messageHandler = (message) => {
      if (currentChat && currentChat._id === message.conversationId) {
        setMessages((prev) => {
          // ✅ FIX LỖI NHÂN ĐÔI: Kiểm tra xem tin nhắn này đã tồn tại trên màn hình chưa (check bằng _id)
          const isDuplicate = prev.some((m) => m._id === message._id);
          
          if (isDuplicate) {
            return prev; // Nếu trùng rồi thì lờ nó đi
          }
          return [...prev, message]; // Nếu chưa có thì mới thêm vào
        });
      }
    };

    // Bật lắng nghe
    socket.on('receive_message', messageHandler);

    // Dọn dẹp khi component unmount hoặc đổi phòng chat
    return () => socket.off('receive_message', messageHandler);
  }, [currentChat]);
  // ✅ 2. SỬA LẠI LOGIC CUỘN (CHỈ CUỘN BÊN TRONG KHUNG CHAT)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    try {
      const { data } = await axios.post('http://localhost:5000/api/chats/message', 
        { conversationId: currentChat._id, text: newMessage },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const receiver = currentChat.participants.find(p => p._id !== user._id);
      socket.emit('send_message', {
        ...data, 
        conversationId: currentChat._id,
        receiverId: receiver._id
      });

      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    }
  };

  const getFriendInfo = (participants) => {
    return participants.find(p => p._id !== user._id) || { name: 'Người dùng' };
  };

  if (!user) return <div className="text-center mt-20">Vui lòng đăng nhập để xem tin nhắn.</div>;

  return (
    <div className="bg-gray-100 h-[calc(100vh-80px)] flex justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg border border-gray-200 flex overflow-hidden">
        
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
            <Link to="/thu-mua" className="text-gray-500 hover:text-purple-600">
              <FaArrowLeft />
            </Link>
            <h2 className="text-xl font-bold text-gray-800">Tin nhắn</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="text-center text-sm text-gray-400 mt-10">Chưa có cuộc trò chuyện nào.</p>
            ) : (
              conversations.map((c) => {
                const friend = getFriendInfo(c.participants);
                const isActive = currentChat?._id === c._id;
                return (
                  <div 
                    key={c._id} 
                    onClick={() => setCurrentChat(c)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 ${isActive ? 'bg-purple-100 border border-purple-200' : 'hover:bg-gray-100'}`}
                  >
                    <div className="w-12 h-12 bg-purple-200 text-purple-700 rounded-full flex justify-center items-center font-bold text-lg flex-shrink-0">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold truncate text-sm ${isActive ? 'text-purple-900' : 'text-gray-800'}`}>
                        {friend.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                        <FaMobileAlt className="text-gray-400" /> {c.post?.title || 'Sản phẩm đã xóa'}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="w-2/3 flex flex-col bg-white">
          {!currentChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <FaPaperPlane className="text-5xl mb-4 opacity-20" />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex justify-center items-center font-bold">
                    {getFriendInfo(currentChat.participants).name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{getFriendInfo(currentChat.participants).name}</h3>
                    <p className="text-xs text-green-500 font-medium">Đang hoạt động</p>
                  </div>
                </div>
                {currentChat.post && (
                  <Link to={`/thu-mua/post/${currentChat.post._id}`} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                    <img src={currentChat.post.images[0]} alt="sp" className="w-8 h-8 rounded object-cover" />
                    <div className="text-xs text-right hidden md:block">
                      <p className="font-bold text-gray-700 truncate w-32">{currentChat.post.title}</p>
                      {/* ✅ 3. SỬA LỖI NaN BẰNG CÁCH THÊM || 0 */}
                      <p className="text-red-500 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentChat.post.price || 0)}</p>
                    </div>
                  </Link>
                )}
              </div>

              {/* ✅ 4. GẮN chatContainerRef VÀO ĐÂY, THÊM scroll-smooth */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 scroll-smooth">
                {messages.map((m, i) => {
                  const isMe = m.sender._id === user._id;
                  return (
                    // ✅ 5. BỎ ref={scrollRef} TẠI DIV NÀY
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[70%] text-sm shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 outline-none focus:ring-2 focus:ring-purple-300 text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane className="text-sm ml-[-2px]" />
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessengerPage;