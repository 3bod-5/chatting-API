const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    },
    profilePic: {
      type: String,
      default: null
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// ✅ FIXED: Pre-save hook to hash password
userSchema.pre("save", async function(next) {
  // If password is not modified, skip hashing
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.log(err);
  }
});

// ✅ Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Indexes
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model("User", userSchema);