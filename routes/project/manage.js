const express = require("express");
const router = express.Router();
const fs = require("fs");
const Project = require("../../models/projectSchema");
const { upload } = require("./helpers");

// Update project
router.put("/:id", upload.single("projectImage"), async (req, res) => {
  try {
    const { projectName, projectType, projectArea, projectPrice } = req.body;

    if (!projectName || !projectType || !projectArea || !projectPrice) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const area = parseFloat(projectArea);
    const price = parseFloat(projectPrice);

    if (isNaN(area) || area <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project area." });
    }
    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project price." });
    }

    const updateData = {
      name: projectName,
      type: projectType,
      area: area,
      price: price,
    };

    // Handle image update if provided
    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString("base64");
      updateData.image = `data:${req.file.mimetype};base64,${base64Image}`;
      
      // Clean up temp file
      fs.unlinkSync(req.file.path);
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project updated successfully" });
  } catch (error) {
    console.error("Error updating project:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error updating project" });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }
    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    console.error("Error deleting project:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while deleting project.",
      });
  }
});

module.exports = router;
