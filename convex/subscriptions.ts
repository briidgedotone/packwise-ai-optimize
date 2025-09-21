import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// Token costs per analysis type
const TOKEN_COSTS = {
  suite_analyzer: 10,
  demand_planner: 8,
  demand_planner_v2: 8,
  pdp_analyzer: 5,
  spec_generator: 15, // AI-powered, costs more tokens
};

// Plan limits
export const PLAN_LIMITS = {
  free: { tokensPerMonth: 10, name: "Free", price: 0 },
  starter: { tokensPerMonth: 50, name: "Starter", price: 900 }, // $9/month
  professional: { tokensPerMonth: 150, name: "Professional", price: 2900 }, // $29/month
  enterprise: { tokensPerMonth: 999999, name: "Enterprise", price: 0 }, // Custom pricing
};

// Initialize subscription plans in database (temporarily disabled for onboarding bypass)
export const initializePlans = mutation({
  args: {},
  handler: async (_ctx) => {
    // Temporarily disabled to bypass onboarding until Stripe is configured
    return { message: "Plan initialization disabled for now" };
    
    // Check if plans already exist
    // const existingPlans = await ctx.db.query("subscriptionPlans").collect();
    // if (existingPlans.length > 0) {
    //   return { message: "Plans already initialized" };
    // }

    /*
    // Create plans
    await ctx.db.insert("subscriptionPlans", {
      name: "Free",
      planId: "free",
      tokensPerMonth: 10,
      price: 0,
      features: [
        "10 tokens per month",
        "Basic suite analysis",
        "Community support"
      ],
      description: "Perfect for trying out QuantiPackAI",
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("subscriptionPlans", {
      name: "Starter",
      planId: "starter",
      stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || undefined,
      tokensPerMonth: 50,
      price: 900,
      features: [
        "50 tokens per month",
        "All analysis tools",
        "Email support",
        "Export reports"
      ],
      description: "Individuals or small teams getting started with packaging analysis",
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("subscriptionPlans", {
      name: "Professional",
      planId: "professional",
      stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || undefined,
      tokensPerMonth: 150,
      price: 2900,
      features: [
        "150 tokens per month",
        "All analysis tools",
        "Priority support",
        "Advanced analytics",
        "API access"
      ],
      description: "Frequent users who need deeper insights and higher usage limits",
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("subscriptionPlans", {
      name: "Enterprise",
      planId: "enterprise",
      tokensPerMonth: 999999,
      price: 0, // Custom pricing
      features: [
        "Unlimited tokens",
        "All features",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee"
      ],
      description: "Large teams with advanced needs and custom support",
      isActive: true,
      createdAt: Date.now(),
    });

    return { message: "Plans initialized successfully" };
    */
  },
});

// Get available subscription plans
export const getSubscriptionPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscriptionPlans")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get user's current subscription and usage
export const getUserSubscription = query({
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
      return null;
    }

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthUsage = await ctx.db
      .query("usageHistory")
      .withIndex("by_month", (q) => 
        q.eq("userId", user._id).eq("month", currentMonth)
      )
      .collect();

    const tokensUsed = monthUsage.reduce((sum, usage) => sum + usage.tokensUsed, 0);
    const plan = user.subscriptionPlan || "free";
    const planLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

    return {
      plan,
      status: user.subscriptionStatus || "active",
      tokensUsed,
      tokensLimit: planLimits.tokensPerMonth,
      tokensRemaining: Math.max(0, planLimits.tokensPerMonth - tokensUsed),
      subscriptionEndDate: user.subscriptionEndDate,
      billingCycle: currentMonth,
    };
  },
});

// Check if user has enough tokens for an analysis
export const checkUsageLimit = mutation({
  args: {
    analysisType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const tokenCost = TOKEN_COSTS[args.analysisType as keyof typeof TOKEN_COSTS] || 10;
    const plan = user.subscriptionPlan || "free";
    const planLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthUsage = await ctx.db
      .query("usageHistory")
      .withIndex("by_month", (q) => 
        q.eq("userId", user._id).eq("month", currentMonth)
      )
      .collect();

    const tokensUsed = monthUsage.reduce((sum, usage) => sum + usage.tokensUsed, 0);
    const tokensRemaining = planLimits.tokensPerMonth - tokensUsed;

    if (tokensRemaining < tokenCost) {
      return {
        allowed: false,
        reason: `Not enough tokens. Required: ${tokenCost}, Remaining: ${tokensRemaining}`,
        tokensRequired: tokenCost,
        tokensRemaining,
        suggestUpgrade: plan !== "enterprise",
      };
    }

    return {
      allowed: true,
      tokensRequired: tokenCost,
      tokensRemaining: tokensRemaining - tokenCost,
    };
  },
});

// Track token usage for an analysis
export const trackUsage = mutation({
  args: {
    analysisId: v.id("analyses"),
    analysisType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const tokenCost = TOKEN_COSTS[args.analysisType as keyof typeof TOKEN_COSTS] || 10;
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Record usage
    await ctx.db.insert("usageHistory", {
      userId: user._id,
      analysisId: args.analysisId,
      analysisType: args.analysisType,
      tokensUsed: tokenCost,
      feature: args.analysisType,
      month: currentMonth,
      createdAt: Date.now(),
    });

    // Update user's current month usage
    const updatedTokensUsed = (user.tokensUsedThisMonth || 0) + tokenCost;
    await ctx.db.patch(user._id, {
      tokensUsedThisMonth: updatedTokensUsed,
      lastUsageReset: user.lastUsageReset || Date.now(),
    });

    return { tokensUsed: tokenCost };
  },
});

// Update user subscription (called from Stripe webhook)
export const updateUserSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("professional"),
      v.literal("enterprise")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("incomplete"),
      v.literal("trialing")
    ),
    subscriptionId: v.optional(v.string()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();

    if (!user) {
      throw new Error("User not found with Stripe customer ID");
    }

    await ctx.db.patch(user._id, {
      subscriptionPlan: args.plan,
      subscriptionStatus: args.status,
      stripeSubscriptionId: args.subscriptionId,
      subscriptionEndDate: args.endDate,
    });

    return { success: true };
  },
});

// Create or update Stripe customer ID
export const setStripeCustomerId = mutation({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      stripeCustomerId: args.stripeCustomerId,
    });

    return { success: true };
  },
});

// Reset monthly usage (called by cron job)
export const resetMonthlyUsage = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const now = Date.now();

    for (const user of users) {
      // Only reset if it's been at least 30 days since last reset
      if (!user.lastUsageReset || now - user.lastUsageReset > 30 * 24 * 60 * 60 * 1000) {
        await ctx.db.patch(user._id, {
          tokensUsedThisMonth: 0,
          lastUsageReset: now,
        });
      }
    }

    return { resetCount: users.length };
  },
});