import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Upload file metadata
export const createFile = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    purpose: v.union(
      v.literal("order_history"),
      v.literal("packaging_suite"),
      v.literal("usage_log"),
      v.literal("manual_mix"),
      v.literal("pdp_image"),
      v.literal("competitor_image")
    ),
    storageId: v.string(),
    size: v.number(),
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

    const fileId = await ctx.db.insert("files", {
      userId: user._id,
      organizationId: user.organizationId,
      name: args.name,
      type: args.type,
      purpose: args.purpose,
      storageId: args.storageId,
      size: args.size,
      uploadedAt: Date.now(),
    });

    return fileId;
  },
});

// Get files by user
export const getFilesByUser = query({
  args: {
    purpose: v.optional(v.union(
      v.literal("order_history"),
      v.literal("packaging_suite"),
      v.literal("usage_log"),
      v.literal("manual_mix"),
      v.literal("pdp_image"),
      v.literal("competitor_image")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    let query = ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.purpose) {
      query = ctx.db
        .query("files")
        .withIndex("by_purpose", (q) => q.eq("purpose", args.purpose as any))
        .filter((q) => q.eq(q.field("userId"), user._id));
    }

    return await query.collect();
  },
});

// Upload file with content (for Suite Analyzer) - Disabled for now
// TODO: Implement proper file upload with generateUploadUrl when needed
/*
export const uploadFile = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    purpose: v.union(
      v.literal("order_history"),
      v.literal("packaging_suite"),
      v.literal("usage_log"),
      v.literal("manual_mix"),
      v.literal("pdp_image"),
      v.literal("competitor_image")
    ),
    content: v.string(),
    size: v.number(),
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

    // TODO: Implement proper file storage
    // const storageId = await ctx.storage.generateUploadUrl();

    const fileId = await ctx.db.insert("files", {
      userId: user._id,
      organizationId: user.organizationId,
      name: args.name,
      type: args.type,
      purpose: args.purpose,
      storageId: "placeholder", // TODO: Replace with actual storage ID
      size: args.size,
      uploadedAt: Date.now(),
    });

    return fileId;
  },
});
*/

// Get file by ID
export const getFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    const file = await ctx.db.get(args.fileId);
    
    // Check if user owns the file
    if (file && file.userId === user._id) {
      return file;
    }

    return null;
  },
});

// Legacy alias for backwards compatibility
export const getFileById = getFile;

// Delete file
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
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

    const file = await ctx.db.get(args.fileId);
    
    if (!file || file.userId !== user._id) {
      throw new Error("File not found or access denied");
    }

    // Delete from storage first
    await ctx.storage.delete(file.storageId);
    
    // Then delete from database
    await ctx.db.delete(args.fileId);

    return { success: true };
  },
});