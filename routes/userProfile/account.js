const express = require("express");
const router = express.Router();
const Client = require("../../models/clientSchema");
const User = require("../../models/userSchema");
const Package = require("../../models/packageSchema");
const { isAuthenticated } = require("./helpers");

// Delete account
router.delete("/delete-account", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user._id || req.session.user.id;
    const userRole = req.session.user.role;

    let user;
    if (userRole === "Engineer") {
      // Delete engineer's packages first
      await Package.deleteMany({ engID: userId });
      user = await User.findByIdAndDelete(userId);
    } else {
      // Delete client and clean up related bookings
      user = await Client.findByIdAndDelete(userId);
      if (user && user.bookings) {
        // Remove client's bookings from engineers
        for (const booking of user.bookings) {
          await User.updateMany(
            { "bookings.bookingId": booking.bookingId },
            { $pull: { bookings: { bookingId: booking.bookingId } } }
          );
        }
      }
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    // Destroy session
    req.session.destroy();
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

module.exports = router;
