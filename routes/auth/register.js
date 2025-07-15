const express = require("express");
const router = express.Router();
const RegisterController = require("../../controllers/auth/registerController");
const { isNotAuthenticated } = require("../../middleware/auth/authenticate");

// Registration route - استخدام Controller
router.post("/register", RegisterController.register);

// Registration page route - استخدام Controller مع middleware
router.get(
  "/register",
  isNotAuthenticated,
  RegisterController.showRegistrationPage
);

module.exports = router;
