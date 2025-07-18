const express = require("express");
const router = express.Router();
const Package = require("../../models/packageSchema");
const mongoose = require("mongoose");

// Get single package by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID format",
      });
    }

    const package = await Package.findById(id);
    if (!package) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }
    res.json({ success: true, package });
  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update a package
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID format",
      });
    }

    const { name, description, price, essentialItems } = req.body;

    // Validate input - all fields are required
    if (
      !name ||
      !description ||
      !price ||
      !essentialItems ||
      !Array.isArray(essentialItems)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, price, and essentialItems",
      });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price: parseFloat(price),
        essentialItems: essentialItems.filter((item) => item.trim()),
      },
      { new: true }
    );

    if (!updatedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.json({ success: true, package: updatedPackage });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a package
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID format",
      });
    }

    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
