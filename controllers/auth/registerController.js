const bcrypt = require("bcrypt");
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");

class RegisterController {
  /**
   * Handle user registration - نفس المنطق من routes/auth/register.js
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

      // فحص الإيميل في كلا النموذجين لمنع التكرار
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
            "هذا البريد الإلكتروني مسجل مسبقاً. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.",
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
      res.status(500).json({ message: "Error during registration" });
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
