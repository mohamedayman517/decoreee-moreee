const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const { ratingSchema } = require("./helpers");

// Rate engineer route
router.post("/rate", async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const { error } = ratingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { engineerId, name, rating, comment } = req.body;

    const engineer = await User.findOne({ _id: engineerId });
    if (!engineer) {
      return res.status(404).json({ message: " Engineer Not Found ." });
    }

    console.log("Engineer found:", engineer);

    const existingReview = engineer.testimonials.find((t) => t.name === name);

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      engineer.testimonials.push({ name, rating, comment });
    }

    const totalRatings = engineer.testimonials.length;
    const sumOfRatings = engineer.testimonials.reduce(
      (sum, t) => sum + t.rating,
      0
    );
    engineer.averageRating = sumOfRatings / totalRatings;

    await engineer.save();
    console.log("Updated engineer:", engineer);

    res.status(200).json({
      message: " Send Successfully!",
      averageRating: engineer.averageRating.toFixed(1),
      testimonials: engineer.testimonials,
    });
  } catch (error) {
    console.error("Error updating engineer:", error);
    res.status(500).json({ message: "Error during send ." });
  }
});

module.exports = router;
