// Token management functions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's token balance
export const getTokenBalance = query({
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

    // Get token balance
    const balance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!balance) return null;

    return {
      monthlyTokens: balance.monthlyTokens,
      additionalTokens: balance.additionalTokens,
      usedTokens: balance.usedTokens,
      remainingTokens: balance.monthlyTokens + balance.additionalTokens - balance.usedTokens,
      resetDate: balance.resetDate,
    };
  },
});

// Check if user can use a token
export const canUseToken = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) return false;

    // Get token balance
    const balance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!balance) return false;

    const remainingTokens = balance.monthlyTokens + balance.additionalTokens - balance.usedTokens;
    return remainingTokens > 0;
  },
});

// Consume a token for an analysis
export const consumeToken = mutation({
  args: {
    analysisType: v.string(),
    analysisId: v.optional(v.id("analyses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    // Get token balance
    const balance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!balance) throw new Error("No token balance found");

    const remainingTokens = balance.monthlyTokens + balance.additionalTokens - balance.usedTokens;
    
    if (remainingTokens <= 0) {
      throw new Error("Insufficient tokens");
    }

    // Update token balance
    await ctx.db.patch(balance._id, {
      usedTokens: balance.usedTokens + 1,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      remainingTokens: remainingTokens - 1,
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
        status: "none",
        planType: "free",
        isActive: false,
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