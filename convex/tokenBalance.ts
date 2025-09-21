import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get token balance by user ID
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Create initial token balance for free trial
export const createFreeTrialBalance = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tokenBalance", {
      userId: args.userId,
      monthlyTokens: 5,
      additionalTokens: 0,
      usedTokens: 0,
      resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      updatedAt: Date.now(),
    });
  },
});

// Update token balance
export const updateBalance = mutation({
  args: {
    balanceId: v.id("tokenBalance"),
    monthlyTokens: v.optional(v.number()),
    usedTokens: v.optional(v.number()),
    resetDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { balanceId, ...updates } = args;
    return await ctx.db.patch(balanceId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});