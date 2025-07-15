const express = require("express");
const router = express.Router();
const Package = require("../../models/packageSchema");
const User = require("../../models/userSchema");

// Get engineer's packages
router.get("/engineer/:engID", async (req, res) => {
  try {
    const packages = await Package.find({ engID: req.params.engID });
    res.json({ success: true, packages });
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// جلب كل المهندسين مع باكدجاتهم لمناسبة معينة
router.get("/by-occasion", async (req, res) => {
  try {
    console.log("🔍 /by-occasion route accessed");
    console.log("Query parameters:", req.query);
    console.log("Request headers:", req.headers);

    const occasion = req.query.occasion;
    if (!occasion) {
      console.log("❌ No occasion provided");
      return res.status(400).json({
        success: false,
        message: "Occasion parameter is required",
      });
    }

    console.log(`🔍 Searching for engineers with occasion: ${occasion}`);

    // Test database connection
    console.log("🔍 Testing database connection...");
    const mongoose = require("mongoose");
    console.log("Database connection state:", mongoose.connection.readyState);

    if (mongoose.connection.readyState !== 1) {
      console.log("❌ Database not connected");
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }

    // جلب المهندسين الذين لديهم التخصص المطلوب (فلترة case-insensitive)
    const engineers = await User.find({
      role: "Engineer",
      isApproved: true, // فقط المهندسين المعتمدين
      isVerified: true, // فقط المهندسين المؤكدين
      specialties: { $in: [new RegExp(`^${occasion}$`, "i")] }, // فلترة case-insensitive
    });

    console.log(`✅ Found ${engineers.length} engineers`);

    // جلب الباكدجات الخاصة بالمناسبة
    const packages = await Package.find({ eventType: occasion });
    console.log(`✅ Found ${packages.length} packages`);

    // ربط كل مهندس بالباكدجات الخاصة به لهذه المناسبة (إن وجدت)
    const engineersWithPackages = engineers.map((engineer) => {
      const engineerPackages = packages.filter(
        (pkg) => pkg.engID.toString() === engineer._id.toString()
      );
      return {
        ...engineer.toObject(),
        packages: engineerPackages,
        hasPackages: engineerPackages.length > 0, // إضافة علامة إذا كان لديه باكدجات أم لا
      };
    });

    console.log("✅ Data prepared, rendering template");

    // إرسال البيانات للواجهة الأمامية (eng.ejs)
    res.render("eng", {
      engineers: engineersWithPackages,
      occasion,
      user: req.session && req.session.user ? req.session.user : null,
    });
  } catch (err) {
    console.error("❌ Error in /by-occasion:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }
});

module.exports = router;
