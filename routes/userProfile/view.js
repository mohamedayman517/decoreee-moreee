const express = require("express");
const router = express.Router();
const Client = require("../../models/clientSchema");
const User = require("../../models/userSchema");

// Get user profile (current user)
router.get("/userProfile", async (req, res) => {
  try {
    const userID = req.session.user?._id;
    if (!userID) return res.redirect("/login");

    let userData = await Client.findOne({ _id: userID }).lean();
    if (!userData) userData = await User.findOne({ _id: userID }).lean();
    if (!userData) return res.status(404).send("User not found");

    res.render("userProfile", {
      userData,
      user: req.session.user || null,
      isAuthenticated: !!req.session.user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Server error");
  }
});

// Get user profile by ID
router.get("/userProfile/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    let userData = await Client.findOne({ _id: userID }).lean();
    if (!userData) userData = await User.findOne({ _id: userID }).lean();
    if (!userData) return res.status(404).send("User not found");

    // Populate booking engineer profile images
    if (userData.bookings) {
      for (const booking of userData.bookings) {
        const engineer = await User.findById(booking.engineerId).lean();
        if (engineer?.profilePhoto)
          booking.profileImage = engineer.profilePhoto;
      }
    }

    // Populate favorite engineers profile photos
    if (userData.favoriteEngineers) {
      for (const fav of userData.favoriteEngineers) {
        const engineer = await User.findById(fav.engineerId).lean();
        if (engineer?.profilePhoto) fav.profilePhoto = engineer.profilePhoto;
      }
    }

    res.render("userProfile", {
      userData,
      user: req.session.user || null,
      isAuthenticated: !!req.session.user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
