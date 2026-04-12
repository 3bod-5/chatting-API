const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    console.log("Creating user...");

    // ✅ Create user - pre-save hook will hash password
    const newUser = await User.create({
      name,
      email,
      password
    });

    console.log("User created:", newUser._id);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true in production
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.redirect('/')

  } catch (err) {
    console.log("❌ Register error:", err.message);
    console.log("Full error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.registerPage = (req, res) => {
  res.render("register");
};

exports.loginPage = (req, res) => {
  res.render("login");
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    //to make website store token for further requests
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect("/api/chat");
  } catch (err) {
    console.log("❌ Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

//protect function are used to auth token for every route access request
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.redirect("/api/auth/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.redirect("/api/auth/login");
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.log("❌ Auth error:", err.message);
    res.redirect("/api/auth/login");
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/api/auth/login");
};