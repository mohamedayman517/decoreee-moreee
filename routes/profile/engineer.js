const express = require("express");
const router = express.Router();
const Project = require("../../models/projectSchema");
const Package = require("../../models/packageSchema");
const User = require("../../models/userSchema");
const { checkUserVerification } = require("./helpers");

// Engineer profile route
router.get("/profile/:id", async (req, res) => {
  try {
    const profile = await User.findById(req.params.id);
    const projects = await Project.find({ engID: req.params.id });
    const packages = await Package.find({ engID: req.params.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // التحقق من أن المهندس قد قام بتأكيد البريد الإلكتروني
    const verificationCheck = checkUserVerification(profile);
    if (!verificationCheck.isVerified) {
      return res.status(403).json({
        success: false,
        message: verificationCheck.message,
      });
    }

    res.render("profile", {
      title: `${profile.firstName} ${profile.lastName} - Profile`,
      engData: profile,
      projects: projects,
      packages: packages,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Error loading profile",
    });
  }
});

// Engineers listing route
router.get("/eng", async (req, res) => {
  try {
    const clientUser = req.session.user;
    const occasion = req.query.occasion;

    let engineers;
    if (occasion) {
      engineers = await User.find({
        role: "Engineer",
        specialties: { $in: [new RegExp(`^${occasion}$`, "i")] },
      })
        .sort({ rating: -1 })
        .lean();
    } else {
      engineers = await User.find({ role: "Engineer" }).lean();
    }

    engineers.forEach((engineer) => {
      if (!Array.isArray(engineer.specialties)) {
        engineer.specialties = [];
      }
    });

    if (occasion) {
      engineers = await Promise.all(
        engineers.map(async (engineer) => {
          const packages = await Package.find({
            engID: engineer._id.toString(),
            type: new RegExp(`^${occasion}$`, "i"),
          })
            .limit(4)
            .lean();

          engineer.packages = packages;
          engineer.bookings = engineer.bookings;

          return engineer;
        })
      );
    } else {
      for (let engineer of engineers) {
        engineer.packages = await Package.find({
          engID: engineer._id.toString(),
        })
          .limit(4)
          .lean();
      }

      engineers = engineers.filter((engineer) => engineer.packages.length > 0); // Filter engineers with no projects
    }

    res.render("eng", {
      user: clientUser,
      engineers,
      isAuthenticated: !!clientUser,
      occasion: occasion || "All Occasions",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update badges function
const updateBadges = async () => {
  try {
    const engineers = await User.find();

    for (let engineer of engineers) {
      let newBadges = [];
      const projectCount = await Project.countDocuments({
        engID: engineer._id,
      });

      const isPremium =
        engineer.bookings.length >= 15 &&
        engineer.averageRating >= 4 &&
        projectCount >= 10;

      if (isPremium) {
        newBadges = ["Premium Designer"];
      } else {
        if (engineer.averageRating >= 4.5) newBadges.push("Top Rated");
        if (engineer.bookings.length >= 10) newBadges.push("Most Booked");
        if (engineer.bookings.length === 0 && engineer.averageRating === 0)
          newBadges.push("New Talent");
        if (projectCount >= 10) newBadges.push("Project Master");
      }

      engineer.badges = newBadges;
      await engineer.save();
    }

    console.log("Badges updated successfully");
  } catch (error) {
    console.error("Error updating badges:", error);
  }
};

// Export the updateBadges function for use in other modules
router.updateBadges = updateBadges;

module.exports = router;
