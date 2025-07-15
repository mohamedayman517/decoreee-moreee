const express = require("express");
const router = express.Router();
const VerificationController = require("../../controllers/auth/verificationController");

// Account verification route - استخدام Controller
router.post("/verify-account", VerificationController.verifyAccount);

// Verify page route - استخدام Controller
router.get("/verify", VerificationController.showVerificationPage);

module.exports = router;
