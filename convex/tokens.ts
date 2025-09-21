// Token management functions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's token balance
export const getTokenBalance = query({
  args: {},
  handler: async (ctx) => {
    // TEMPORARILY DISABLED - Return unlimited tokens for testing
    return {
      monthlyTokens: 999999,
      additionalTokens: 0,
      usedTokens: 0,
      remainingTokens: 999999,
      resetDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
    };
  },
});

// Check if user can use a token
export const canUseToken = query({
  args: {},
  handler: async (ctx) => {
    // TEMPORARILY DISABLED - Always return true for testing
    return true;
  },
});

// Consume a token for an analysis
export const consumeToken = mutation({
  args: {
    analysisType: v.string(),
    analysisId: v.optional(v.id("analyses")),
  },
  handler: async (ctx, args) => {
    // TEMPORARILY DISABLED - Just return success without consuming tokens
    return {
      success: true,
      remainingTokens: 999999, // Unlimited for testing
    };
  },
});

// Get user's subscription status
export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) return null;

    // Get subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!subscription) {
      return {
        status: "active",
        planType: "free",
        isActive: true,
      };
    }

    return {
      status: subscription.status,
      planType: subscription.planType,
      tokensPerMonth: subscription.tokensPerMonth,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isActive: subscription.status === "active" || subscription.status === "trialing",
    };
  },
});