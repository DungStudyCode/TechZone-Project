// server/controllers/chatController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// 1. Nhấn nút "Chat với người bán" -> Tạo phòng 1-1 hoặc mở phòng cũ
exports.accessConversation = async (req, res) => {
  const { postId, sellerId } = req.body;
  const buyerId = req.user._id;

  if (buyerId.toString() === sellerId.toString()) {
    return res.status(400).json({ message: "Bạn không thể tự chat với máy của mình!" });
  }

  try {
    // Tìm phòng chat giữa 2 người về sản phẩm này
    let chat = await Conversation.findOne({
      post: postId,
      participants: { $all: [buyerId, sellerId] }
    }).populate('participants', 'name').populate('post', 'title images price');

    // Nếu chưa từng chat -> Tạo phòng mới
    if (!chat) {
      chat = await Conversation.create({
        post: postId,
        participants: [buyerId, sellerId]
      });
      chat = await Conversation.findById(chat._id)
        .populate('participants', 'name')
        .populate('post', 'title images price');
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};

// 2. Lấy danh sách Inbox (Bên trái Messenger)
exports.getConversations = async (req, res) => {
  try {
    const chats = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name')
      .populate('post', 'title images')
      .sort({ updatedAt: -1 }); // Tin mới nhất lên đầu
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json(error);
  }
};

// 3. Lấy lịch sử tin nhắn của 1 phòng (Bên phải Messenger)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'name');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

// ✅ 4. THÊM HÀM NÀY ĐỂ LƯU TIN NHẮN MỚI
exports.sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  try {
    const newMessage = await Message.create({
      conversationId,
      sender: req.user._id,
      text
    });
    
    // Nối thêm thông tin người gửi để trả về cho Frontend
    const populatedMessage = await newMessage.populate('sender', 'name');
    res.status(200).json(populatedMessage);
  } catch (error) {
    res.status(500).json(error);
  }
};