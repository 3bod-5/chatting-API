const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Register routes
router
  .route('/register')
  .get(authController.registerPage)
  .post(authController.registerUser);

// Login routes
router
  .route('/login')
  .get(authController.loginPage)
  .post(authController.loginUser);

// Logout route
router
  .route('/logout')
  .get(authController.logout);

module.exports = router;