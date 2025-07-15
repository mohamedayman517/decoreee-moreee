const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/common/contactController");

// Show contact page - استخدام Controller
router.get("/contact", ContactController.showContactPage);

// Handle contact form submission - استخدام Controller
router.post("/contact", ContactController.submitContactForm);

module.exports = router;
