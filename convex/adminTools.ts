// Admin tools for managing user tokens
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Update token balance for a specific user (admin only)
export const updateUserTokens = mutation({
  args: {
    email: v.string(),
    monthlyTokens: v.number(),
    additionalTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    // Get existing token balance
    const tokenBalance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!tokenBalance) {
      // Create new token balance if it doesn't exist
      await ctx.db.insert("tokenBalance", {
        userId: user._id,
        monthlyTokens: args.monthlyTokens,
        additionalTokens: args.additionalTokens || 0,
        usedTokens: 0,
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });
    } else {
      // Update existing token balance
      await ctx.db.patch(tokenBalance._id, {
        monthlyTokens: args.monthlyTokens,
        additionalTokens: args.additionalTokens !== undefined ? args.additionalTokens : tokenBalance.additionalTokens,
        updatedAt: Date.now(),
      });
    }

    // Also update subscription if needed
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        tokensPerMonth: args.monthlyTokens,
        planType: args.monthlyTokens >= 1000 ? "enterprise" : subscription.planType,
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: `Updated tokens for ${args.email}: ${args.monthlyTokens} monthly tokens`,
    };
  },
});

// Reset used tokens for a specific user
export const resetUsedTokens = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    // Get token balance
    const tokenBalance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!tokenBalance) {
      throw new Error(`No token balance found for ${args.email}`);
    }

    // Reset used tokens
    await ctx.db.patch(tokenBalance._id, {
      usedTokens: 0,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `Reset used tokens for ${args.email}`,
    };
  },
});