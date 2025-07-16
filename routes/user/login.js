const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");
const bcrypt = require("bcrypt");

// Login page route
router.get("/login", (req, res) => {
  const clientUser = req.session.user;
  res.render("login", { title: "Login", user: clientUser });
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const user2 = await Client.findOne({ email });

    if (!user && !user2) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    let isMatch = false;
    let activeUser = null;
    let userType = "";

    // Check if user exists in User model (Engineer/Admin)
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        activeUser = user;
        userType = "engineer";

        // Only check approval for Engineers
        if (user.role === "Engineer" && !user.isApproved) {
          return res
            .status(403)
            .json({ message: "Your account is pending approval" });
        }

        // Check email verification for Engineers
        if (user.role === "Engineer" && !user.isVerified) {
          return res.status(403).json({
            message:
              "Please verify your email address using the code sent to your email before logging in.",
          });
        }
      }
    }

    // If not matched with User model, try Client model
    if (!isMatch && user2) {
      isMatch = await bcrypt.compare(password, user2.password);
      if (isMatch) {
        activeUser = user2;
        userType = "client";
      }
    }

    // If no match found in either model
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Set session based on user type
    if (userType === "engineer") {
      req.session.user = {
        id: activeUser._id,
        email: activeUser.email,
        role: activeUser.role,
        name: `${activeUser.firstName} ${activeUser.lastName}`,
      };
    } else if (userType === "client") {
      req.session.user = {
        id: activeUser._id,
        email: activeUser.email,
        role: activeUser.role,
        name: activeUser.name,
      };
    }

    // Determine redirect path based on role
    let redirectPath;
    if (userType === "engineer") {
      if (activeUser.role === "Engineer") {
        redirectPath = `/profile/${activeUser._id}`;
      } else if (activeUser.role === "Admin") {
        redirectPath = "/AdminDashboard";
      } else if (activeUser.role === "user") {
        redirectPath = "/"; // Regular users go to home page
      } else {
        redirectPath = "/";
      }
    } else if (userType === "client") {
      redirectPath = "/"; // Clients go to home page
    } else {
      redirectPath = "/";
    }

    res.json({
      message: "Login successful",
      redirectPath: redirectPath,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user route
router.get("/get-current-user", (req, res) => {
  console.log("Current session:", req.session);
  if (req.session && req.session.user) {
    res.json({ userId: req.session.user._id });
  } else {
    res.status(401).json({ message: "User not logged in" });
  }
});

module.exports = router;
