import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

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
      
      // Check if this is a testing account and update tokens if needed
      const isTestingAccount = args.email === 'admin@briidge.one';
      if (isTestingAccount) {
        const tokenBalance = await ctx.db
          .query("tokenBalance")
          .withIndex("by_user", (q) => q.eq("userId", existingUser._id))
          .first();
        
        if (tokenBalance && tokenBalance.monthlyTokens < 1000) {
          // Update to testing tokens
          await ctx.db.patch(tokenBalance._id, {
            monthlyTokens: 1000,
            updatedAt: Date.now(),
          });
        }
        
        // Update subscription as well
        const subscription = await ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q) => q.eq("userId", existingUser._id))
          .first();
        
        if (subscription && subscription.tokensPerMonth < 1000) {
          await ctx.db.patch(subscription._id, {
            tokensPerMonth: 1000,
            planType: "enterprise",
            status: "trialing",
            currentPeriodEnd: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
            updatedAt: Date.now(),
          });
        }
      }
      
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
      
      // Check if this is a testing account - only create subscription/tokens for testing accounts
      const isTestingAccount = args.email === 'admin@briidge.one';

      if (isTestingAccount) {
        const monthlyTokens = 1000; // 1000 tokens for testing account

        // Initialize enterprise subscription for testing account
        await ctx.db.insert("subscriptions", {
          userId,
          stripeCustomerId: "", // Will be set when they subscribe
          stripeSubscriptionId: undefined,
          status: "trialing",
          planType: "enterprise",
          tokensPerMonth: monthlyTokens,
          currentPeriodEnd: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year for testing
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Initialize token balance for testing account
        await ctx.db.insert("tokenBalance", {
          userId,
          monthlyTokens: monthlyTokens,
          additionalTokens: 0,
          usedTokens: 0,
          resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // Reset in 30 days
          updatedAt: Date.now(),
        });
      }
      // For regular users: NO automatic subscription or token balance creation
      // They must explicitly choose a plan on the onboarding page
      
      return userId;
    }
  },
});

// Get user by Clerk ID (for webhooks)
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Internal version for use by other backend functions
export const _getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Update user's Stripe customer ID
export const updateUserStripeCustomerId = mutation({
  args: {
    clerkId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      stripeCustomerId: args.stripeCustomerId,
    });

    return user._id;
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