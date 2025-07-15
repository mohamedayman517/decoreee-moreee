const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const Client = require("../../models/clientSchema");
const User = require("../../models/userSchema");
const { upload, isAuthenticated } = require("./helpers");

// Update user profile
router.post("/update", upload.single("profilePhoto"), async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { name, bio } = req.body;
    const userId = req.session.user._id || req.session.user.id;
    let user = await Client.findById(userId);
    if (!user) user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Update name based on user type
    if (user instanceof Client) user.name = name || user.name;
    else user.firstName = name || user.firstName;
    user.bio = bio || user.bio;

    // Handle profile photo upload
    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString("base64");
      user.profilePhoto = `data:${req.file.mimetype};base64,${base64Image}`;
      fs.unlinkSync(req.file.path); // Clean up temp file
    }

    try {
      await user.save();

      // Update profile data for related clients if user is engineer
      if (user.role === "Engineer") {
        // Update bookings
        const clientsWithBookings = await Client.find({
          "bookings.engineerId": user._id,
        });
        for (const client of clientsWithBookings) {
          let updated = false;
          client.bookings.forEach((booking) => {
            if (booking.engineerId.toString() === user._id.toString()) {
              booking.profileImage = user.profilePhoto;
              updated = true;
            }
          });
          if (updated) await client.save();
        }

        // Update favorites
        const clientsWithFavorites = await Client.find({
          "favoriteEngineers.engineerId": user._id,
        });
        for (const client of clientsWithFavorites) {
          let updated = false;
          client.favoriteEngineers.forEach((fav) => {
            if (fav.engineerId.toString() === user._id.toString()) {
              fav.profilePhoto = user.profilePhoto;
              updated = true;
            }
          });
          if (updated) await client.save();
        }
      }

      // Update session data
      req.session.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user instanceof Client ? user.name : user.firstName,
      };

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          name: user instanceof Client ? user.name : user.firstName,
          bio: user.bio,
          profilePhoto: user.profilePhoto,
        },
      });
    } catch (validationError) {
      if (validationError.name === "ValidationError") {
        const errors = Object.values(validationError.errors).map((err) => {
          let message = err.message;
          if (err.path === "bio" && err.kind === "minlength") {
            message = "Bio must be at least 5 characters.";
          }
          return {
            field: err.path,
            message,
          };
        });

        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      console.error("Unexpected error during save:", validationError);
      return res
        .status(500)
        .json({ success: false, message: "Unexpected server error" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
});

module.exports = router;
