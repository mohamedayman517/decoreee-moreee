const express = require("express");
const User = require("../../models/userSchema");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Payment policy page route
router.get("/payment-policy", async (req, res) => {
  try {
    const engineerId = req.query.engineerId;

    if (!engineerId) {
      return res.redirect("/login");
    }

    const engineer = await User.findOne({
      _id: engineerId,
      role: "Engineer",
    });

    if (!engineer) {
      return res.redirect("/login");
    }

    res.render("paymentPolicy", {
      engineerId: engineerId,
    });
  } catch (error) {
    console.error("Error in payment policy route:", error);
    res.redirect("/login");
  }
});

// Payment Engineer Page Route
router.get("/payment-engineer", async (req, res) => {
  try {
    console.log("GET /payment-engineer - Query:", req.query);
    const engineerId = req.query.engineerId;

    if (!engineerId) {
      console.log("No engineerId provided");
      return res.redirect("/login");
    }

    const engineer = await User.findById(engineerId);
    console.log("Found engineer:", engineer);

    if (!engineer) {
      console.log("Engineer not found");
      return res.redirect("/login");
    }

    // Check role case-insensitively
    if (!["engineer", "Engineer"].includes(engineer.role)) {
      console.log("Invalid role:", engineer.role);
      return res.redirect("/login");
    }

    console.log(
      "Rendering payment page for:",
      engineer.firstName,
      engineer.lastName
    );
    res.render("paymentEngineer", {
      engineerId: engineerId,
      engineerName: `${engineer.firstName} ${engineer.lastName}`,
      title: "Payment - Decor And More",
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("Payment page error:", error);
    res.redirect("/login");
  }
});

// Create payment intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { engineerId } = req.body;

    const engineer = await User.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ error: "Engineer not found" });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 200000,
      currency: "egp",
      metadata: {
        engineerId: engineerId,
        engineerEmail: engineer.email,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// Process payment for engineer subscription
router.post("/payment-engineer", async (req, res) => {
  try {
    const { engineerId, paymentMethodId } = req.body;

    if (!engineerId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    const engineer = await User.findById(engineerId);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: "Engineer not found",
      });
    }

    try {
      // Create a customer
      const customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: engineer.email,
        name: `${engineer.firstName} ${engineer.lastName}`,
        metadata: {
          engineerId: engineer._id.toString(),
        },
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: "price_1RaPEKF11C4VZmHAUNPJ6Kzi",
          },
        ],
        payment_settings: {
          payment_method_types: ["card"],
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
      });

      // Update engineer's subscription status
      engineer.hasPaidSubscription = true;
      engineer.subscriptionStartDate = new Date();
      engineer.subscriptionEndDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );
      engineer.stripeCustomerId = customer.id;
      engineer.stripeSubscriptionId = subscription.id;
      await engineer.save();

      // Send success response
      res.json({
        success: true,
        message: "Subscription activated successfully",
        subscription: {
          id: subscription.id,
          status: subscription.status,
          startDate: engineer.subscriptionStartDate,
          endDate: engineer.subscriptionEndDate,
        },
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      return res.status(400).json({
        success: false,
        message: stripeError.message,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing payment",
    });
  }
});

// Cancel registration
router.post("/cancel-registration", async (req, res) => {
  try {
    const { engineerId } = req.body;

    if (!engineerId) {
      return res.status(400).json({
        success: false,
        message: "Engineer ID is required",
      });
    }

    // Find and delete the engineer
    const result = await User.findByIdAndDelete(engineerId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Engineer not found",
      });
    }

    res.json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling registration",
    });
  }
});

module.exports = router;
