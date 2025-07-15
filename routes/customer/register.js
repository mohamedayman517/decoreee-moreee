const { body, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const CustomerRegisterController = require("../../controllers/customer/registerController");
const { upload } = require("./helpers");

// Show customer registration page - استخدام Controller
router.get(
  "/registerCustomer",
  CustomerRegisterController.showRegistrationPage
);

// Customer registration with validation
router.post(
  "/registerCustomer",
  upload.fields([{ name: "profilePhoto", maxCount: 1 }]),

  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    ),

  body("Name")
    .notEmpty()
    .withMessage(" Name is required")
    .matches(/^[A-Za-z ]+$/)
    .withMessage(" Name should contain only letters"),

  body("phone")
    .isMobilePhone(["ar-EG", "en-US", "sa", "ae"], { strictMode: false })
    .withMessage("Enter a valid phone number"),
  body("bio")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Bio must be less than 1000 characters"),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },

  // Customer registration handler - استخدام Controller
  CustomerRegisterController.registerCustomer
);

module.exports = router;
