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
    // Get user by Clerk ID from metadata
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error("No userId in subscription metadata");
      return;
    }

    // Get user from database
    const user = await ctx.runQuery("users:getUserByClerkId", { clerkId: userId });
    if (!user) {
      console.error("User not found:", userId);
      return;
    }

    // Determine plan type based on price
    let planType = 'starter';
    let tokensPerMonth = 50;
    
    // You might want to check the price ID to determine the plan
    const priceId = subscription.items.data[0]?.price.id;
    if (priceId === process.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID) {
      planType = 'professional';
      tokensPerMonth = 150;
    }

    // Update or create subscription record
    const existingSub = await ctx.runQuery("subscriptionCRUD:getSubscriptionByUser", { userId: user._id });

    if (existingSub) {
      await ctx.runMutation("subscriptionCRUD:updateSubscription", {
        subscriptionId: existingSub._id,
        status: subscription.status,
        planType,
        tokensPerMonth,
        currentPeriodEnd: subscription.current_period_end * 1000,
      });
    } else {
      await ctx.runMutation("subscriptionCRUD:createSubscription", {
        userId: user._id,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        tokensPerMonth,
        currentPeriodEnd: subscription.current_period_end * 1000,
      });
    }

    // Reset token balance for new subscription
    const tokenBalance = await ctx.runQuery("tokenBalance:getByUserId", { userId: user._id });
    if (tokenBalance) {
      await ctx.runMutation("tokenBalance:updateBalance", {
        balanceId: tokenBalance._id,
        monthlyTokens: tokensPerMonth,
        usedTokens: 0, // Reset usage for new subscription
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    }
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
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const user = await ctx.runQuery("users:getUserByClerkId", { clerkId: userId });
    if (!user) return;

    // Update subscription status to canceled
    const existingSub = await ctx.runQuery("subscriptionCRUD:getSubscriptionByUser", { userId: user._id });
    if (existingSub) {
      await ctx.runMutation("subscriptionCRUD:updateSubscription", {
        subscriptionId: existingSub._id,
        status: 'canceled',
      });
    }

    // Set tokens to 0 (back to free plan)
    const tokenBalance = await ctx.runQuery("tokenBalance:getByUserId", { userId: user._id });
    if (tokenBalance) {
      await ctx.runMutation("tokenBalance:updateBalance", {
        balanceId: tokenBalance._id,
        monthlyTokens: 5, // Free plan tokens
        usedTokens: 0,
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    }
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