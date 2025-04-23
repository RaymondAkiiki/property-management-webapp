// server/controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all messages where the user is either the sender or recipient
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { recipient: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$recipient", mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: {
            senderId: "$lastMessage.sender",
            recipientId: "$lastMessage.recipient"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $and: [
                      { $eq: ["$_id", "$$senderId"] },
                      { $ne: ["$$senderId", mongoose.Types.ObjectId(userId)] }
                    ]},
                    { $and: [
                      { $eq: ["$_id", "$$recipientId"] },
                      { $ne: ["$$recipientId", mongoose.Types.ObjectId(userId)] }
                    ]}
                  ]
                }
              }
            }
          ],
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          _id: 0,
          conversationId: "$_id",
          lastMessage: {
            _id: "$lastMessage._id",
            content: "$lastMessage.content",
            createdAt: "$lastMessage.createdAt",
            read: "$lastMessage.read"
          },
          otherUser: {
            _id: "$otherUser._id",
            name: "$otherUser.name",
            email: "$otherUser.email",
            avatar: "$otherUser.avatar"
          },
          unreadCount: 1
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);
    
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Failed to get conversations' });
  }
};

// Get all messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    // Verify the user is part of this conversation
    const isUserInConversation = conversationId.split('_').includes(userId.toString());
    
    if (!isUserInConversation) {
      return res.status(403).json({ message: 'You do not have access to this conversation' });
    }
    
    // Get messages and mark them as read
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        recipient: userId,
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, attachments, relatedTo } = req.body;
    const senderId = req.user._id;
    
    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Create conversation ID
    const conversationId = Message.createConversationId(senderId, recipientId);
    
    // Create the message
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      conversationId,
      content,
      attachments: attachments || [],
      relatedTo: relatedTo || null
    });
    
    await newMessage.save();
    
    // Populate sender and recipient info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Ensure the user is the recipient
    if (message.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }
    
    message.read = true;
    message.readAt = new Date();
    await message.save();
    
    res.status(200).json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Message.countDocuments({
      recipient: userId,
      read: false
    });
    
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};