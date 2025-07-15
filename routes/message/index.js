const express = require("express");
const router = express.Router();

// Import all message sub-routes
const chatRoutes = require("./chat");
const messageRoutes = require("./messages");

// Use all message routes
router.use("/api", chatRoutes);
router.use("/api", messageRoutes);

module.exports = router;
