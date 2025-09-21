// Token management functions
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";

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
    analysisId: v.optional(v.union(v.id("analyses"), v.null())),
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
        status: "none",
        planType: null,
        isActive: false,
      };
    }

    // Free trial plans are no longer supported - treat as inactive to force migration
    const isActive = subscription.planType !== "free" &&
                     (subscription.status === "active" || subscription.status === "trialing");

    return {
      status: subscription.status,
      planType: subscription.planType,
      tokensPerMonth: subscription.tokensPerMonth,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isActive,
    };
  },
});

// Manual subscription sync - force refresh from Stripe
export const syncSubscriptionFromStripe = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; message: string; subscription?: any }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    try {
      // For now, return a simple response until we fix the internal dependencies
      return {
        success: false,
        message: "Manual sync temporarily disabled while fixing dependencies"
      };
    } catch (error: any) {
      console.error("Subscription sync error:", error);
      return {
        success: false,
        message: error.message || "Failed to sync subscription"
      };
    }
  },
});

// Get webhook status for current user - TEMPORARILY DISABLED
// export const getWebhookStatus = query({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) return null;

//     try {
//       const webhookStatus = await ctx.db
//         .query("webhookStatus")
//         .withIndex("by_user", (q) => q.eq("userId", identity.subject))
//         .order("desc")
//         .first();

//       return webhookStatus;
//     } catch (error) {
//       // If webhookStatus table doesn't exist or has issues, return null
//       console.error("Error fetching webhook status:", error);
//       return null;
//     }
//   },
// });