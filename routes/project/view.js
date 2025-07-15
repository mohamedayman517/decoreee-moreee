const express = require("express");
const router = express.Router();
const Project = require("../../models/projectSchema");

// Get project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error("Error fetching project:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching project" });
  }
});

module.exports = router;
