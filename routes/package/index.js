const express = require("express");
const router = express.Router();

// Import all package sub-routes
const createRoutes = require("./create");
const manageRoutes = require("./manage");
const viewRoutes = require("./view");

// Use all package routes
router.use("/", createRoutes);
router.use("/", manageRoutes);
router.use("/", viewRoutes);

module.exports = router;
