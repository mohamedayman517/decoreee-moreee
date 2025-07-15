const express = require("express");
const router = express.Router();
const fs = require("fs");
const Project = require("../../models/projectSchema");
const { upload } = require("./helpers");

// Create new project
router.post("/create", upload.single("projectImage"), async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({
        success: false,
        message: "Please log in to create projects.",
      });
    }

    const { projectName, projectType, projectArea, projectPrice } = req.body;
    if (
      !projectName ||
      !projectType ||
      !projectArea ||
      !projectPrice ||
      !req.file
    ) {
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

    // Convert image to base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");
    const imageData = `data:${req.file.mimetype};base64,${base64Image}`;

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    const newProject = new Project({
      name: projectName,
      engID: req.session.user.id,
      image: imageData,
      price: price,
      type: projectType,
      area: area,
    });

    await newProject.save();
    res.json({ success: true, message: "Project created successfully" });
  } catch (error) {
    console.error("Error saving project:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error saving project" });
  }
});

module.exports = router;
