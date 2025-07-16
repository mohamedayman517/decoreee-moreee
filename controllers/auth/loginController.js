const bcrypt = require("bcrypt");
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");

class LoginController {
  /**
   * Handle user login - نفس المنطق من routes/auth/login.js
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // For engineers, check approval and verification status
      if (user.role === "Engineer") {
        if (!user.isApproved) {
          return res.status(403).json({
            message:
              "Your account is pending admin approval. Please wait for approval before logging in.",
          });
        }
        if (!user.isVerified) {
          return res.status(403).json({
            message:
              "Please verify your account using the code sent to your email.",
          });
        }
      }

      // Store user in session
      req.session.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      console.log("🔐 User logged in successfully:", {
        id: user._id,
        email: user.email,
        role: user.role,
        sessionId: req.sessionID,
      });

      // Set redirectPath based on user role
      let redirectPath = "/";
      if (user.role === "Engineer") {
        redirectPath = `/profile/${user._id}`;
      } else if (user.role === "Admin") {
        redirectPath = "/AdminDashboard";
      } else if (user.role === "user") {
        redirectPath = "/"; // Regular users go to home page
      }

      res.json({
        success: true,
        message: "Login successful",
        redirectPath: redirectPath,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  }

  /**
   * Get current user - same logic from routes/user/login.js
   */
  static getCurrentUser(req, res) {
    console.log("Current session:", req.session);
    if (req.session && req.session.user) {
      res.json({ userId: req.session.user._id });
    } else {
      res.status(401).json({ message: "User not logged in" });
    }
  }

  /**
   * Logout user
   */
  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logged out successfully" });
    });
  }
}

module.exports = LoginController;
