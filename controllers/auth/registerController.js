const bcrypt = require("bcrypt");
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");

class RegisterController {
  /**
   * Handle user registration - same logic from routes/auth/register.js
   */
  static async register(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        role,
        phone,
        idCardPhoto,
        specialties,
      } = req.body;

      console.log("REGISTER BODY:", req.body);

      // Check email in both models to prevent duplication
      console.log("🔍 [Engineer Registration] Checking email:", email);
      const existingUser = await User.findOne({ email });
      const existingClient = await Client.findOne({ email });

      console.log(
        "👤 [Engineer Registration] Existing User:",
        existingUser ? "Found" : "Not found"
      );
      console.log(
        "👥 [Engineer Registration] Existing Client:",
        existingClient ? "Found" : "Not found"
      );

      if (existingUser || existingClient) {
        console.log(
          "❌ [Engineer Registration] Email already exists, rejecting registration"
        );
        return res.status(400).json({
          message:
            "This email is already registered. Please use a different email or login.",
        });
      }

      console.log(
        "✅ [Engineer Registration] Email is unique, proceeding with registration"
      );

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      let specialtiesArr = [];
      if (specialties) {
        if (Array.isArray(specialties)) {
          specialtiesArr = specialties;
        } else {
          specialtiesArr = [specialties];
        }
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phone,
        idCardPhoto,
        specialties: specialtiesArr,
        isApproved: role === "Engineer" ? false : true,
        isVerified: false,
        hasPaidSubscription: false,
      });

      await user.save();

      // For engineers, redirect to payment policy page
      if (role === "Engineer") {
        return res.json({
          success: true,
          message: "Registration successful. Please review payment policy.",
          redirectTo: `/payment-policy?engineerId=${user._id}`,
        });
      }

      // For other roles, redirect to login
      res.json({
        success: true,
        message: "Registration successful",
        redirectTo: "/login",
      });
    } catch (error) {
      console.error("Registration error:", error);

      // Provide specific error messages based on error type
      let errorMessage = "Registration failed. Please try again.";
      let statusCode = 500;

      if (error.name === "ValidationError") {
        statusCode = 400;
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        errorMessage = `Validation failed: ${validationErrors.join(", ")}`;
      } else if (error.code === 11000) {
        // MongoDB duplicate key error
        statusCode = 409;
        if (error.keyPattern.email) {
          errorMessage =
            "This email is already registered. Please use a different email or login.";
        } else {
          errorMessage =
            "This information is already registered. Please check your details.";
        }
      } else if (error.message.includes("email")) {
        statusCode = 400;
        errorMessage =
          "Invalid email address. Please check your email and try again.";
      } else if (error.message.includes("password")) {
        statusCode = 400;
        errorMessage =
          "Password validation failed. Please ensure your password meets the requirements.";
      } else if (
        error.message.includes("file") ||
        error.message.includes("upload")
      ) {
        statusCode = 400;
        errorMessage =
          "File upload failed. Please check your images and try again.";
      } else if (error.message.includes("phone")) {
        statusCode = 400;
        errorMessage =
          "Invalid phone number. Please check your phone number format.";
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && { error: error.message }),
      });
    }
  }

  /**
   * Show registration page
   */
  static showRegistrationPage(req, res) {
    res.render("register");
  }
}

module.exports = RegisterController;
