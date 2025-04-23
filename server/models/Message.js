// server/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['property', 'tenant', 'maintenance', 'payment'],
      required: false
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    }
  }
}, { timestamps: true });

// Method to create a unique conversation ID from two user IDs
messageSchema.statics.createConversationId = function(userId1, userId2) {
  // Sort the IDs to ensure consistency regardless of sender/recipient order
  return [userId1, userId2].sort().join('_');
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;