// Token management functions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's token balance
export const getTokenBalance = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const tokenBalance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!tokenBalance) {
      // Return default for users without token balance record
      return {
        monthlyTokens: 5,
        additionalTokens: 0,
        usedTokens: 0,
        remainingTokens: 5,
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
    }

    const remainingTokens = Math.max(0,
      tokenBalance.monthlyTokens + tokenBalance.additionalTokens - tokenBalance.usedTokens
    );

    return {
      monthlyTokens: tokenBalance.monthlyTokens,
      additionalTokens: tokenBalance.additionalTokens,
      usedTokens: tokenBalance.usedTokens,
      remainingTokens,
      resetDate: tokenBalance.resetDate,
    };
  },
});

// Check if user can use a token
export const canUseToken = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return false;

    const tokenBalance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!tokenBalance) return true; // Default 5 tokens for new users

    const remainingTokens = tokenBalance.monthlyTokens + tokenBalance.additionalTokens - tokenBalance.usedTokens;
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const tokenBalance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!tokenBalance) throw new Error("Token balance not found");

    const remainingTokens = tokenBalance.monthlyTokens + tokenBalance.additionalTokens - tokenBalance.usedTokens;

    if (remainingTokens < 1) {
      throw new Error("Insufficient tokens");
    }

    // Update token usage
    await ctx.db.patch(tokenBalance._id, {
      usedTokens: tokenBalance.usedTokens + 1,
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