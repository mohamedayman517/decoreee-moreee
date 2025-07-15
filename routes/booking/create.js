const express = require("express");
const router = express.Router();
const CreateBookingController = require("../../controllers/booking/createController");
const { isAuthenticated } = require("../../middleware/auth/authenticate");

// عرض صفحة الحجز - استخدام Controller
router.get(
  "/booking",
  isAuthenticated,
  CreateBookingController.showBookingPage
);

// معالجة بيانات الحجز - استخدام Controller
router.post(
  "/booking",
  isAuthenticated,
  CreateBookingController.processBooking
);

// Proceed to payment page - استخدام Controller
router.post(
  "/proceed-to-payment",
  isAuthenticated,
  CreateBookingController.proceedToPayment
);

// Payment success page - استخدام Controller
router.get("/payment-success", CreateBookingController.showPaymentSuccess);

module.exports = router;
