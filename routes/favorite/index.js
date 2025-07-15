const express = require("express");
const router = express.Router();

// Import all favorite sub-routes
const manageRoutes = require("./manage");
const viewRoutes = require("./view");

// Use all favorite routes
router.use("/", manageRoutes);
router.use("/", viewRoutes);

module.exports = router;
