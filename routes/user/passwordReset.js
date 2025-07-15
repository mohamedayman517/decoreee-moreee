const { body, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const { transporter } = require("./helpers");

// Forget password page route
router.get("/forgetPassword", (req, res) => {
  res.render("forgetPassword", { message: null });
});

// Forget password route
router.post("/forgetPassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "❌ Email is not registered" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000);
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset Code",
      text: `كود التأكيد: ${resetCode}`,
    });

    res.json({ message: "✅ The code has been sent to your email" });
  } catch (error) {
    console.error("❌ Error while sending email:", error);
    res
      .status(500)
      .json({ message: "❌ Something went wrong, please try again" });
  }
});

// Verify code page route
router.get("/verifyCode", (req, res) => {
  res.render("verifyCode", { email: req.query.email, message: null });
});

// Verify code route
router.post("/verifyCode", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "❌ User not found" });
    }

    if (
      !user.resetCode ||
      user.resetCode !== code ||
      user.resetCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "❌ Invalid or expired code" });
    }

    res.json({ message: "✅ Code is valid! Redirecting to password reset..." });
  } catch (error) {
    console.error("❌ Error while verifying code:", error);
    res
      .status(500)
      .json({ message: "❌ Something went wrong, please try again" });
  }
});

// Reset password page route
router.get("/resetPassword", (req, res) => {
  res.render("resetPassword", { email: req.query.email, message: null });
});

// Reset password route
router.post(
  "/resetPassword",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "❌ User not found" });
      }

      if (!user.resetCode || user.resetCodeExpires < Date.now()) {
        return res
          .status(400)
          .json({ message: "❌ Invalid or expired verification code" });
      }

      user.password = await bcrypt.hash(password, 10);
      user.resetCode = null;
      user.resetCodeExpires = null;
      await user.save();

      res.json({
        message: "✅ Password has been reset successfully! You can now log in.",
      });
    } catch (error) {
      console.error("❌ Error while resetting password:", error);
      res
        .status(500)
        .json({ message: "❌ Something went wrong, please try again" });
    }
  }
);

module.exports = router;
