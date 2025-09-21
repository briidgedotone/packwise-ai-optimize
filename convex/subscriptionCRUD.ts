import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

// Create free trial subscription
export const createFreeTrialSubscription = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      stripeCustomerId: "",
      status: "active",
      planType: "free",
      tokensPerMonth: 5,
      currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

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