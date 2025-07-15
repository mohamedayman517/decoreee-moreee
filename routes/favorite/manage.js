const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");

// Add engineer to favorites
router.post("/api/favorites/add", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Please login to add favorites" });
    }

    const { engineerId } = req.body;
    if (!engineerId) {
      return res.status(400).json({ error: "Engineer ID is required" });
    }

    // Get client by email instead of ID
    const client = await Client.findOne({ email: req.session.user.email });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Get engineer details
    const engineer = await User.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ error: "Engineer not found" });
    }

    // Initialize favoriteEngineers array if it doesn't exist
    if (!Array.isArray(client.favoriteEngineers)) {
      client.favoriteEngineers = [];
    }

    // Check if engineer is already in favorites
    const isAlreadyFavorite = client.favoriteEngineers.some(
      (fav) => fav.engineerId.toString() === engineerId
    );

    if (isAlreadyFavorite) {
      return res
        .status(400)
        .json({ error: "Engineer is already in favorites" });
    }

    // Add engineer to favorites
    client.favoriteEngineers.push({
      engineerId: engineer._id,
      engineerName: `${engineer.firstName} ${engineer.lastName}`,
      profilePhoto: engineer.profilePhoto || "/uploads/default.png",
      specialties: engineer.specialties || [],
      addedAt: new Date(),
    });

    await client.save();

    res.json({
      message: "Engineer added to favorites successfully",
      favorite: client.favoriteEngineers[client.favoriteEngineers.length - 1],
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Error adding to favorites" });
  }
});

// Handle missing engineerId parameter
router.delete("/api/favorites/remove", (req, res) => {
  res.status(400).json({
    error: "Engineer ID is required",
    message:
      "Please provide engineerId parameter in the URL: /api/favorites/remove/:engineerId",
  });
});

// Remove engineer from favorites
router.delete("/api/favorites/remove/:engineerId", async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ error: "Please login to remove favorites" });
    }

    const { engineerId } = req.params;

    // Get client by email
    const client = await Client.findOne({ email: req.session.user.email });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Initialize favoriteEngineers array if it doesn't exist
    if (!Array.isArray(client.favoriteEngineers)) {
      client.favoriteEngineers = [];
    }

    // Find and remove the engineer from favorites
    const initialLength = client.favoriteEngineers.length;
    client.favoriteEngineers = client.favoriteEngineers.filter(
      (fav) => fav.engineerId.toString() !== engineerId
    );

    if (client.favoriteEngineers.length === initialLength) {
      return res.status(404).json({ error: "Engineer not found in favorites" });
    }

    await client.save();

    res.json({ message: "Engineer removed from favorites successfully" });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ error: "Error removing from favorites" });
  }
});

module.exports = router;
