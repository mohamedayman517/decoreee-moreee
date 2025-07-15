const express = require("express");
const router = express.Router();
const IndexController = require("../controllers/common/indexController");

// Show homepage with role-based redirects - استخدام Controller
router.get("/", IndexController.showHomepage);

module.exports = router;
