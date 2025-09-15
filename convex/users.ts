import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user from Clerk
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        lastLoginAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        role: "user",
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      });
      
      // Initialize free trial subscription
      await ctx.db.insert("subscriptions", {
        userId,
        stripeCustomerId: "", // Will be set when they subscribe
        stripeSubscriptionId: undefined,
        status: "trialing",
        planType: "free",
        tokensPerMonth: 5, // Free trial tokens
        currentPeriodEnd: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days trial
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Initialize token balance
      await ctx.db.insert("tokenBalance", {
        userId,
        monthlyTokens: 5, // Free trial tokens
        additionalTokens: 0,
        usedTokens: 0,
        resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // Reset in 30 days
        updatedAt: Date.now(),
      });
      
      return userId;
    }
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
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

    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.organizationId !== undefined) updateData.organizationId = args.organizationId;

    await ctx.db.patch(user._id, updateData);
    return user._id;
  },
});