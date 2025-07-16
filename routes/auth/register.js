const express = require("express");
const router = express.Router();
const RegisterController = require("../../controllers/auth/registerController");
const { isNotAuthenticated } = require("../../middleware/auth/authenticate");

// Registration route - using Controller
router.post("/register", RegisterController.register);

// Registration page route - using Controller with middleware
router.get(
  "/register",
  isNotAuthenticated,
  RegisterController.showRegistrationPage
);

module.exports = router;
