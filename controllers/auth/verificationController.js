const User = require("../../models/userSchema");

class VerificationController {
  /**
   * Handle account verification - نفس المنطق من routes/auth/verification.js
   */
  static async verifyAccount(req, res) {
    try {
      const { code, engineerId } = req.body;
      console.log("Verification attempt:", { code, engineerId });

      if (!code || !engineerId) {
        console.log("Missing verification data");
        return res.status(400).json({
          success: false,
          message: "Please provide verification code",
        });
      }

      // First find the engineer
      const engineer = await User.findById(engineerId);
      console.log("Found engineer:", engineer);

      if (!engineer) {
        console.log("Engineer not found");
        return res.status(400).json({
          success: false,
          message: "Invalid verification link",
        });
      }

      // Check verification code
      if (engineer.verificationCode !== code) {
        console.log("Invalid verification code");
        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }

      // Check if code is expired
      if (
        engineer.verificationCodeExpires &&
        new Date() > engineer.verificationCodeExpires
      ) {
        console.log("Verification code expired");
        return res.status(400).json({
          success: false,
          message: "Verification code has expired",
        });
      }

      // Update the engineer directly
      engineer.isVerified = true;
      engineer.verificationCode = null;
      engineer.verificationCodeExpires = null;

      await engineer.save();

      // Verify the update was successful
      const verifiedEngineer = await User.findById(engineerId);
      console.log(
        "Verification status after update:",
        verifiedEngineer.isVerified
      );

      if (!verifiedEngineer.isVerified) {
        console.log("Failed to update verification status");
        return res.status(500).json({
          success: false,
          message: "Failed to verify account",
        });
      }

      console.log("Engineer verified successfully");
      return res.json({
        success: true,
        message: "Account verified successfully",
        redirectTo: "/login",
      });
    } catch (error) {
      console.error("Verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Error verifying account",
      });
    }
  }

  /**
   * Show verification page - نفس المنطق من routes/auth/verification.js
   */
  static async showVerificationPage(req, res) {
    try {
      // Get engineerId from URL parameters
      const engineerId = req.query.engineerId;
      console.log("Request URL:", req.url);
      console.log("Request Query:", req.query);
      console.log("Attempting to verify engineer with ID:", engineerId);

      // If no engineerId is provided, redirect to login page
      if (!engineerId) {
        console.log("No engineerId provided - Redirecting to login page");
        return res.redirect("/login");
      }

      // Find the engineer
      const engineer = await User.findOne({
        _id: engineerId,
        isApproved: true,
      });

      console.log("Found engineer for verification:", engineer);

      if (!engineer) {
        console.log("Engineer not found or not approved");
        return res.render("verify", {
          error: "Invalid verification link or engineer not approved",
          showForm: false,
          engineerId: null,
        });
      }

      // Check if already verified
      if (engineer.isVerified) {
        console.log("Engineer already verified");
        return res.render("verify", {
          error: "Account is already verified. You can login now.",
          showForm: false,
          engineerId: null,
        });
      }

      // Show verification form
      console.log("Showing verification form");
      return res.render("verify", {
        error: null,
        showForm: true,
        engineerId: engineerId,
      });
    } catch (error) {
      console.error("Error in verification route:", error);
      return res.render("verify", {
        error: "An unexpected error occurred",
        showForm: false,
        engineerId: null,
      });
    }
  }
}

module.exports = VerificationController;
