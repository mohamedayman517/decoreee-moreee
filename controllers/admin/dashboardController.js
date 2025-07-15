const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");

class DashboardController {
  /**
   * Show admin dashboard - نفس المنطق من routes/admin/dashboard.js
   */
  static async showDashboard(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== "Admin") {
        return res.status(403).send("Access denied. Admins only.");
      }
      
      const engineers = await User.find({ role: "Engineer" }).lean();

      let allBookings = [];
      let totalRevenue = 0;

      // Collect all bookings from all engineers
      engineers.forEach((engineer) => {
        if (Array.isArray(engineer.bookings)) {
          engineer.bookings.forEach((booking) => {
            // Add engineer name to booking
            booking.engineerName = engineer.firstName + " " + engineer.lastName;

            // Add booking to general array
            allBookings.push(booking);

            // Calculate commission
            if (booking.commission) {
              totalRevenue += booking.commission;
            }
          });
        }
      });

      res.render("AdminDashboard", {
        engineers,
        bookings: allBookings,
        totalRevenue,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error loading admin dashboard.");
    }
  }

  /**
   * Get total client count
   */
  static async getClientCount(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }

      // Count all clients in the database
      const clientCount = await Client.countDocuments();

      res.json({ count: clientCount });
    } catch (error) {
      console.error("Error fetching client count:", error);
      res.status(500).json({ message: "Error fetching client count" });
    }
  }
}

module.exports = DashboardController;
