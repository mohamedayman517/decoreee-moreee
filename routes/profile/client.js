const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { upload, convertToBase64, cleanupTempFile } = require("./helpers");

// Client login route for payment
router.post("/payment/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Client.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    req.session.user = user;
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Client registration route for payment
router.post(
  "/payment/register",
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const { name, email, password, phone, bio } = req.body;

      // فحص الإيميل في كلا النموذجين لمنع التكرار
      console.log("🔍 [Client Registration] Checking email:", email);
      const existingUser = await User.findOne({ email });
      const existingClient = await Client.findOne({ email });

      console.log(
        "👤 [Client Registration] Existing User:",
        existingUser ? "Found" : "Not found"
      );
      console.log(
        "👥 [Client Registration] Existing Client:",
        existingClient ? "Found" : "Not found"
      );

      if (existingUser || existingClient) {
        console.log(
          "❌ [Client Registration] Email already exists, rejecting registration"
        );
        return res.status(400).json({
          success: false,
          message:
            "هذا البريد الإلكتروني مسجل مسبقاً. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.",
        });
      }

      console.log(
        "✅ [Client Registration] Email is unique, proceeding with registration"
      );

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // تحويل الصورة إلى Base64 إذا تم تحميلها
      let profilePhotoBase64 = "/uploads/default.png";
      if (req.file) {
        profilePhotoBase64 = convertToBase64(req.file.path, req.file.mimetype);
        cleanupTempFile(req.file.path);
      }

      // Create new user
      const newUser = new Client({
        name,
        email,
        password: hashedPassword,
        phone,
        bio,
        role: "user",
        profilePhoto: profilePhotoBase64,
      });

      await newUser.save();
      console.log("✅ [Client Registration] User saved successfully");

      res.json({
        success: true,
        message: "Registration successful",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
