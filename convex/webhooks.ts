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

// Helper functions
async function handleSubscriptionCreated(ctx: any, subscription: any) {
  console.log("Subscription created:", subscription.id);
  
  try {
    // Get user by customer ID from subscription
    const customerId = subscription.customer;
    
    // First, get the customer from Stripe to get the email
    if (!stripe) {
      console.error("Stripe not initialized");
      return;
    }
    
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      console.error("Customer not found:", customerId);
      return;
    }

    // Find user by email
    const users = await ctx.db.query("users").collect();
    const user = users.find(u => u.email === customer.email);
    
    if (!user) {
      console.error("User not found with email:", customer.email);
      return;
    }

    // Determine plan type based on price
    let planType = 'starter';
    let tokensPerMonth = 50;
    
    const priceId = subscription.items.data[0]?.price.id;
    if (priceId === process.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID) {
      planType = 'professional';
      tokensPerMonth = 150;
    }

    // Update or create subscription record
    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (existingSub) {
      await ctx.db.patch(existingSub._id, {
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        tokensPerMonth,
        currentPeriodEnd: subscription.current_period_end * 1000,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: user._id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        tokensPerMonth,
        currentPeriodEnd: subscription.current_period_end * 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Update token balance
    const existingBalance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (existingBalance) {
      await ctx.db.patch(existingBalance._id, {
        monthlyTokens: tokensPerMonth,
        additionalTokens: 0,
        usedTokens: 0,
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("tokenBalance", {
        userId: user._id,
        monthlyTokens: tokensPerMonth,
        additionalTokens: 0,
        usedTokens: 0,
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });
    }
    
    console.log(`Successfully created subscription for user ${user._id} with ${tokensPerMonth} tokens`);
  } catch (error) {
    console.error("Error handling subscription created:", error);
  }
}

async function handleSubscriptionUpdated(ctx: any, subscription: any) {
  console.log("Subscription updated:", subscription.id);
  // Similar to created, update the subscription record
  await handleSubscriptionCreated(ctx, subscription);
}

async function handleSubscriptionDeleted(ctx: any, subscription: any) {
  console.log("Subscription deleted:", subscription.id);
  
  try {
    const customerId = subscription.customer;
    
    // Find subscription by Stripe subscription ID
    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) => q.eq("stripeSubscriptionId", subscription.id))
      .first();
    
    if (!existingSub) {
      console.error("Subscription not found:", subscription.id);
      return;
    }

    // Update subscription status to canceled
    await ctx.db.patch(existingSub._id, {
      status: 'canceled',
      updatedAt: Date.now(),
    });

    // Set tokens to 0
    const existingBalance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", existingSub.userId))
      .first();
      
    if (existingBalance) {
      await ctx.db.patch(existingBalance._id, {
        monthlyTokens: 0,
        updatedAt: Date.now(),
      });
    }
    
    console.log(`Successfully canceled subscription for user ${existingSub.userId}`);
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
}

async function handlePaymentSucceeded(ctx: any, invoice: any) {
  console.log("Payment succeeded:", invoice.id);
  
  // Reset monthly tokens on successful payment
  const subscriptionId = invoice.subscription;
  if (subscriptionId) {
    // This will be called on recurring payments
    // The subscription webhook handles the initial payment
  }
}

async function handlePaymentFailed(ctx: any, invoice: any) {
  console.log("Payment failed:", invoice.id);
  
  try {
    const customerId = invoice.customer;
    // You might want to suspend the account or send notifications
    console.error("Payment failed for customer:", customerId);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
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