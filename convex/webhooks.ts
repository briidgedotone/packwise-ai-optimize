// Stripe webhook processing
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";

// Import Stripe (we'll handle this carefully)
let stripe: any = null;
try {
  const Stripe = require('stripe');
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia'
    });
  }
} catch (error) {
  console.log("Stripe not available in this environment");
}

// Internal action to process webhook
export const processStripeWebhook = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Verify webhook signature
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error("No webhook secret configured");
        return { success: false, error: "Webhook secret not configured" };
      }

      if (!stripe) {
        console.error("Stripe not initialized");
        return { success: false, error: "Stripe not initialized" };
      }

      // Construct the event from webhook
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          args.body,
          args.signature,
          webhookSecret
        );
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return { success: false, error: `Webhook signature verification failed: ${err.message}` };
      }

      console.log(`Processing webhook event: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(ctx, event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(ctx, event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(ctx, event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(ctx, event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await handlePaymentFailed(ctx, event.data.object);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Webhook processing error:", error);
      return { success: false, error: error.message };
    }
  },
});

// Helper functions (placeholders for now)
async function handleSubscriptionCreated(ctx: any, subscription: any) {
  console.log("Subscription created:", subscription.id);
  // TODO: Create subscription record in database
}

async function handleSubscriptionUpdated(ctx: any, subscription: any) {
  console.log("Subscription updated:", subscription.id);
  // TODO: Update subscription record in database
}

async function handleSubscriptionDeleted(ctx: any, subscription: any) {
  console.log("Subscription deleted:", subscription.id);
  // TODO: Update subscription status in database
}

async function handlePaymentSucceeded(ctx: any, invoice: any) {
  console.log("Payment succeeded:", invoice.id);
  // TODO: Reset monthly tokens, update subscription
}

async function handlePaymentFailed(ctx: any, invoice: any) {
  console.log("Payment failed:", invoice.id);
  // TODO: Handle failed payment, maybe suspend account
}

// Public action for testing webhook connectivity
export const testWebhook = action({
  args: {},
  handler: async (ctx, args) => {
    return {
      message: "Webhook endpoint is working",
      stripeConfigured: !!stripe,
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      timestamp: Date.now()
    };
  },
});