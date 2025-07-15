const express = require("express");
const router = express.Router();

// Import all user sub-routes
const registrationRoutes = require("./registration");
const loginRoutes = require("./login");
const passwordResetRoutes = require("./passwordReset");

// Use all user routes
router.use("/", registrationRoutes);
router.use("/", loginRoutes);
router.use("/", passwordResetRoutes);

module.exports = router;
