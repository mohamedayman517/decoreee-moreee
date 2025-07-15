const express = require("express");
const router = express.Router();

// Import all profile sub-routes
const engineerRoutes = require("./engineer");
const clientRoutes = require("./client");
const ratingRoutes = require("./rating");
const updateRoutes = require("./update");

// Use all profile routes
router.use("/", engineerRoutes);
router.use("/", clientRoutes);
router.use("/", ratingRoutes);
router.use("/", updateRoutes);

// Export updateBadges function from engineer routes
router.updateBadges = engineerRoutes.updateBadges;

module.exports = router;
