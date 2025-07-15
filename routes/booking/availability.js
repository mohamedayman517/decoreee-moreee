const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");
const { checkEngineerAvailability } = require("./helpers");

// Route to check engineer availability for a specific date
router.post("/api/check-availability", async (req, res) => {
  try {
    const { engineerId, eventDate } = req.body;

    if (!engineerId || !eventDate) {
      return res.status(400).json({
        available: false,
        message: "Engineer ID and event date are required",
      });
    }

    const availabilityResult = await checkEngineerAvailability(
      engineerId,
      eventDate
    );

    return res.json({
      available: availabilityResult.available,
      message: availabilityResult.message,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return res.status(500).json({
      available: false,
      message: "Error checking availability",
    });
  }
});

// Route to get engineer's booked dates
router.get("/api/engineer-booked-dates/:engineerId", async (req, res) => {
  try {
    const { engineerId } = req.params;

    const engineer = await User.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found" });
    }

    const bookedDates = [];

    // Get bookings from Client schema (date field is Date object)
    const clients = await Client.find({
      "bookings.engineerId": engineerId,
      "bookings.status": {
        $in: ["confirmed", "pending", "Confirmed", "Pending"],
      },
    });

    clients.forEach((client) => {
      client.bookings.forEach((booking) => {
        if (
          booking.engineerId.toString() === engineerId &&
          (booking.status === "confirmed" ||
            booking.status === "pending" ||
            booking.status === "Confirmed" ||
            booking.status === "Pending")
        ) {
          // Convert Date object to YYYY-MM-DD format
          const dateStr = booking.date.toISOString().split("T")[0];
          bookedDates.push(dateStr);
        }
      });
    });

    // Get bookings from User schema (eventDate field is String)
    const userBookings = await User.find({
      _id: engineerId,
      "bookings.status": {
        $in: ["Active", "Pending"],
      },
    });

    userBookings.forEach((user) => {
      user.bookings.forEach((booking) => {
        if (booking.status === "Active" || booking.status === "Pending") {
          bookedDates.push(booking.eventDate);
        }
      });
    });

    // Remove duplicates
    const uniqueBookedDates = [...new Set(bookedDates)];

    res.json({ bookedDates: uniqueBookedDates });
  } catch (error) {
    console.error("Error getting booked dates:", error);
    res.status(500).json({ message: "Error retrieving booked dates" });
  }
});

module.exports = router;
