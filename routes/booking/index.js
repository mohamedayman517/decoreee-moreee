const express = require("express");
const router = express.Router();

// Import all booking sub-routes
const createRoutes = require("./create");
const paymentRoutes = require("./payment");
const manageRoutes = require("./manage");
const availabilityRoutes = require("./availability");

// Use all booking routes
router.use("/", createRoutes);
router.use("/", paymentRoutes);
router.use("/", manageRoutes);
router.use("/", availabilityRoutes);

module.exports = router;
