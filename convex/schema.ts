import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (extends Clerk data)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    organizationId: v.optional(v.id("organizations")),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
    lastLoginAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_organization", ["organizationId"]),

  // Organizations
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    planType: v.union(
      v.literal("individual"), 
      v.literal("corporate"), 
      v.literal("enterprise")
    ),
    createdAt: v.number(),
    settings: v.object({
      allowedFileTypes: v.array(v.string()),
      maxFileSize: v.number(),
      retentionDays: v.number(),
    }),
  }).index("by_slug", ["slug"]),

  // Analyses
  analyses: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    type: v.union(
      v.literal("suite_analyzer"),
      v.literal("spec_generator"), 
      v.literal("demand_planner"),
      v.literal("pdp_analyzer")
    ),
    name: v.string(),
    status: v.union(
      v.literal("processing"), 
      v.literal("completed"), 
      v.literal("failed")
    ),
    inputFiles: v.array(v.id("files")),
    data: v.optional(v.any()), // Store input data
    results: v.optional(v.any()),
    error: v.optional(v.string()), // Store error messages
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_type", ["type"]),

  // Files
  files: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    name: v.string(),
    type: v.string(), // CSV, Excel, Image, etc.
    purpose: v.union(
      v.literal("order_history"),
      v.literal("packaging_suite"),
      v.literal("usage_log"),
      v.literal("manual_mix"),
      v.literal("pdp_image"),
      v.literal("competitor_image")
    ),
    storageId: v.string(), // Convex file storage ID
    size: v.number(),
    uploadedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_purpose", ["purpose"]),

  // Reports
  reports: defineTable({
    analysisId: v.id("analyses"),
    userId: v.id("users"),
    type: v.union(v.literal("pdf"), v.literal("csv")),
    storageId: v.string(),
    generatedAt: v.number(),
  }).index("by_analysis", ["analysisId"]),

  // Usage Logs (for Demand Planner)
  demandPlannerUsage: defineTable({
    userId: v.string(), // Clerk user ID
    date: v.string(), // YYYY-MM-DD
    packageType: v.string(),
    quantityUsed: v.number(),
    createdAt: v.number(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_user", ["userId"]),

  // Demand Planning Analysis Results
  demandPlannerAnalyses: defineTable({
    userId: v.string(), // Clerk user ID
    totalOrders: v.number(),
    forecastPeriod: v.string(),
    safetyStockPercent: v.number(),
    results: v.array(v.object({
      packageType: v.string(),
      baseQty: v.number(),
      usagePercent: v.number(),
      safetyStockPercent: v.number(),
      finalQty: v.number(),
      estimatedCost: v.number(),
      estimatedWeight: v.number(),
    })),
    insights: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Stripe Subscriptions (minimal implementation)
  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    status: v.string(), // active, trialing, canceled, etc.
    planType: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("professional"),
      v.literal("enterprise")
    ),
    tokensPerMonth: v.number(),
    currentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  // Token Balance (simple tracking)
  tokenBalance: defineTable({
    userId: v.id("users"),
    monthlyTokens: v.number(), // Allocated from subscription
    additionalTokens: v.number(), // Purchased separately
    usedTokens: v.number(), // Used this period
    resetDate: v.number(), // Next reset date
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});