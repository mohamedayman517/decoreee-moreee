const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Client = require("../../models/clientSchema");
const User = require("../../models/userSchema");
const { isAuthenticated } = require("./helpers");

// Change password
router.post("/change-password", isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.session.user || (!req.session.user._id && !req.session.user.id)) {
      return res
        .status(401)
        .json({ error: "Please log in to change your password" });
    }

    const userId = req.session.user._id || req.session.user.id;
    let user =
      req.session.user.role === "Engineer"
        ? await User.findById(userId)
        : await Client.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Current password is incorrect" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

module.exports = router;
