const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");

// Log all requests to favorites API
router.use("/api/favorites/*", (req, res, next) => {
  console.log(`🔍 Favorites API Request: ${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  next();
});

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

// Handle missing engineerId parameter - check request body too
router.delete("/api/favorites/remove", (req, res) => {
  console.log("🔍 DELETE /api/favorites/remove accessed (missing engineerId)");
  console.log("Request body:", req.body);

  // Check if engineerId is in request body
  const engineerId = req.body.engineerId;
  if (engineerId) {
    console.log(
      `🔄 Found engineerId in body: ${engineerId}, redirecting to correct URL`
    );
    return res.status(400).json({
      error: "Incorrect URL format",
      message: `Engineer ID should be in URL path, not request body. Use: /api/favorites/remove/${engineerId}`,
      correctUrl: `/api/favorites/remove/${engineerId}`,
      providedEngineerId: engineerId,
    });
  }

  res.status(400).json({
    error: "Engineer ID is required",
    message:
      "Please provide engineerId parameter in the URL: /api/favorites/remove/:engineerId",
  });
});

// Handle GET method (common frontend mistake)
router.get("/api/favorites/remove", (req, res) => {
  console.log("🔍 GET /api/favorites/remove accessed (should be DELETE)");
  const engineerId = req.query.engineerId || req.params.engineerId;

  if (engineerId) {
    console.log(`🔄 GET request with engineerId: ${engineerId}`);
    return res.status(405).json({
      error: "Method not allowed",
      message: "Use DELETE method instead of GET",
      correctUrl: `/api/favorites/remove/${engineerId}`,
      correctMethod: "DELETE",
    });
  }

  res.status(400).json({
    error: "Engineer ID is required",
    message: "Use DELETE /api/favorites/remove/:engineerId",
  });
});

// Handle POST method - Support for frontend compatibility
router.post("/api/favorites/remove", async (req, res) => {
  try {
    console.log("🔍 POST /api/favorites/remove accessed");
    console.log("Request body:", req.body);

    if (!req.session.user) {
      console.log("❌ User not logged in");
      return res.status(401).json({
        error: "Please login to remove favorites",
      });
    }

    const engineerId = req.body.engineerId || req.body.engineer_id;

    if (!engineerId) {
      console.log("❌ No engineerId provided in POST body");
      return res.status(400).json({
        error: "Engineer ID is required",
        message: "Please provide engineerId in request body",
      });
    }

    console.log(
      `🔍 Removing engineer ${engineerId} from favorites (POST method)`
    );

    // Use req.session.user.id instead of _id (session structure uses 'id')
    const userId = req.session.user.id;
    console.log(`🔍 Looking for user with ID: ${userId}`);

    // Get client by email (more reliable than ID lookup)
    const user = await Client.findOne({ email: req.session.user.email });

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User favoriteEngineers:", user.favoriteEngineers);
    console.log("Looking for engineerId:", engineerId);

    // Initialize favoriteEngineers if it doesn't exist
    if (!user.favoriteEngineers) {
      user.favoriteEngineers = [];
    }

    // Check if engineer is in favorites (search by engineerId)
    const engineerIndex = user.favoriteEngineers.findIndex((fav) => {
      console.log("Comparing:", fav.engineerId?.toString(), "with", engineerId);
      return fav.engineerId && fav.engineerId.toString() === engineerId;
    });

    console.log("Engineer index found:", engineerIndex);

    if (engineerIndex === -1) {
      console.log("❌ Engineer not in favorites");
      return res.status(400).json({ error: "Engineer is not in favorites" });
    }

    // Remove engineer from favorites
    user.favoriteEngineers.splice(engineerIndex, 1);
    console.log("🔄 Saving user after removing engineer...");
    await user.save();
    console.log("✅ User saved successfully");

    console.log("✅ Engineer removed from favorites successfully (POST)");

    // Multiple response formats for frontend compatibility
    const response = {
      message: "Engineer removed from favorites successfully",
      method: "POST",
      success: true,
      engineerId: engineerId,
      remainingFavorites: user.favoriteEngineers.length,
      // Additional formats the frontend might expect
      status: "success",
      data: {
        engineerId: engineerId,
        removed: true,
        favoriteEngineers: user.favoriteEngineers,
      },
      // Simple success flag
      ok: true,
      // Add favorites array for frontend compatibility
      favorites: user.favoriteEngineers,
    };
    console.log("📤 Sending response:", response);

    // Set CORS headers explicitly
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error removing from favorites (POST):", error);
    res.status(500).json({
      error: "Server error",
      success: false,
    });
  }
});

// Simple remove endpoint for testing
router.post("/api/favorites/remove-simple", async (req, res) => {
  try {
    console.log("🔍 POST /api/favorites/remove-simple accessed");
    console.log("Request body:", req.body);

    // Just return success without doing anything
    const simpleResponse = { success: true };
    console.log("📤 Sending simple response:", simpleResponse);

    res.status(200).json(simpleResponse);
  } catch (error) {
    console.error("❌ Error in simple remove:", error);
    res.status(500).json({ success: false });
  }
});

// Get user's favorites list
router.get("/api/favorites/list", async (req, res) => {
  try {
    console.log("🔍 GET /api/favorites/list accessed");

    if (!req.session.user) {
      return res.status(401).json({
        error: "Please login to view favorites",
        success: false,
      });
    }

    // Use email lookup instead of ID (more reliable)
    const user = await Client.findOne({ email: req.session.user.email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        success: false,
      });
    }

    // Initialize favoriteEngineers if it doesn't exist
    if (!user.favoriteEngineers) {
      user.favoriteEngineers = [];
    }

    console.log(
      "✅ Returning favorites list:",
      user.favoriteEngineers.length,
      "items"
    );
    res.status(200).json({
      success: true,
      favorites: user.favoriteEngineers,
      count: user.favoriteEngineers.length,
    });
  } catch (error) {
    console.error("❌ Error getting favorites list:", error);
    res.status(500).json({
      error: "Server error",
      success: false,
    });
  }
});

// Remove engineer from favorites
router.delete("/api/favorites/remove/:engineerId", async (req, res) => {
  try {
    console.log(
      `🔍 DELETE /api/favorites/remove/${req.params.engineerId} accessed`
    );
    console.log(
      "Session user:",
      req.session.user ? "Logged in" : "Not logged in"
    );

    if (!req.session.user) {
      console.log("❌ User not logged in");
      return res
        .status(401)
        .json({ error: "Please login to remove favorites" });
    }

    const { engineerId } = req.params;
    console.log(`🔍 Removing engineer ${engineerId} from favorites`);

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
