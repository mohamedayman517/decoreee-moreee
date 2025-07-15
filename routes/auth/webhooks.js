const express = require("express");
const User = require("../../models/userSchema");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Webhook handler for asynchronous events
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log("PaymentIntent succeeded:", paymentIntent.id);
          // Update engineer's payment status if needed
          break;

        case "payment_intent.payment_failed":
          const failedPayment = event.data.object;
          console.log("Payment failed:", failedPayment.id);
          // Handle failed payment
          break;

        case "customer.subscription.deleted":
          const subscription = event.data.object;
          await User.findOneAndUpdate(
            { stripeSubscriptionId: subscription.id },
            {
              hasPaidSubscription: false,
              subscriptionEndDate: new Date(),
            }
          );
          break;

        case "invoice.payment_succeeded":
          const invoice = event.data.object;
          if (invoice.billing_reason === "subscription_create") {
            const subscription = await stripe.subscriptions.retrieve(
              invoice.subscription
            );
            await User.findOneAndUpdate(
              { stripeCustomerId: invoice.customer },
              {
                hasPaidSubscription: true,
                subscriptionStartDate: new Date(),
                subscriptionEndDate: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ),
              }
            );
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Error processing webhook:", err);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

module.exports = router;
