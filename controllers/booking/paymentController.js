const User = require("../../models/userSchema");
const Client = require("../../models/clientSchema");
const Package = require("../../models/packageSchema");
const { findClientById } = require("../../routes/booking/helpers");

class PaymentController {
  /**
   * Process payment for booking - نفس المنطق من routes/booking/payment.js
   */
  static async processPayment(req, res) {
    try {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const {
        payment_method_id,
        amount,
        package_name,
        package_id,
        event_date,
        user_id,
        event_type,
        booking_id,
      } = req.body;

      // تسجيل معلومات الدفع للتأكد من أنها تمرر بشكل صحيح
      console.log("Processing payment with package details:");
      console.log("Package ID:", package_id);
      console.log("Package Name:", package_name);

      const finalBookingId =
        booking_id ||
        `DC-${new Date().getFullYear()}-${Math.floor(
          Math.random() * 9000 + 1000
        )}`;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "egp",
        payment_method: payment_method_id,
        confirmation_method: "manual",
        confirm: true,
        return_url: `${process.env.BASE_URL || "http://localhost:3000"}/payment-success`,
        metadata: {
          booking_id: finalBookingId,
          package_id: package_id,
          package_name: package_name,
          event_date: event_date,
          user_id: user_id,
          event_type: event_type,
        },
      });

      if (paymentIntent.status === "succeeded") {
        console.log("Payment succeeded, processing booking...");

        // Find package and engineer
        const package = await Package.findById(package_id);
        if (!package) {
          throw new Error("Package not found");
        }

        const engineer = await User.findById(package.engID);
        if (!engineer) {
          throw new Error("Engineer not found");
        }

        // Find client
        const client = await findClientById(user_id);

        // Continue with booking process
        try {
          const clientBookingDetails = {
            bookingId: finalBookingId,
            engineerId: engineer._id,
            engineerName:
              engineer.firstName +
              (engineer.lastName ? " " + engineer.lastName : ""),
            profileImage: engineer.profilePhoto || "/uploads/default.png",
            clientName: client.name || "Client",
            clientId: user_id,
            phone: client.phone || "Not provided",
            projectType: event_type || package.eventType || "Event",
            packageName: package_name || package.name || "Package",
            packageId: package._id.toString(),
            price: amount / 100,
            deposit: amount / 100,
            date: new Date(event_date),
            paymentStatus: "Paid",
            status: "Confirmed",
            paymentId: paymentIntent.id,
            paymentMethod: "Stripe",
          };

          // Save to engineer's bookings
          try {
            const engineerBookingDetails = {
              bookingId: finalBookingId,
              clientName: client.name || "Client",
              clientId: user_id,
              phone: client.phone || "Not provided",
              projectType: event_type || package.eventType || "Event",
              packageName: package_name || package.name || "Package",
              price: amount / 100,
              deposit: amount / 100,
              commission: Math.round((amount / 100) * 0.1),
              priceAfterCommission: Math.round((amount / 100) * 0.9),
              totalPrice: amount / 100,
              remaining: Math.round((amount / 100) * 0.5),
              paymentStatus: "Paid",
              eventDate: event_date,
              bookingDate: new Date(),
              status: "Active",
              paymentId: paymentIntent.id,
              paymentMethod: "Stripe",
            };

            engineer.bookings.push(engineerBookingDetails);
            await engineer.save({ validateBeforeSave: true });
            console.log(
              `Successfully saved booking ${finalBookingId} to engineer ${engineer._id}`
            );
          } catch (saveError) {
            console.error("Error saving engineer booking:", saveError);
            throw new Error(
              `Failed to save engineer booking details: ${saveError.message}`
            );
          }

          // Save to client's bookings
          try {
            console.log(
              "Client booking details:",
              JSON.stringify(clientBookingDetails, null, 2)
            );

            client.bookings.push(clientBookingDetails);

            if (!clientBookingDetails.date)
              throw new Error("Missing date in client booking");

            await client.save({ validateBeforeSave: true });
            console.log(
              `Successfully saved booking ${finalBookingId} to client ${client._id}`
            );
          } catch (saveError) {
            console.error("Error saving client booking:", saveError);
            throw new Error(
              `Failed to save client booking details: ${saveError.message}`
            );
          }

          return res.json({
            status: "succeeded",
            message: "Payment successful",
          });
        } catch (processingError) {
          console.error("Error in booking process:", processingError);
          throw new Error(`Booking process failed: ${processingError.message}`);
        }
      } else if (paymentIntent.status === "requires_action") {
        return res.json({
          status: "requires_action",
          next_action: paymentIntent.next_action,
          client_secret: paymentIntent.client_secret,
        });
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(400).json({
        error: error.message || "Payment failed",
      });
    }
  }
}

module.exports = PaymentController;
