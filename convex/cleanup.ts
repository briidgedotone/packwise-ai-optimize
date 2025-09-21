import { mutation } from "./_generated/server";

// Clean up old analyses to reduce database usage
export const cleanupOldAnalyses = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { deleted: 0, message: "User not found" };
    }

    // Delete analyses older than 60 days
    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    
    // Get old analyses in small batches to avoid exceeding limits
    const oldAnalyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.lt(q.field("_creationTime"), sixtyDaysAgo))
      .take(50); // Only delete 50 at a time to avoid hitting limits

    let deletedCount = 0;
    
    for (const analysis of oldAnalyses) {
      try {
        await ctx.db.delete(analysis._id);
        deletedCount++;
      } catch (error) {
        console.error("Failed to delete analysis:", error);
        break; // Stop if we hit an error
      }
    }

    return { 
      deleted: deletedCount, 
      message: `Deleted ${deletedCount} old analyses (older than 60 days)` 
    };
  },
});

// Clean up failed analyses
export const cleanupFailedAnalyses = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { deleted: 0, message: "User not found" };
    }

    // Get ALL failed analyses immediately - don't wait 7 days
    const failedAnalyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "failed"))
      .take(100); // Larger batch to clean more aggressively

    let deletedCount = 0;
    
    for (const analysis of failedAnalyses) {
      try {
        await ctx.db.delete(analysis._id);
        deletedCount++;
      } catch (error) {
        console.error("Failed to delete analysis:", error);
        break;
      }
    }

    return { 
      deleted: deletedCount, 
      message: `Deleted ${deletedCount} failed analyses (all failed analyses removed)` 
    };
  },
});

// Emergency cleanup - delete ALL analyses to restore functionality
export const emergencyCleanupAllAnalyses = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { deleted: 0, message: "User not found" };
    }

    // Get ALL analyses for emergency cleanup
    const allAnalyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(200); // Large batch for emergency cleanup

    let deletedCount = 0;
    
    for (const analysis of allAnalyses) {
      try {
        await ctx.db.delete(analysis._id);
        deletedCount++;
      } catch (error) {
        console.error("Failed to delete analysis:", error);
        break;
      }
    }

    return { 
      deleted: deletedCount, 
      message: `Emergency cleanup complete: Deleted ${deletedCount} analyses` 
    };
  },
});