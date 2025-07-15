const express = require("express");
const router = express.Router();
const Package = require("../../models/packageSchema");
const User = require("../../models/userSchema");

// Create multiple packages
router.post("/add-packages", async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    const { occasionType, packages } = req.body;

    // Validation
    if (!occasionType || !packages || !Array.isArray(packages)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    // Check package limit (4 packages per engineer)
    const existingCount = await Package.countDocuments({
      engID: req.session.user.id,
      eventType: occasionType,
    });
    if (existingCount + packages.length > 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum package limit reached (3 packages per occasion)",
      });
    }

    // Prepare packages for insertion
    const packagesToInsert = packages.map((pkg) => ({
      engID: req.session.user.id,
      name: pkg.name,
      description: pkg.description || `${pkg.name} Package`,
      price: parseFloat(pkg.price),
      eventType: occasionType,
      essentialItems: pkg.services.filter((s) => s.trim()),
    }));

    // Insert packages
    const result = await Package.insertMany(packagesToInsert);

    res.json({
      success: true,
      message: "Packages created successfully",
      packages: result,
    });
  } catch (error) {
    console.error("Error creating packages:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
