// server\models\Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String },
  imageUrl: { type: String }, // Hỗ trợ gửi ảnh
  status: { type: String, enum: ['sent', 'read'], default: 'sent' } // Trạng thái đã xem
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);