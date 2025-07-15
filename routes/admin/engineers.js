const express = require("express");
const router = express.Router();
const EngineerController = require("../../controllers/admin/engineerController");

// Delete Engineer - استخدام Controller
router.delete(
  "/AdminDashboard/engineers/:id",
  EngineerController.deleteEngineer
);

// Approve Engineer - استخدام Controller
router.post("/approve-engineer", EngineerController.approveEngineer);

// Get pending engineers - استخدام Controller
router.get("/pending-engineers", EngineerController.getPendingEngineers);

// Reject Engineer - استخدام Controller
router.post("/reject-engineer", EngineerController.rejectEngineer);

module.exports = router;
