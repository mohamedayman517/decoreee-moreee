const express = require("express");
const router = express.Router();

// Import all package sub-routes
const createRoutes = require("./create");
const manageRoutes = require("./manage");
const viewRoutes = require("./view");

// Use all package routes
// Note: viewRoutes must come before manageRoutes to prevent /:id from catching specific routes like /by-occasion
router.use("/", createRoutes);
router.use("/", viewRoutes);
router.use("/", manageRoutes);

module.exports = router;
