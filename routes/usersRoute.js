const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController');
const { protect } = require('../controller/authController');

// ✅ All routes protected - user must be logged in

// Get all users (for sidebar)
router.get('/all', protect, messageController.getUsers);

// Get user profile
router.get('/profile', protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;