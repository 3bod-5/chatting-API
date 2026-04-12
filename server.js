const express = require("express");
const bcrypt = require('bcrypt')
const http = require("http");
const { Server } = require("socket.io");
const { setupSocket } = require("./sockets/chatSocket");
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const app = require('./app')
const server = http.createServer(app);
const mongoose = require("mongoose");

const connect = mongoose.connect("mongodb://127.0.0.1:27017/chatting-app");

connect
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Database connection error:", err.message);
  });

module.exports = connect;
const io = new Server(server, {
  cors: { origin: "*" }
});

// initialize socket logic
setupSocket(io);

// make io global (optional but useful)
app.set("io", io);

server.listen(3000, () => {
  console.log(`Server running on post 3000`);
});