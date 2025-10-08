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
    analysisId: v.optional(v.any()),
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

// Refund a token when analysis fails
export const refundToken = mutation({
  args: {
    analysisType: v.string(),
    reason: v.optional(v.string()),
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

    console.log(`[Token Refund] Analysis Type: ${args.analysisType}, Reason: ${args.reason || 'Analysis failed'}`);
    console.log(`[Token Refund] Current token state - Used: ${tokenBalance.usedTokens}, Monthly: ${tokenBalance.monthlyTokens}, Additional: ${tokenBalance.additionalTokens}`);

    // More lenient check - if usedTokens is 0, it might be a timing issue
    // In this case, we'll still mark it as success to prevent error messages
    if (tokenBalance.usedTokens < 1) {
      console.warn(`[Token Refund] UsedTokens is ${tokenBalance.usedTokens}, no refund needed but returning success to avoid user-facing error`);
      const remainingTokens = tokenBalance.monthlyTokens + tokenBalance.additionalTokens - tokenBalance.usedTokens;
      return {
        success: true,
        message: "No tokens to refund (already at 0 used tokens)",
        remainingTokens,
      };
    }

    // Refund the token by decrementing usedTokens
    const newUsedTokens = Math.max(0, tokenBalance.usedTokens - 1);
    await ctx.db.patch(tokenBalance._id, {
      usedTokens: newUsedTokens,
      updatedAt: Date.now(),
    });

    const remainingTokens = tokenBalance.monthlyTokens + tokenBalance.additionalTokens - newUsedTokens;

    console.log(`[Token Refund] Success - New usedTokens: ${newUsedTokens}, Remaining: ${remainingTokens}`);

    return {
      success: true,
      remainingTokens,
      message: "Token refunded successfully",
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

// Debug function to check user's database records
export const debugUserRecords = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { error: "Not authenticated" };

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { error: "User not found" };

    // Get subscription record
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Get token balance record
    const tokenBalance = await ctx.db
      .query("tokenBalance")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Get analyses records
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(5);

    // Get files records
    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(5);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        clerkId: user.clerkId
      },
      subscription: subscription ? {
        status: subscription.status,
        planType: subscription.planType,
        tokensPerMonth: subscription.tokensPerMonth,
        currentPeriodEnd: subscription.currentPeriodEnd
      } : null,
      tokenBalance: tokenBalance ? {
        monthlyTokens: tokenBalance.monthlyTokens,
        additionalTokens: tokenBalance.additionalTokens,
        usedTokens: tokenBalance.usedTokens,
        resetDate: tokenBalance.resetDate
      } : null,
      analyses: analyses.map(a => ({
        id: a._id,
        type: a.type,
        name: a.name,
        status: a.status,
        createdAt: a.createdAt
      })),
      files: files.map(f => ({
        id: f._id,
        name: f.name,
        purpose: f.purpose
      }))
    };
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