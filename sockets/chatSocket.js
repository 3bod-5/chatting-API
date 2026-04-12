const User = require("../models/User");

let onlineUsers = new Map();

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // When user joins
    socket.on("addUser", async (userId) => {
      try {
        onlineUsers.set(userId, socket.id);

        // ✅ Update user status in DB
        await User.findByIdAndUpdate(userId, { status: "online" });

        // ✅ Broadcast to all clients that user is online
        io.emit("userStatusChanged", {
          userId,
          status: "online"
        });

        console.log("Online users:", Array.from(onlineUsers.keys()));
      } catch (err) {
        console.error("Error adding user:", err);
      }
    });

    // When user disconnects
    socket.on("disconnect", async () => {
      try {
        for (let [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);

            // ✅ Update user status in DB
            await User.findByIdAndUpdate(userId, { status: "offline" });

            // ✅ Broadcast to all clients that user is offline
            io.emit("userStatusChanged", {
              userId,
              status: "offline"
            });

            console.log(`✅ User ${userId} disconnected`);
            break;
          }
        }
      } catch (err) {
        console.error("Error disconnecting user:", err);
      }
    });

    // ✅ When message is sent (optional - for typing indicators)
    socket.on("typing", (data) => {
      const receiverSocket = getReceiverSocket(data.receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("userTyping", {
          senderId: data.senderId,
          senderName: data.senderName
        });
      }
    });

    // ✅ When user stops typing
    socket.on("stopTyping", (data) => {
      const receiverSocket = getReceiverSocket(data.receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("userStoppedTyping", {
          senderId: data.senderId
        });
      }
    });
  });
};

// Get receiver's socket ID
const getReceiverSocket = (userId) => {
  return onlineUsers.get(userId);
};

// Get all online users (useful for debugging)
const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = { setupSocket, getReceiverSocket, getOnlineUsers };