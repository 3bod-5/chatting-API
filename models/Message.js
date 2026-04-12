const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000
    },
    read: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false // ✅ Soft delete
    }
  },
  { 
    timestamps: true // ✅ createdAt, updatedAt automatically
  }
);

// ✅ Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

// ✅ Exclude deleted messages by default
messageSchema.query.notDeleted = function() {
  return this.where({ deleted: false });
};

module.exports = mongoose.model("Message", messageSchema);

