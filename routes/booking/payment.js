const express = require("express");
const router = express.Router();
const PaymentController = require("../../controllers/booking/paymentController");
const { isAuthenticated } = require("../../middleware/auth/authenticate");

// Process payment for booking - استخدام Controller
router.post(
  "/process-payment",
  isAuthenticated,
  PaymentController.processPayment
);

module.exports = router;
