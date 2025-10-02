import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Define the data structures
const PackagingTypeValidator = v.object({
  name: v.string(),
  length: v.number(),
  width: v.number(),
  height: v.number(),
  cost: v.number(),
  weight: v.number(),
});

const QuarterDataValidator = v.object({
  quarter: v.string(),
  packageType: v.string(),
  quantity: v.number(),
});

const ManualMixValidator = v.object({
  packageType: v.string(),
  percentage: v.number(),
});

const ForecastParamsValidator = v.object({
  totalOrders: v.number(),
  safetyBuffer: v.number(),
});

// Store packaging types for a user
export const storePackagingTypes = mutation({
  args: {
    packagingTypes: v.array(PackagingTypeValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email || "",
        name: identity.name || "",
        role: "user" as const,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      });
      
      user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("Failed to create user");
      }
    }

    // Clear existing packaging types for this user
    const existingTypes = await ctx.db
      .query("packagingTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const existingType of existingTypes) {
      await ctx.db.delete(existingType._id);
    }

    // Insert new packaging types
    const insertedTypes = [];
    for (const packagingType of args.packagingTypes) {
      const inserted = await ctx.db.insert("packagingTypes", {
        userId: user._id,
        name: packagingType.name,
        length: packagingType.length,
        width: packagingType.width,
        height: packagingType.height,
        cost: packagingType.cost,
        weight: packagingType.weight,
        createdAt: Date.now(),
      });
      insertedTypes.push(inserted);
    }

    return insertedTypes;
  },
});

// Get packaging types for a user
export const getPackagingTypes = query({
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

    if (!user) return [];

    const packagingTypes = await ctx.db
      .query("packagingTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return packagingTypes;
  },
});

// Store quarterly usage data
export const storeQuarterlyData = mutation({
  args: {
    quarter: v.string(),
    usageData: v.array(QuarterDataValidator),
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

    // Remove existing data for this quarter and user
    const existingData = await ctx.db
      .query("quarterlyUsage")
      .withIndex("by_user_quarter", (q) => 
        q.eq("userId", user._id).eq("quarter", args.quarter)
      )
      .collect();

    for (const existing of existingData) {
      await ctx.db.delete(existing._id);
    }

    // Insert new quarterly data
    const insertedData = [];
    for (const usage of args.usageData) {
      const inserted = await ctx.db.insert("quarterlyUsage", {
        userId: user._id,
        quarter: args.quarter,
        packageType: usage.packageType,
        quantity: usage.quantity,
        createdAt: Date.now(),
      });
      insertedData.push(inserted);
    }

    return insertedData;
  },
});

// Get quarterly usage data for a user
export const getQuarterlyData = query({
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

    if (!user) return [];

    const quarterlyData = await ctx.db
      .query("quarterlyUsage")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return quarterlyData;
  },
});

// Calculate mix percentages from quarterly data
export const calculateMixFromQuarterly = query({
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

    if (!user) return {};

    const quarterlyData = await ctx.db
      .query("quarterlyUsage")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Calculate totals by package type
    const totals: Record<string, number> = {};
    let grandTotal = 0;

    quarterlyData.forEach((usage) => {
      totals[usage.packageType] = (totals[usage.packageType] || 0) + usage.quantity;
      grandTotal += usage.quantity;
    });

    // Calculate percentages
    const mixPercentages: Record<string, number> = {};
    if (grandTotal > 0) {
      Object.keys(totals).forEach((packageType) => {
        mixPercentages[packageType] = (totals[packageType] / grandTotal) * 100;
      });
    }

    return mixPercentages;
  },
});

// Store manual mix percentages
export const storeManualMix = mutation({
  args: {
    manualMix: v.array(ManualMixValidator),
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

    // Clear existing manual mix for this user
    const existingMix = await ctx.db
      .query("manualMix")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const existing of existingMix) {
      await ctx.db.delete(existing._id);
    }

    // Insert new manual mix
    const insertedMix = [];
    for (const mix of args.manualMix) {
      const inserted = await ctx.db.insert("manualMix", {
        userId: user._id,
        packageType: mix.packageType,
        percentage: mix.percentage,
        createdAt: Date.now(),
      });
      insertedMix.push(inserted);
    }

    return insertedMix;
  },
});

// Get manual mix percentages
export const getManualMix = query({
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

    if (!user) return [];

    const manualMix = await ctx.db
      .query("manualMix")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return manualMix;
  },
});

// Calculate demand forecast
export const calculateDemandForecast = action({
  args: {
    method: v.union(v.literal("historical"), v.literal("manual")),
    forecastParams: ForecastParamsValidator,
    manualMix: v.optional(v.array(ManualMixValidator)),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get packaging types
    const packagingTypes: any[] = await ctx.runQuery(api.improvedDemandPlanner.getPackagingTypes);

    // Get mix percentages based on method
    let mixPercentages: Record<string, number> = {};
    
    if (args.method === "historical") {
      mixPercentages = await ctx.runQuery(api.improvedDemandPlanner.calculateMixFromQuarterly);
    } else if (args.method === "manual" && args.manualMix) {
      // Store manual mix first
      await ctx.runMutation(api.improvedDemandPlanner.storeManualMix, {
        manualMix: args.manualMix,
      });
      
      // Convert array to percentage object
      args.manualMix.forEach((mix) => {
        mixPercentages[mix.packageType] = mix.percentage;
      });
    }

    // Calculate demand for each package type
    const demandResults: any[] = [];
    const { totalOrders, safetyBuffer } = args.forecastParams;
    const safetyMultiplier: number = 1 + (safetyBuffer / 100);

    for (const [packageType, percentage] of Object.entries(mixPercentages)) {
      // Try to find exact match first, then try partial match
      let packagingType: any = packagingTypes.find((p: any) => p.name === packageType);

      // If no exact match, try case-insensitive partial matching
      if (!packagingType) {
        const packageTypeLower = packageType.toLowerCase();
        packagingType = packagingTypes.find((p: any) => {
          const nameLower = p.name.toLowerCase();
          // Check if either contains the other (handles "Small" vs "Small Box" cases)
          return nameLower.includes(packageTypeLower) || packageTypeLower.includes(nameLower);
        });
      }

      // Log if still no match found
      if (!packagingType) {
        console.warn(`No packaging type found for "${packageType}". Available types:`, packagingTypes.map((p: any) => p.name));
      }

      const baseQuantity = Math.round(totalOrders * (percentage / 100));
      const finalQuantity = Math.round(baseQuantity * safetyMultiplier);
      const estimatedCost: number = packagingType ? packagingType.cost * finalQuantity : 0;
      const estimatedWeight: number = packagingType ? packagingType.weight * finalQuantity : 0;

      demandResults.push({
        packageType,
        usagePercentage: percentage,
        baseQuantity,
        finalQuantity,
        estimatedCost,
        estimatedWeight,
        packagingSpecs: packagingType ? {
          length: packagingType.length,
          width: packagingType.width,
          height: packagingType.height,
        } : null,
      });
    }

    // Sort by usage percentage (descending)
    demandResults.sort((a, b) => b.usagePercentage - a.usagePercentage);

    // Store the analysis result
    const user: any = await ctx.runQuery(api.users.getCurrentUser);
    if (user) {
      const analysisId: any = await ctx.runMutation(api.analyses.create, {
        type: "demand_planner_v2",
        name: `Demand Forecast - ${new Date().toLocaleDateString()}`,
        status: "completed",
        results: {
          method: args.method,
          forecastParams: args.forecastParams,
          mixPercentages,
          demandResults,
          totalUnits: demandResults.reduce((sum, r) => sum + r.finalQuantity, 0),
          totalCost: demandResults.reduce((sum, r) => sum + r.estimatedCost, 0),
          totalWeight: demandResults.reduce((sum, r) => sum + r.estimatedWeight, 0),
          generatedAt: Date.now(),
        },
      });

      return {
        analysisId,
        results: demandResults,
        summary: {
          totalUnits: demandResults.reduce((sum, r) => sum + r.finalQuantity, 0),
          totalCost: demandResults.reduce((sum, r) => sum + r.estimatedCost, 0),
          totalWeight: demandResults.reduce((sum, r) => sum + r.estimatedWeight, 0),
          dominantPackage: demandResults[0]?.packageType || "None",
          method: args.method,
        },
      };
    }

    return {
      results: demandResults,
      summary: {
        totalUnits: demandResults.reduce((sum, r) => sum + r.finalQuantity, 0),
        totalCost: demandResults.reduce((sum, r) => sum + r.estimatedCost, 0),
        totalWeight: demandResults.reduce((sum, r) => sum + r.estimatedWeight, 0),
        dominantPackage: demandResults[0]?.packageType || "None",
        method: args.method,
      },
    };
  },
});

// Get demand planner history
export const getDemandPlannerHistory = query({
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

    if (!user) return [];

    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("type"), "demand_planner_v2"))
      .order("desc")
      .take(20);

    return analyses.map((analysis) => ({
      _id: analysis._id,
      name: analysis.name,
      createdAt: analysis._creationTime,
      status: analysis.status,
      summary: analysis.results?.summary || null,
    }));
  },
});

// Export demand forecast data
export const exportDemandForecast = action({
  args: {
    analysisId: v.id("analyses"),
    format: v.union(v.literal("csv"), v.literal("pdf")),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const analysis: any = await ctx.runQuery(api.analyses.getById, {
      id: args.analysisId,
    });

    if (!analysis || analysis.type !== "demand_planner_v2") {
      throw new Error("Analysis not found");
    }

    const results: any = analysis.results;

    if (args.format === "csv") {
      // Generate CSV content
      const headers = [
        "Package Type",
        "Usage Percentage",
        "Base Quantity", 
        "Final Quantity (with Safety Buffer)",
        "Estimated Cost",
        "Estimated Weight (lbs)",
      ];

      const rows: any[] = results.demandResults.map((result: any) => [
        result.packageType,
        `${result.usagePercentage.toFixed(2)}%`,
        result.baseQuantity.toString(),
        result.finalQuantity.toString(),
        `$${result.estimatedCost.toFixed(2)}`,
        `${result.estimatedWeight.toFixed(2)} lbs`,
      ]);

      const csvContent: string = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

      return {
        success: true,
        format: "csv",
        content: csvContent,
        filename: `demand_forecast_${new Date().toISOString().split("T")[0]}.csv`,
      };
    }

    // For PDF, return structured data that frontend can use to generate PDF
    return {
      success: true,
      format: "pdf",
      data: {
        title: analysis.name,
        generatedAt: results.generatedAt,
        method: results.method,
        forecastParams: results.forecastParams,
        demandResults: results.demandResults,
        summary: results.summary || {
          totalUnits: results.demandResults.reduce((sum: number, r: any) => sum + r.finalQuantity, 0),
          totalCost: results.demandResults.reduce((sum: number, r: any) => sum + r.estimatedCost, 0),
          totalWeight: results.demandResults.reduce((sum: number, r: any) => sum + r.estimatedWeight, 0),
        },
      },
      filename: `demand_forecast_${new Date().toISOString().split("T")[0]}.pdf`,
    };
  },
});

// Clear all user data (for testing)
export const clearAllUserData = mutation({
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

    if (!user) return { cleared: 0 };

    let clearedCount = 0;

    // Clear packaging types
    const packagingTypes = await ctx.db
      .query("packagingTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of packagingTypes) {
      await ctx.db.delete(item._id);
      clearedCount++;
    }

    // Clear quarterly usage
    const quarterlyUsage = await ctx.db
      .query("quarterlyUsage")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of quarterlyUsage) {
      await ctx.db.delete(item._id);
      clearedCount++;
    }

    // Clear manual mix
    const manualMix = await ctx.db
      .query("manualMix")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of manualMix) {
      await ctx.db.delete(item._id);
      clearedCount++;
    }

    return { cleared: clearedCount };
  },
});