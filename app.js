const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();


// Import routes
const authRoutes = require('./routes/authRoute');
const messageRoutes = require('./routes/messageRoute');

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Routes (with /api prefix)
app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);

// ✅ Home route
app.get('/', (req, res) => {
  res.redirect('/api/auth/login');
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;