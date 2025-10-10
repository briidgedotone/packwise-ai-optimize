// Stripe webhook processing
import { v } from "convex/values";
import { action, internalAction, query, mutation } from "./_generated/server";
import { internal, api } from "./_generated/api";

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

// Helper functions - defined before main webhook handler
async function handleCheckoutCompleted(ctx: any, session: any) {
  console.log("Checkout session completed:", session.id);

  try {
    // Get customer and subscription info from the session
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const userId = session.metadata?.userId || session.client_reference_id;

    console.log(`Processing checkout for customer: ${customerId}, subscription: ${subscriptionId}, user: ${userId}`);

    if (!userId) {
      console.error("No userId found in checkout session metadata or client_reference_id");
      return;
    }

    // Update webhook status to processing
    await ctx.runMutation("webhooks:updateWebhookStatus", {
      userId,
      eventType: "checkout.session.completed",
      status: "processing",
      message: "Processing checkout completion",
      subscriptionId: subscriptionId || session.id,
    });

    // Get user from database
    const user = await ctx.runQuery("users:getUserByClerkId", { clerkId: userId });
    if (!user) {
      console.error("User not found:", userId);
      await ctx.runMutation("webhooks:updateWebhookStatus", {
        userId,
        eventType: "checkout.session.completed",
        status: "failed",
        message: "User not found in database",
        subscriptionId: subscriptionId || session.id,
      });
      return;
    }

    // If there's a subscription ID, fetch the subscription details from Stripe
    if (subscriptionId && stripe) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log("Retrieved subscription from Stripe:", subscription.id);

        // Process the subscription using existing handler
        await handleSubscriptionCreated(ctx, subscription);
      } catch (stripeError: any) {
        console.error("Error fetching subscription from Stripe:", stripeError);

        // Fall back to creating subscription record from session data
        await createSubscriptionFromSession(ctx, session, user);
      }
    } else {
      // Handle one-time payment or session without subscription
      await createSubscriptionFromSession(ctx, session, user);
    }

    // Update webhook status to completed
    await ctx.runMutation("webhooks:updateWebhookStatus", {
      userId,
      eventType: "checkout.session.completed",
      status: "completed",
      message: "Checkout successfully processed",
      subscriptionId: subscriptionId || session.id,
    });

  } catch (error: any) {
    console.error("Error handling checkout completed:", error);

    // Update webhook status to failed
    const userId = session.metadata?.userId || session.client_reference_id;
    if (userId) {
      await ctx.runMutation("webhooks:updateWebhookStatus", {
        userId,
        eventType: "checkout.session.completed",
        status: "failed",
        message: `Failed to process checkout: ${(error as Error).message || 'Unknown error'}`,
        subscriptionId: session.subscription || session.id,
      });
    }
  }
}

async function createSubscriptionFromSession(ctx: any, session: any, user: any) {
  console.log("Creating subscription from session data");

  // Determine plan type from session line items or amount
  const amountTotal = session.amount_total; // in cents
  let planType = 'starter';
  let tokensPerMonth = 50;

  // Map amount to plan type (this should match your Stripe prices)
  if (amountTotal === 3999) { // $39.99 in cents
    planType = 'starter';
    tokensPerMonth = 50;
  } else if (amountTotal === 9999) { // $99.99 in cents
    planType = 'professional';
    tokensPerMonth = 150;
  }

  console.log(`Determined plan: ${planType} with ${tokensPerMonth} tokens based on amount: $${amountTotal / 100}`);

  // Create or update subscription record
  const existingSub = await ctx.runQuery("subscriptionCRUD:getSubscriptionByUser", { userId: user._id });

  if (existingSub) {
    // Update existing subscription
    await ctx.runMutation("subscriptionCRUD:updateSubscription", {
      subscriptionId: existingSub._id,
      status: "active",
      planType,
      tokensPerMonth,
      currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    });
    console.log(`Updated existing subscription for user ${user.clerkId}`);
  } else {
    // Create new subscription
    await ctx.runMutation("subscriptionCRUD:createSubscription", {
      userId: user._id,
      stripeCustomerId: session.customer || "",
      stripeSubscriptionId: session.subscription || "",
      status: "active",
      planType,
      tokensPerMonth,
      currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    console.log(`Created new subscription for user ${user.clerkId}`);
  }

  // Create or update token balance
  const tokenBalance = await ctx.runQuery("tokenBalance:getByUserId", { userId: user._id });
  if (tokenBalance) {
    await ctx.runMutation("tokenBalance:updateBalance", {
      balanceId: tokenBalance._id,
      monthlyTokens: tokensPerMonth,
      usedTokens: 0, // Reset usage for new subscription
      resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    console.log(`Updated token balance: ${tokensPerMonth} tokens for user ${user.clerkId}`);
  } else {
    // Create token balance
    await ctx.runMutation("tokenBalance:createFreeTrialBalance", {
      userId: user._id,
    });
    // Then update it with the correct subscription values
    const newBalance = await ctx.runQuery("tokenBalance:getByUserId", { userId: user._id });
    if (newBalance) {
      await ctx.runMutation("tokenBalance:updateBalance", {
        balanceId: newBalance._id,
        monthlyTokens: tokensPerMonth,
        usedTokens: 0,
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    }
    console.log(`Created token balance: ${tokensPerMonth} tokens for user ${user.clerkId}`);
  }
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
        console.log("Webhook verification details:", {
          bodyLength: args.body.length,
          signaturePresent: !!args.signature,
          signatureStart: args.signature ? args.signature.substring(0, 20) + "..." : "none",
          webhookSecretConfigured: !!webhookSecret
        });

        event = await stripe.webhooks.constructEventAsync(
          args.body,
          args.signature,
          webhookSecret
        );
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        console.error("Full error details:", err);
        return { success: false, error: `Webhook signature verification failed: ${err.message}` };
      }

      console.log(`Processing webhook event: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(ctx, event.data.object);
          break;

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
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },
});


async function handleSubscriptionDeleted(ctx: any, subscription: any) {
  console.log("Subscription deleted:", subscription.id);

  try {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const user = await ctx.runQuery("users:getUserByClerkId", { clerkId: userId });
    if (!user) return;

    const existingSub = await ctx.runQuery("subscriptionCRUD:getSubscriptionByUser", { userId: user._id });

    // This webhook fires when subscription actually ends (at period end if cancel_at_period_end was true)
    // Remove all tokens since subscription is now fully canceled
    if (existingSub) {
      await ctx.runMutation("subscriptionCRUD:updateSubscription", {
        subscriptionId: existingSub._id,
        status: 'canceled',
      });

      // Set tokens to 0 (no free tier)
      const tokenBalance = await ctx.runQuery("tokenBalance:getByUserId", { userId: user._id });
      if (tokenBalance) {
        await ctx.runMutation("tokenBalance:updateBalance", {
          balanceId: tokenBalance._id,
          monthlyTokens: 0,
          usedTokens: 0,
          resetDate: Date.now(),
        });
      }
    }

    console.log(`Subscription fully canceled for user ${userId}, tokens set to 0`);
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
}

async function handleSubscriptionCreated(ctx: any, subscription: any) {
  console.log("Subscription created:", subscription.id);

  try {
    // Get user by Clerk ID from metadata
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error("No userId in subscription metadata");
      return;
    }

    // Update webhook status to processing
    await ctx.runMutation("webhooks:updateWebhookStatus", {
      userId,
      eventType: "customer.subscription.created",
      status: "processing",
      message: "Processing subscription creation",
      subscriptionId: subscription.id,
    });

    // Get user from database
    const user = await ctx.runQuery("users:getUserByClerkId", { clerkId: userId });
    if (!user) {
      console.error("User not found:", userId);
      return;
    }

    // Determine plan type based on price
    const priceId = subscription.items.data[0]?.price.id;
    let planType = 'starter';
    let tokensPerMonth = 50;

    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
      planType = 'starter';
      tokensPerMonth = 50;
    } else if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
      planType = 'professional';
      tokensPerMonth = 150;
    }

    console.log(`Processing subscription for price ${priceId}, plan: ${planType}, tokens: ${tokensPerMonth}`);
    console.log(`Available price IDs - Starter: ${process.env.STRIPE_STARTER_PRICE_ID}, Professional: ${process.env.STRIPE_PROFESSIONAL_PRICE_ID}`);

    // Update or create subscription record
    const existingSub = await ctx.runQuery("subscriptionCRUD:getSubscriptionByUser", { userId: user._id });

    if (existingSub) {
      // Update existing subscription
      await ctx.runMutation("subscriptionCRUD:updateSubscription", {
        subscriptionId: existingSub._id,
        status: subscription.status,
        planType,
        tokensPerMonth,
        currentPeriodEnd: subscription.current_period_end * 1000,
      });
      console.log(`Updated existing subscription for user ${userId}`);
    } else {
      // Create new subscription
      await ctx.runMutation("subscriptionCRUD:createSubscription", {
        userId: user._id,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        tokensPerMonth,
        currentPeriodEnd: subscription.current_period_end * 1000,
      });
      console.log(`Created new subscription for user ${userId}`);
    }

    // Reset or create token balance for subscription
    const tokenBalance = await ctx.runQuery("tokenBalance:getByUserId", { userId: user._id });
    if (tokenBalance) {
      await ctx.runMutation("tokenBalance:updateBalance", {
        balanceId: tokenBalance._id,
        monthlyTokens: tokensPerMonth,
        usedTokens: 0, // Reset usage for new subscription
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      console.log(`Updated token balance: ${tokensPerMonth} tokens for user ${userId}`);
    } else {
      // Create token balance if it doesn't exist
      await ctx.runMutation("tokenBalance:createFreeTrialBalance", {
        userId: user._id,
      });
      // Then update it with the correct subscription values
      const newBalance = await ctx.runQuery("tokenBalance:getByUserId", { userId: user._id });
      if (newBalance) {
        await ctx.runMutation("tokenBalance:updateBalance", {
          balanceId: newBalance._id,
          monthlyTokens: tokensPerMonth,
          usedTokens: 0,
          resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      }
      console.log(`Created token balance: ${tokensPerMonth} tokens for user ${userId}`);
    }

    // Update webhook status to completed
    await ctx.runMutation("webhooks:updateWebhookStatus", {
      userId,
      eventType: "customer.subscription.created",
      status: "completed",
      message: `Subscription successfully created with ${tokensPerMonth} tokens`,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Error handling subscription created:", error);

    // Update webhook status to failed
    const userId = subscription.metadata?.userId;
    if (userId) {
      await ctx.runMutation("webhooks:updateWebhookStatus", {
        userId,
        eventType: "customer.subscription.created",
        status: "failed",
        message: `Failed to process subscription: ${(error as Error).message || 'Unknown error'}`,
        subscriptionId: subscription.id,
      });
    }
  }
}

async function handleSubscriptionUpdated(ctx: any, subscription: any) {
  console.log("Subscription updated:", subscription.id);

  // Check if subscription is marked for cancellation at period end
  if (subscription.cancel_at_period_end) {
    const periodEndDate = new Date(subscription.current_period_end * 1000);
    console.log(`Subscription ${subscription.id} will cancel at period end: ${periodEndDate.toISOString()}`);
    console.log(`User keeps tokens until: ${periodEndDate.toISOString()}`);
    // Keep current subscription active with current tokens until period ends
    // The handleSubscriptionDeleted webhook will fire when it actually expires
  }

  // Update subscription details (this preserves current token allocation during grace period)
  await handleSubscriptionCreated(ctx, subscription);
}

async function handlePaymentSucceeded(ctx: any, invoice: any) {
  console.log("Payment succeeded:", invoice.id);

  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    // Find user by Stripe customer ID
    const user = await ctx.runQuery(api.users.getUserByStripeCustomerId, {
      stripeCustomerId: customerId
    });

    if (!user) {
      console.error("User not found for Stripe customer:", customerId);
      return;
    }

    // Get plan name from subscription or line items
    let planName = 'Unknown Plan';
    if (invoice.lines?.data?.[0]?.price?.product?.name) {
      planName = invoice.lines.data[0].price.product.name;
    } else if (subscriptionId) {
      // Fetch subscription to get product info
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price.product']
      });
      planName = subscription.items?.data?.[0]?.price?.product?.name || planName;
    }

    // Store billing record
    await ctx.runMutation(api.billing.storeBillingRecord, {
      userId: user._id,
      stripeCustomerId: customerId,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId: subscriptionId || undefined,
      amount: invoice.amount_paid || invoice.total,
      currency: invoice.currency,
      status: "paid",
      planName,
      billingPeriodStart: (invoice.period_start || invoice.created) * 1000,
      billingPeriodEnd: (invoice.period_end || invoice.created) * 1000,
      invoiceUrl: invoice.hosted_invoice_url || undefined,
      pdfUrl: invoice.invoice_pdf || undefined,
      createdAt: invoice.created * 1000,
      paidAt: Date.now(),
    });

    console.log("Billing record stored for invoice:", invoice.id);

    // Reset monthly tokens on successful payment (if subscription)
    if (subscriptionId) {
      // This will be called on recurring payments
      // The subscription webhook handles the initial payment
    }

  } catch (error) {
    console.error("Error processing payment succeeded webhook:", error);
    throw error;
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

// Get webhook processing status for a user
export const getWebhookStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const webhookStatus = await ctx.db
      .query("webhookStatus")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    return webhookStatus;
  },
});

// Update webhook processing status
export const updateWebhookStatus = mutation({
  args: {
    userId: v.string(),
    eventType: v.string(),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
    message: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if there's an existing webhook status for this user
    const existing = await ctx.db
      .query("webhookStatus")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (existing) {
      // Update existing status
      return await ctx.db.patch(existing._id, {
        eventType: args.eventType,
        status: args.status,
        message: args.message,
        subscriptionId: args.subscriptionId,
        updatedAt: Date.now(),
      });
    } else {
      // Create new status record
      return await ctx.db.insert("webhookStatus", {
        userId: args.userId,
        eventType: args.eventType,
        status: args.status,
        message: args.message,
        subscriptionId: args.subscriptionId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Internal version for cross-function calls
export const _testWebhookProcessing = internalAction({
  args: {
    eventType: v.string(),
    subscriptionData: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      console.log(`Testing webhook event: ${args.eventType}`);

      // Handle different event types
      switch (args.eventType) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(ctx, args.subscriptionData);
          break;

        case 'customer.subscription.created':
          await handleSubscriptionCreated(ctx, args.subscriptionData);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(ctx, args.subscriptionData);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(ctx, args.subscriptionData);
          break;

        default:
          console.log(`Unhandled test event type: ${args.eventType}`);
      }

      return { success: true, message: `Successfully processed ${args.eventType}` };
    } catch (error: any) {
      console.error("Test webhook processing error:", error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },
});

// Test webhook processing without signature verification
export const testWebhookProcessing = action({
  args: {
    eventType: v.string(),
    subscriptionData: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      console.log(`Testing webhook event: ${args.eventType}`);

      // Handle different event types
      switch (args.eventType) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(ctx, args.subscriptionData);
          break;

        case 'customer.subscription.created':
          await handleSubscriptionCreated(ctx, args.subscriptionData);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(ctx, args.subscriptionData);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(ctx, args.subscriptionData);
          break;

        default:
          console.log(`Unhandled test event type: ${args.eventType}`);
      }

      return { success: true, message: `Successfully processed ${args.eventType}` };
    } catch (error: any) {
      console.error("Test webhook processing error:", error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },
});