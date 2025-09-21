import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new analysis
export const create = mutation({
  args: {
    type: v.string(),
    name: v.string(),
    status: v.string(),
    results: v.any(),
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

    const analysisId = await ctx.db.insert("analyses", {
      userId: user._id,
      type: args.type as any,
      name: args.name,
      status: args.status as any,
      inputFiles: [],
      results: args.results,
      createdAt: Date.now(),
      completedAt: args.status === "completed" ? Date.now() : undefined,
    });

    return analysisId;
  },
});

// Get analysis by ID
export const getById = query({
  args: {
    id: v.id("analyses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const analysis = await ctx.db.get(args.id);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || analysis.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return analysis;
  },
});