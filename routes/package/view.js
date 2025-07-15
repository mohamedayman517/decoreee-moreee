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
    const occasion = req.query.occasion;
    if (!occasion) return res.status(400).send("Occasion is required");

    // جلب المهندسين الذين لديهم التخصص المطلوب (فلترة case-insensitive)
    const engineers = await User.find({
      role: "Engineer",
      isApproved: true, // فقط المهندسين المعتمدين
      isVerified: true, // فقط المهندسين المؤكدين
      specialties: { $in: [new RegExp(`^${occasion}$`, "i")] }, // فلترة case-insensitive
    });

    // جلب الباكدجات الخاصة بالمناسبة
    const packages = await Package.find({ eventType: occasion });

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

    // إرسال البيانات للواجهة الأمامية (eng.ejs)
    res.render("eng", {
      engineers: engineersWithPackages,
      occasion,
      user: req.session && req.session.user ? req.session.user : null,
    });
  } catch (err) {
    console.error("Error in /by-occasion:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
