import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

// Get subscription by user ID
export const getSubscriptionByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Internal version for use by other backend functions
export const _getSubscriptionByUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Create new subscription
export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    planType: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("professional"),
      v.literal("enterprise")
    ),
    tokensPerMonth: v.number(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptions", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Note: createFreeTrialSubscription function removed - free trials are no longer supported

// Update existing subscription
export const updateSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: v.optional(v.string()),
    planType: v.optional(v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("professional"),
      v.literal("enterprise")
    )),
    tokensPerMonth: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { subscriptionId, ...updates } = args;
    return await ctx.db.patch(subscriptionId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});