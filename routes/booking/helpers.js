const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");

// Helper function to find client by ID
async function findClientById(userId) {
  if (!userId) {
    console.error("No user ID provided for client lookup");
    throw new Error("User ID is required");
  }

  try {
    const client = await Client.findById(userId);
    if (!client) {
      console.error(`Client not found with ID: ${userId}`);
      throw new Error("Client not found");
    }
    return client;
  } catch (error) {
    if (error.name === "CastError") {
      console.error(`Invalid user ID format: ${userId}`);
      throw new Error("Invalid user ID format");
    }
    throw error;
  }
}

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ error: "Please log in to submit a review" });
};

// Function to check engineer availability for a specific date
async function checkEngineerAvailability(engineerId, eventDate) {
  console.log(`Checking availability for engineer ${engineerId} on ${eventDate}`);

  // Create date range for the event date
  const eventDateObj = new Date(eventDate);
  const startOfDay = new Date(eventDateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(eventDateObj);
  endOfDay.setHours(23, 59, 59, 999);

  console.log(`Date range: ${startOfDay} to ${endOfDay}`);

  // Check Client bookings (date field is Date object)
  const clientBookings = await Client.find({
    "bookings.engineerId": engineerId,
    "bookings.date": {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    "bookings.status": {
      $in: ["confirmed", "pending", "Confirmed", "Pending"],
    },
  });

  // Check User bookings (eventDate field is String)
  const userBookings = await User.find({
    _id: engineerId,
    "bookings.eventDate": eventDate,
    "bookings.status": {
      $in: ["Active", "Pending"],
    },
  });

  console.log(
    `Found ${clientBookings.length} client bookings and ${userBookings.length} user bookings`
  );

  // Check if any bookings exist for this date
  const hasClientBooking = clientBookings.some((client) =>
    client.bookings.some(
      (booking) =>
        booking.engineerId.toString() === engineerId &&
        booking.date >= startOfDay &&
        booking.date <= endOfDay &&
        (booking.status === "confirmed" ||
          booking.status === "pending" ||
          booking.status === "Confirmed" ||
          booking.status === "Pending")
    )
  );

  const hasUserBooking = userBookings.some((user) =>
    user.bookings.some(
      (booking) =>
        booking.eventDate === eventDate &&
        (booking.status === "Active" || booking.status === "Pending")
    )
  );

  if (hasClientBooking || hasUserBooking) {
    console.log(`Engineer is booked on ${eventDate}`);
    return {
      available: false,
      message: `Engineer is already booked on ${eventDate}`,
    };
  }

  console.log(`Engineer is available on ${eventDate}`);
  return {
    available: true,
    message: `Engineer is available on ${eventDate}`,
  };
}

module.exports = {
  findClientById,
  isAuthenticated,
  checkEngineerAvailability,
};
