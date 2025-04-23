// server/routes/messageRoutes.js
const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all conversations for the current user
router.get('/conversations', messageController.getConversations);

// Get all messages in a conversation
router.get('/conversations/:conversationId', messageController.getMessages);

// Send a new message
router.post('/', messageController.sendMessage);

// Mark a message as read
router.patch('/:messageId/read', messageController.markAsRead);

// Get unread message count
router.get('/unread/count', messageController.getUnreadCount);

module.exports = router;