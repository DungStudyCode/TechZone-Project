// server\models\Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Chat về món hàng nào
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Gồm 2 người: Mua và Bán
  lastMessage: { type: String }, // Tin nhắn cuối để hiện ở Sidebar
  unreadCount: { type: Number, default: 0 } // Đếm số tin chưa đọc (Thông báo)
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);