const express = require("express");
const router = express.Router();

// Import all project sub-routes
const createRoutes = require("./create");
const manageRoutes = require("./manage");
const viewRoutes = require("./view");

// Use all project routes
router.use("/", createRoutes);
router.use("/", manageRoutes);
router.use("/", viewRoutes);

module.exports = router;
