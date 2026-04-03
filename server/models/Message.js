// server\models\Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }, // Thuộc phòng nào
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ai gửi
  text: { type: String, required: true }, // Nội dung
  isRead: { type: Boolean, default: false } // Trạng thái đã xem
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);