const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");

// Get all engineers
router.get("/api/engineers", async (req, res) => {
  try {
    const engineers = await User.find({ role: "Engineer" });
    res.json(engineers);
  } catch (error) {
    console.error("Error fetching engineers:", error);
    res.status(500).json({ error: "Error fetching engineers" });
  }
});

// Get current user's favorite engineers
router.get('/api/favorites', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json([]);
    }
    const client = await Client.findOne({ email: req.session.user.email });
    if (!client) {
      return res.status(404).json([]);
    }
    res.json(Array.isArray(client.favoriteEngineers) ? client.favoriteEngineers : []);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Show favorites page
router.get("/favorites", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const client = await Client.findOne({ email: req.session.user.email });
    if (!client) {
      return res.redirect("/login");
    }

    // Get detailed information for favorite engineers
    const favoriteEngineers = [];
    if (Array.isArray(client.favoriteEngineers)) {
      for (const fav of client.favoriteEngineers) {
        const engineer = await User.findById(fav.engineerId);
        if (engineer) {
          favoriteEngineers.push({
            ...fav.toObject(),
            engineerDetails: engineer,
          });
        }
      }
    }

    res.render("favorites", {
      user: req.session.user,
      isAuthenticated: !!req.session.user,
      favoriteEngineers,
    });
  } catch (error) {
    console.error("Error loading favorites page:", error);
    res.status(500).send("Error loading favorites page");
  }
});

module.exports = router;
