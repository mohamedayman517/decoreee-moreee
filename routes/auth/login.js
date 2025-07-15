const express = require("express");
const router = express.Router();
const LoginController = require("../../controllers/auth/loginController");
const { isNotAuthenticated } = require("../../middleware/auth/authenticate");
const { validateLogin } = require("../../middleware/validation/authValidation");

// Login route - مع validation middleware
router.post("/login", validateLogin, LoginController.login);

// Login page route - مع middleware للتحقق من عدم تسجيل الدخول
router.get("/login", isNotAuthenticated, (req, res) => {
  res.render("login");
});

// Logout route - استخدام Controller
router.post("/logout", LoginController.logout);

module.exports = router;
