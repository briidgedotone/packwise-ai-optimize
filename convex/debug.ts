import { query } from "./_generated/server";

// Debug query to examine analysis data structure
export const debugAnalysisData = query({
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
      return { message: "No user found" };
    }

    // Get first few analyses to examine structure
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(3);

    return {
      totalAnalyses: analyses.length,
      sampleAnalyses: analyses.map(analysis => ({
        id: analysis._id,
        type: analysis.type,
        name: analysis.name,
        status: analysis.status,
        hasResults: !!analysis.results,
        resultsKeys: analysis.results ? Object.keys(analysis.results as any) : [],
        sampleResults: analysis.results ? JSON.stringify(analysis.results).substring(0, 500) : null
      }))
    };
  },
});