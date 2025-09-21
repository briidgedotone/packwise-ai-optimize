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