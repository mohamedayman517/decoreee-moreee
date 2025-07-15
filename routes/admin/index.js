const express = require("express");
const router = express.Router();

// Import all admin sub-routes
const dashboardRoutes = require("./dashboard");
const engineerRoutes = require("./engineers");

// Use all admin routes
router.use("/", dashboardRoutes);
router.use("/", engineerRoutes);

module.exports = router;
