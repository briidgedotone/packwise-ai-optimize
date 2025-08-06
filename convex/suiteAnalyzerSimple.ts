import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple test functions to get the API working
export const testMutation = mutation({
  args: { message: v.string() },
  handler: async (ctx, args) => {
    return { success: true, message: args.message };
  }
});

export const testQuery = query({
  args: {},
  handler: async (ctx) => {
    return { status: "working" };
  }
});