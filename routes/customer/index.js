const express = require("express");
const router = express.Router();

// Import all customer sub-routes
const registerRoutes = require("./register");

// Use all customer routes
router.use("/", registerRoutes);

module.exports = router;
