const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");
const bcrypt = require("bcrypt");

class CustomerRegisterController {
  /**
   * Show customer registration page
   */
  static showRegistrationPage(req, res) {
    const clientUser = req.session.user;
    res.render("registerCustomer", { user: clientUser });
  }

  /**
   * Handle customer registration
   */
  static async registerCustomer(req, res) {
    try {
      const { Name, email, password, phone, bio } = req.body;

      // Check email in both models to prevent duplication
      console.log("🔍 [Customer Registration] Checking email:", email);
      const existingUser = await User.findOne({ email });
      const existingClient = await Client.findOne({ email });

      console.log(
        "👤 [Customer Registration] Existing User:",
        existingUser ? "Found" : "Not found"
      );
      console.log(
        "👥 [Customer Registration] Existing Client:",
        existingClient ? "Found" : "Not found"
      );

      if (existingUser || existingClient) {
        console.log(
          "❌ [Customer Registration] Email already exists, rejecting registration"
        );
        return res.status(400).json({
          success: false,
          message:
            "هذا البريد الإلكتروني مسجل مسبقاً. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.",
        });
      }

      console.log(
        "✅ [Customer Registration] Email is unique, proceeding with registration"
      );

      // Generate a unique customId
      const customId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      const hashedPassword = await bcrypt.hash(password, 10);

      // Handle profile photo and convert to Base64
      let profilePhotoBase64 = null;
      if (req.files && req.files["profilePhoto"]) {
        const profilePhotoFile = req.files["profilePhoto"][0];
        const fs = require("fs");
        const imageBuffer = fs.readFileSync(profilePhotoFile.path);
        const base64Image = imageBuffer.toString("base64");
        profilePhotoBase64 = `data:${profilePhotoFile.mimetype};base64,${base64Image}`;

        // Delete temp file after conversion
        fs.unlinkSync(profilePhotoFile.path);
      }

      // Create user object with basic fields
      const userObj = {
        name: Name,
        email,
        password: hashedPassword,
        phone,
        customId,
        bio,
      };

      // Add profile photo as Base64
      userObj.profilePhoto = profilePhotoBase64 || "/uploads/default.png";

      const newUser = new Client(userObj);

      await newUser.save();
      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          name: `${newUser.name}`,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  }
}

module.exports = CustomerRegisterController;
