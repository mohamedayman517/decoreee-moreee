const { body, validationResult } = require("express-validator");

/**
 * Validation middleware for booking creation
 */
const validateBooking = [
  body("packageId")
    .notEmpty()
    .withMessage("Package ID is required")
    .isMongoId()
    .withMessage("Invalid package ID format"),

  body("eventDate")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        throw new Error("Event date cannot be in the past");
      }
      return true;
    }),

  body("eventType")
    .notEmpty()
    .withMessage("Event type is required")
    .isIn(["Wedding", "Birthday", "BabyShower", "Engagement", "Anniversary", "Corporate"])
    .withMessage("Invalid event type"),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

/**
 * Validation middleware for payment processing
 */
const validatePayment = [
  body("payment_method_id")
    .notEmpty()
    .withMessage("Payment method is required"),

  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => {
      if (value <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return true;
    }),

  body("package_id")
    .notEmpty()
    .withMessage("Package ID is required")
    .isMongoId()
    .withMessage("Invalid package ID format"),

  body("event_date")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("user_id")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

/**
 * Validation middleware for booking review
 */
const validateReview = [
  body("bookingId")
    .notEmpty()
    .withMessage("Booking ID is required"),

  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("review")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Review must be less than 1000 characters"),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Review validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  validateBooking,
  validatePayment,
  validateReview,
};
