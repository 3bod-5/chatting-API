const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { getReceiverSocket } = require("../sockets/chatSocket");

// Show chat page
exports.chatPage = async (req, res) => {
  try {
    // Get all users except current user
    const users = await User.find({ _id: { $ne: req.user._id } }).select("name email profilePic status");
    
    res.render("chat", {
      userId: req.user._id,
      userName: req.user.name,
      users // ✅ Pass all users to frontend
    });
  } catch (err) {
    console.log("Chat page error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    // Validation
    if (!receiverId || !text) {
      return res.status(400).json({ error: "Receiver ID and message text are required" });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent self-messaging
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't message yourself" });
    }

    // Find or create conversation
    //if conversation exist so it load the history from db
    let conversation = await Conversation.findOne({
      members: { $all: [req.user._id, receiverId] }
    });
    //if its a new msg it creates a new conversation
    if (!conversation) {
      conversation = await Conversation.create({
        members: [req.user._id, receiverId]
      });
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      text,
      createdAt: new Date()
    });

    // ✅ Get receiver's socket and emit real-time message
    const receiverSocket = getReceiverSocket(receiverId);
    if (receiverSocket) {
      const io = req.app.get("io");
      io.to(receiverSocket).emit("getMessage", {
        _id: message._id,
        senderId: req.user._id,
        senderName: req.user.name,
        text,
        createdAt: message.createdAt
      });
    }

    res.status(201).json({
      success: true,
      conversationId: conversation._id,
      message
    });
  } catch (error) {
    console.log("Send message error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get conversation history
exports.getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    // Find conversation
    //$all means that both must meet
    const conversation = await Conversation.findOne({
      members: { $all: [req.user._id, receiverId] }
    });

    if (!conversation) {
      return res.status(200).json({ messages: [] }); // ✅ No conversation yet
    }

    // Get all messages in this conversation
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 }) // ✅ Oldest first
      .select("sender receiver text createdAt");

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      messages
    });
  } catch (error) {
    console.log("Get messages error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users (for user list)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("_id name email profilePic status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.log("Get users error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.log("Mark as read error:", error);
    res.status(500).json({ error: error.message });
  }
};