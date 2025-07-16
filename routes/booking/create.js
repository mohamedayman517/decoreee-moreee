const express = require("express");
const router = express.Router();
const CreateBookingController = require("../../controllers/booking/createController");
const { isAuthenticated } = require("../../middleware/auth/authenticate");

// Show booking page - using Controller
router.get(
  "/booking",
  isAuthenticated,
  CreateBookingController.showBookingPage
);

// Process booking data - using Controller
router.post(
  "/booking",
  isAuthenticated,
  CreateBookingController.processBooking
);

// Proceed to payment page - using Controller
router.post(
  "/proceed-to-payment",
  isAuthenticated,
  CreateBookingController.proceedToPayment
);

// Payment success page - using Controller
router.get("/payment-success", CreateBookingController.showPaymentSuccess);

module.exports = router;
