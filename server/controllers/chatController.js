// server/controllers/chatController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// 1. Nhấn nút "Chat với người bán" -> Khôi phục hiển thị nếu trước đó từng bấm xóa một phía
exports.accessConversation = async (req, res) => {
  const { postId, sellerId } = req.body;
  const buyerId = req.user._id;

  if (buyerId.toString() === sellerId.toString()) {
    return res.status(400).json({ message: "Bạn không thể tự chat với máy của mình!" });
  }

  try {
    let chat = await Conversation.findOne({
      post: postId,
      participants: { $all: [buyerId, sellerId] }
    });

    if (chat) {
      // ✅ Nếu phòng đã tồn tại nhưng người mua từng bấm xóa trước đó, tự động khôi phục (pull khỏi deletedBy)
      await Conversation.findByIdAndUpdate(chat._id, { 
        $pull: { deletedBy: buyerId } 
      });
      
      chat = await Conversation.findById(chat._id)
        .populate('participants', 'name avatar')
        .populate('post', 'title images price');
    } else {
      // Nếu chưa từng chat -> Tạo phòng mới
      chat = await Conversation.create({ post: postId, participants: [buyerId, sellerId] });
      chat = await Conversation.findById(chat._id)
        .populate('participants', 'name avatar')
        .populate('post', 'title images price');
    }
    res.status(200).json(chat);
  } catch (error) { res.status(500).json(error); }
};

// 2. Lấy danh sách Inbox bên trái (Đã lọc bỏ những phòng đã bấm xóa một phía)
exports.getConversations = async (req, res) => {
  try {
    // ✅ ĐÃ SỬA: Thêm điều kiện { deletedBy: { $ne: req.user._id } } để ẩn phòng đã xóa một phía
    const chats = await Conversation.find({ 
        participants: req.user._id,
        deletedBy: { $ne: req.user._id } 
      })
      .populate('participants', 'name avatar')
      .populate('post', 'title images')
      .populate('lastMessage') 
      .sort({ updatedAt: -1 }); 
    res.status(200).json(chats);
  } catch (error) { res.status(500).json(error); }
};

// 3. Lấy lịch sử tin nhắn
exports.getMessages = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20; 
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit);
    
    res.status(200).json(messages.reverse());
  } catch (error) { res.status(500).json(error); }
};

// 4. Lưu tin nhắn mới và tự động kích hoạt hiển thị lại phòng chat cho đối phương nếu họ từng xóa
exports.sendMessage = async (req, res) => {
  const { conversationId, text, imageUrl } = req.body;
  try {
    const newMessage = await Message.create({
      conversationId,
      sender: req.user._id,
      text,
      imageUrl
    });
    
    // ✅ ĐÃ SỬA: Khi có tin nhắn mới, clear sạch mảng deletedBy để cuộc hội thoại tự động nổi lên lại ở cả 2 phía
    await Conversation.findByIdAndUpdate(conversationId, { 
      lastMessage: newMessage._id,
      $set: { deletedBy: [] } 
    });

    const populatedMessage = await newMessage.populate('sender', 'name avatar');
    res.status(200).json(populatedMessage);
  } catch (error) { res.status(500).json(error); }
};

// 5. API Xóa hội thoại một phía (Xóa phía tôi)
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // ✅ ĐÃ SỬA: Thêm userId vào mảng deletedBy bằng $addToSet (chống trùng lặp) thay vì xóa DB
    const chat = await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );

    // 💡 NÂNG CẤP TỐI ƯU: Nếu cả 2 người tham gia cùng bấm xóa phòng này, lúc đó mới dọn sạch DB vĩnh viễn
    if (chat && chat.deletedBy.length === chat.participants.length) {
      await Message.deleteMany({ conversationId });
      await Conversation.findByIdAndDelete(conversationId);
    }

    res.status(200).json({ message: "Đã xóa cuộc trò chuyện ở phía bạn!" });
  } catch (error) {
    console.error("Lỗi xóa hội thoại:", error);
    res.status(500).json({ message: "Lỗi hệ thống, không thể xóa hội thoại." });
  }
};

// 6. Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.conversationId, sender: { $ne: req.user._id } },
      { $set: { status: 'read' } }
    );
    res.status(200).json({ message: "Đã xem" });
  } catch (error) { res.status(500).json(error); }
};