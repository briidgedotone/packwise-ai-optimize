import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Initialize Stripe
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

// Get user's billing history
export const getUserBillingHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get billing history sorted by most recent first
    const billingHistory = await ctx.db
      .query("billingHistory")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50); // Limit to last 50 records

    return billingHistory.map(record => ({
      id: record._id,
      date: new Date(record.createdAt).toISOString().split('T')[0], // YYYY-MM-DD format
      plan: record.planName,
      amount: `$${(record.amount / 100).toFixed(2)}`, // Convert cents to dollars
      status: record.status === 'paid' ? 'Paid' : 'Pending',
      invoiceUrl: record.invoiceUrl || '#',
      pdfUrl: record.pdfUrl,
      billingPeriod: {
        start: record.billingPeriodStart,
        end: record.billingPeriodEnd
      }
    }));
  },
});

// Store billing record from webhook
export const storeBillingRecord = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeInvoiceId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("paid"),
      v.literal("open"),
      v.literal("void"),
      v.literal("uncollectible")
    ),
    planName: v.string(),
    billingPeriodStart: v.number(),
    billingPeriodEnd: v.number(),
    invoiceUrl: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if record already exists
    const existingRecord = await ctx.db
      .query("billingHistory")
      .filter((q) => q.eq(q.field("stripeInvoiceId"), args.stripeInvoiceId))
      .first();

    if (existingRecord) {
      // Update existing record
      await ctx.db.patch(existingRecord._id, {
        status: args.status,
        paidAt: args.paidAt,
        invoiceUrl: args.invoiceUrl,
        pdfUrl: args.pdfUrl,
      });
      return { updated: existingRecord._id };
    } else {
      // Create new record
      const recordId = await ctx.db.insert("billingHistory", args);
      return { created: recordId };
    }
  },
});

// Sync historical invoices from Stripe for a user
export const syncUserInvoicesFromStripe = action({
  args: {
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    if (!stripe) {
      throw new Error("Stripe is not configured");
    }

    try {
      // Get user from database
      const user = await ctx.runQuery(api.users.getUserByClerkId, {
        clerkId: args.userId
      });

      if (!user || !user.stripeCustomerId) {
        throw new Error("User not found or no Stripe customer ID");
      }

      // Fetch invoices from Stripe
      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 100,
        expand: ['data.subscription', 'data.lines.data.price.product']
      });

      let syncedCount = 0;

      for (const invoice of invoices.data) {
        // Get plan name from subscription or line items
        let planName = 'Unknown Plan';
        if (invoice.lines?.data?.[0]?.price?.product?.name) {
          planName = invoice.lines.data[0].price.product.name;
        } else if (invoice.subscription?.metadata?.plan) {
          planName = invoice.subscription.metadata.plan;
        }

        // Store billing record
        await ctx.runMutation(api.billing.storeBillingRecord, {
          userId: user._id,
          stripeCustomerId: user.stripeCustomerId,
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: invoice.subscription as string || undefined,
          amount: invoice.amount_paid || invoice.total,
          currency: invoice.currency,
          status: invoice.status as "paid" | "open" | "void" | "uncollectible",
          planName,
          billingPeriodStart: (invoice.period_start || invoice.created) * 1000,
          billingPeriodEnd: (invoice.period_end || invoice.created) * 1000,
          invoiceUrl: invoice.hosted_invoice_url || undefined,
          pdfUrl: invoice.invoice_pdf || undefined,
          createdAt: invoice.created * 1000,
          paidAt: invoice.status_transitions?.paid_at
            ? invoice.status_transitions.paid_at * 1000
            : undefined,
        });

        syncedCount++;
      }

      return {
        success: true,
        syncedCount,
        totalInvoices: invoices.data.length
      };

    } catch (error: any) {
      console.error("Error syncing invoices from Stripe:", error);
      throw new Error(`Failed to sync invoices: ${error.message}`);
    }
  },
});

// Get current subscription details from Stripe
export const getCurrentSubscriptionDetails = action({
  args: {},
  handler: async (ctx) => {
    if (!stripe) {
      throw new Error("Stripe is not configured");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    try {
      // Get user from database
      const user = await ctx.runQuery(api.users.getUserByClerkId, {
        clerkId: identity.subject
      });

      if (!user) {
        return {
          hasSubscription: false,
          plan: 'free',
          status: 'inactive'
        };
      }

      // First check if user has active subscription in our subscriptions table
      const localSubscription = await ctx.runQuery(api.subscriptionCRUD.getSubscriptionByUser, {
        userId: user._id
      });

      if (localSubscription && (localSubscription.status === 'active' || localSubscription.status === 'trialing')) {
        return {
          hasSubscription: true,
          plan: localSubscription.planType.charAt(0).toUpperCase() + localSubscription.planType.slice(1),
          status: localSubscription.status,
          currentPeriodStart: localSubscription.currentPeriodEnd ? localSubscription.currentPeriodEnd - (30 * 24 * 60 * 60 * 1000) : undefined,
          currentPeriodEnd: localSubscription.currentPeriodEnd,
          nextBillingDate: localSubscription.currentPeriodEnd,
          tokensPerMonth: localSubscription.tokensPerMonth,
          stripeCustomerId: localSubscription.stripeCustomerId,
        };
      }

      // If no local subscription or stripeSubscriptionId, try to get it from Stripe by customer ID
      if (!user.stripeSubscriptionId && user.stripeCustomerId) {
        // Try to get active subscriptions for this customer from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          const product = subscription.items?.data?.[0]?.price?.product;
          const planName = product?.name || 'Unknown';

          return {
            hasSubscription: true,
            plan: planName,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start * 1000,
            currentPeriodEnd: subscription.current_period_end * 1000,
            nextBillingDate: subscription.current_period_end * 1000,
            amount: subscription.items?.data?.[0]?.price?.unit_amount || 0,
            currency: subscription.currency,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripeCustomerId: user.stripeCustomerId,
          };
        }
      }

      // If user has stripeSubscriptionId, get subscription from Stripe
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId,
          {
            expand: ['items.data.price.product']
          }
        );

        const product = subscription.items?.data?.[0]?.price?.product;
        const planName = product?.name || user.subscriptionPlan || 'Unknown';

        return {
          hasSubscription: true,
          plan: planName,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start * 1000,
          currentPeriodEnd: subscription.current_period_end * 1000,
          nextBillingDate: subscription.current_period_end * 1000,
          amount: subscription.items?.data?.[0]?.price?.unit_amount || 0,
          currency: subscription.currency,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          stripeCustomerId: user.stripeCustomerId,
        };
      }

      // Fallback to user's subscriptionPlan field or free
      return {
        hasSubscription: false,
        plan: user.subscriptionPlan || 'free',
        status: 'inactive'
      };

    } catch (error: any) {
      console.error("Error fetching subscription details:", error);

      // Try to get local subscription as fallback
      try {
        const user = await ctx.runQuery(api.users.getUserByClerkId, {
          clerkId: identity.subject
        });

        if (user) {
          const localSubscription = await ctx.runQuery(api.subscriptionCRUD.getSubscriptionByUser, {
            userId: user._id
          });

          if (localSubscription) {
            return {
              hasSubscription: true,
              plan: localSubscription.planType.charAt(0).toUpperCase() + localSubscription.planType.slice(1),
              status: localSubscription.status,
              stripeCustomerId: localSubscription.stripeCustomerId,
              error: `Stripe error: ${error.message}. Showing local data.`
            };
          }
        }
      } catch (fallbackError) {
        console.error("Fallback query failed:", fallbackError);
      }

      return {
        hasSubscription: false,
        plan: 'free',
        status: 'inactive',
        error: error.message
      };
    }
  },
});

// Helper function to format date
export const formatBillingDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};