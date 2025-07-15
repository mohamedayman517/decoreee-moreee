const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");
const Package = require("../../models/packageSchema");

class CreateBookingController {
  /**
   * Show booking page - نفس المنطق من routes/booking/create.js
   */
  static async showBookingPage(req, res) {
    const clientUser = req.session.user;
    if (!clientUser) {
      return res.redirect("/");
    }

    // جلب بيانات العميل الكاملة من قاعدة البيانات
    let clientData = null;
    try {
      clientData = await Client.findById(clientUser.id).lean();
      if (!clientData) {
        console.log("Client not found in database, using session data");
        clientData = clientUser;
      } else {
        console.log("Client found in database:", clientData.name);
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
      clientData = clientUser;
    }

    let eventType = req.query.eventType || "";
    if (eventType) {
      eventType =
        eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase();
      if (eventType.replace(/\s/g, "").toLowerCase() === "babyshower")
        eventType = "BabyShower";
    }

    let pkg = null;
    if (req.query.packageId) {
      try {
        pkg = await Package.findById(req.query.packageId).lean();
      } catch (e) {
        pkg = null;
      }
    }

    res.render("Booking", {
      stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      client: clientData,
      package: pkg,
      user: clientUser,
      isAuthenticated: !!clientUser,
      selectedEventType: eventType,
    });
  }

  /**
   * Process booking data - نفس المنطق من routes/booking/create.js
   */
  static async processBooking(req, res) {
    try {
      const { packageId, eventDate, eventType } = req.body;
      const pkg = await Package.findById(packageId).lean();
      if (!pkg) {
        return res.status(404).send("Package not found");
      }
      const originalPrice = pkg.price;
      const commission = Math.round(originalPrice * 0.1);
      const totalPrice = originalPrice;
      const deposit = Math.round(totalPrice * 0.5);
      const vendorShare = totalPrice - commission;

      const bookingId = `DC-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 9000 + 1000
      )}`;

      res.render("confirmation", {
        user: req.session.user,
        isAuthenticated: !!req.session.user,
        package: pkg,
        packageName: pkg.name,
        bookingId: bookingId,
        price: totalPrice,
        deposit: deposit,
        eventDate: eventDate,
        originalPrice: originalPrice,
        stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
        eventType: eventType,
        vendorShare: deposit - commission,
      });
    } catch (error) {
      console.error("Booking error:", error);
      res.status(500).send("Error processing booking");
    }
  }

  /**
   * Proceed to payment page - نفس المنطق من routes/booking/create.js
   */
  static proceedToPayment(req, res) {
    try {
      const {
        bookingId,
        packageId,
        packageName,
        eventDate,
        price,
        deposit,
        eventType,
      } = req.body;

      // تسجيل معلومات الباقة للتأكد من أنها تمرر بشكل صحيح
      console.log("Proceeding to payment with package details:");
      console.log("Package ID:", packageId);
      console.log("Package Name:", packageName);
      res.render("payment", {
        stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
        user: req.session.user,
        isAuthenticated: !!req.session.user,
        bookingId: bookingId,
        packageId: packageId, // تمرير معرف الباقة
        packageName: packageName,
        price: parseInt(price),
        deposit: parseInt(deposit),
        eventDate: eventDate,
        eventType,
      });
    } catch (error) {
      console.error("Error proceeding to payment:", error);
      res.status(500).send("Error loading payment page");
    }
  }

  /**
   * Payment success page - نفس المنطق من routes/booking/create.js
   */
  static showPaymentSuccess(req, res) {
    res.render("payment-success", {
      user: req.session.user,
      isAuthenticated: !!req.session.user,
    });
  }
}

module.exports = CreateBookingController;
