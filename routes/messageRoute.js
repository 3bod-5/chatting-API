const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");
const { protect } = require("../controller/authController");

// ✅ Routes WITHOUT /api prefix (it's added in app.js)

// Show chat page
router.get('/chat', protect, messageController.chatPage);

// Send message
router.post('/send', protect, messageController.sendMessage);

// Get message history
router.get('/history/:receiverId', protect, messageController.getMessages);

// Get all users
router.get('/users', protect, messageController.getUsers);

// Mark message as read
router.put('/read/:messageId', protect, messageController.markAsRead);

module.exports = router;