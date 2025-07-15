const express = require("express");
const router = express.Router();

// Import all auth sub-routes
const loginRoutes = require("./login");
const registerRoutes = require("./register");
const verificationRoutes = require("./verification");
const paymentRoutes = require("./payment");
const webhookRoutes = require("./webhooks");

// Use all auth routes
router.use("/", loginRoutes);
router.use("/", registerRoutes);
router.use("/", verificationRoutes);
router.use("/", paymentRoutes);
router.use("/", webhookRoutes);

module.exports = router;
