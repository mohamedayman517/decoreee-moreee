const express = require("express");
const router = express.Router();
const DashboardController = require("../../controllers/admin/dashboardController");

// Admin Dashboard - استخدام Controller
router.get("/AdminDashboard", DashboardController.showDashboard);

// Route to get total client count - استخدام Controller
router.get("/admin/client-count", DashboardController.getClientCount);

module.exports = router;
