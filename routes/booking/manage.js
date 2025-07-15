const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");
const { isAuthenticated } = require("./helpers");

// Submit review for booking
router.post("/submit-review", isAuthenticated, async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;
    const client = await Client.findOne({ "bookings.bookingId": bookingId });
    if (!client) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const bookingIndex = client.bookings.findIndex(
      (b) => b.bookingId === bookingId
    );
    if (bookingIndex === -1) {
      return res.status(404).json({ error: "Booking not found" });
    }
    client.bookings[bookingIndex].rating = rating;
    client.bookings[bookingIndex].review = review;
    await client.save();

    res.status(200).json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// Delete booking
router.delete("/delete-booking/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Delete from Engineer's bookings
    const updatedEngineer = await User.findOneAndUpdate(
      { "bookings.bookingId": bookingId },
      { $pull: { bookings: { bookingId: bookingId } } },
      { new: true }
    );

    // Delete from Client's bookings
    const updatedClient = await Client.findOneAndUpdate(
      { "bookings.bookingId": bookingId },
      { $pull: { bookings: { bookingId: bookingId } } },
      { new: true }
    );

    if (!updatedEngineer && !updatedClient) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.json({
      success: true,
      message: "Booking deleted successfully",
      updatedEngineer: updatedEngineer ? true : false,
      updatedClient: updatedClient ? true : false,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message,
    });
  }
});

module.exports = router;
