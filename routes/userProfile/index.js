const express = require("express");
const router = express.Router();

// Import all userProfile sub-routes
const viewRoutes = require("./view");
const updateRoutes = require("./update");
const passwordRoutes = require("./password");
const accountRoutes = require("./account");

// Use all userProfile routes
router.use("/", viewRoutes);
router.use("/", updateRoutes);
router.use("/", passwordRoutes);
router.use("/", accountRoutes);

module.exports = router;
