const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    lastMessageTime: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true
  }
);

// ✅ Ensure only 2 members (one-to-one chat)
/*conversationSchema.pre('save', (req,res,next) =>{
  if (this.members.length !== 2) {
    throw new Error('Conversation must have exactly 2 members');
  }
  next();
});*/

// ✅ Index for faster queries
conversationSchema.index({ members: 1 });
conversationSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);