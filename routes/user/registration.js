const { body, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { upload, convertToBase64, cleanupTempFile } = require("./helpers");

// Registration page route
router.get("/register", (req, res) => {
  const clientUser = req.session.user;
  res.render("register", { user: clientUser });
});

// Registration route with validation
router.post(
  "/register",
  (req, res, next) => {
    // Handle Multer errors
    const uploadMiddleware = upload.fields([
      { name: "profilePhoto", maxCount: 1 },
      { name: "idCardPhoto", maxCount: 1 },
    ]);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error
        console.error("❌ Multer error:", err);
        let errorMessage = "File upload error";

        if (err.code === "LIMIT_FILE_SIZE") {
          errorMessage = "File size too large. Maximum allowed size is 5MB.";
        } else if (err.code === "LIMIT_FILE_COUNT") {
          errorMessage = "Too many files. Maximum 2 files allowed.";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
          errorMessage = "Unexpected file field. Please check your form.";
        } else {
          errorMessage = `File upload error: ${err.message}`;
        }

        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      } else if (err) {
        // Custom file filter error or other errors
        console.error("❌ File upload error:", err);
        return res.status(400).json({
          success: false,
          message:
            err.message ||
            "An error occurred during file upload. Please try again.",
        });
      }

      // Files uploaded successfully, continue processing
      next();
    });
  },
  // Validation middleware
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    ),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isAlpha()
    .withMessage("First name should contain only letters"),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isAlpha()
    .withMessage("Last name should contain only letters"),
  body("phone")
    .isMobilePhone(["ar-EG", "en-US", "sa", "ae"], { strictMode: false })
    .withMessage("Enter a valid phone number"),
  body("role").isIn(["Admin", "User", "Engineer"]).withMessage("Invalid role"),
  body("bio")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Bio must be less than 1000 characters"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, password, phone, role, bio } =
        req.body;

      // Check email in both models to prevent duplication
      console.log("🔍 Checking email:", email);
      const existingUser = await User.findOne({ email });
      const existingClient = await Client.findOne({ email });

      console.log("👤 Existing User:", existingUser ? "Found" : "Not found");
      console.log(
        "👥 Existing Client:",
        existingClient ? "Found" : "Not found"
      );

      if (existingUser || existingClient) {
        console.log("❌ Email already exists, rejecting registration");
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered. Please use a different email or login.",
        });
      }

      console.log("✅ Email is unique, proceeding with registration");

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate custom ID
      const customId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Handle profile photo (base64)
      let profilePhotoBase64 = null;
      if (req.files && req.files.profilePhoto) {
        const file = req.files.profilePhoto[0];
        profilePhotoBase64 = convertToBase64(file.path);
        cleanupTempFile(file.path);
      }

      // Handle ID card photo (base64) - required for engineers
      let idCardPhotoBase64 = null;
      if (req.files && req.files.idCardPhoto) {
        const file = req.files.idCardPhoto[0];
        idCardPhotoBase64 = convertToBase64(file.path);
        cleanupTempFile(file.path);
      }

      let specialtiesArr = [];
      if (req.body.specialties) {
        specialtiesArr = Array.isArray(req.body.specialties)
          ? req.body.specialties
          : [req.body.specialties];
      }

      const userObj = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role,
        customId,
        bio,
        isApproved:
          role === "Admin" ? true : role === "Engineer" ? false : true,
        isVerified: false,
        hasPaidSubscription: false,
        specialties: specialtiesArr,
      };

      if (role === "Engineer") {
        userObj.profilePhoto = profilePhotoBase64 || "/uploads/default.png";
        // Ensure ID card photo is provided for engineers
        if (!idCardPhotoBase64) {
          return res.status(400).json({
            success: false,
            message: "ID card photo is required for engineers",
          });
        }

        // Log additional information for debugging
        console.log("✅ ID Card Photo processed successfully");
        userObj.idCardPhoto = idCardPhotoBase64;
      } else {
        if (profilePhotoBase64) {
          userObj.profilePhoto = profilePhotoBase64;
        }
      }

      const newUser = new User(userObj);
      await newUser.save();

      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          name: `${newUser.firstName} ${newUser.lastName}`,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  }
);

module.exports = router;
