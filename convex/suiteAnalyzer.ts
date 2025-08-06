import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
// TODO: Uncomment when backend integration is enabled
// import { SuiteAnalyzer } from "../src/lib/suiteAnalyzer/analyzer";
// import type { 
//   SuiteAnalyzerInput, 
//   SuiteAnalysisResult,
//   ProcessingProgress 
// } from "../src/lib/suiteAnalyzer/types";

// ==========================================
// SUITE ANALYZER MUTATIONS
// ==========================================

/**
 * Start a new suite analysis
 */
export const startAnalysis = mutation({
  args: {
    name: v.string(),
    orderHistoryFileId: v.id("files"),
    packagingSuiteFileId: v.id("files"),
    baselineMixFileId: v.optional(v.id("files")),
    fallbackDimensions: v.object({
      smallest: v.object({
        length: v.number(),
        width: v.number(),
        height: v.number()
      }),
      average: v.object({
        length: v.number(),
        width: v.number(),
        height: v.number()
      }),
      largest: v.object({
        length: v.number(),
        width: v.number(),
        height: v.number()
      })
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify files exist and belong to user
    const orderHistoryFile = await ctx.db.get(args.orderHistoryFileId);
    const packagingSuiteFile = await ctx.db.get(args.packagingSuiteFileId);
    
    if (!orderHistoryFile || orderHistoryFile.userId !== user._id) {
      throw new Error("Order history file not found");
    }
    
    if (!packagingSuiteFile || packagingSuiteFile.userId !== user._id) {
      throw new Error("Packaging suite file not found");
    }

    let baselineMixFile = null;
    if (args.baselineMixFileId) {
      baselineMixFile = await ctx.db.get(args.baselineMixFileId);
      if (!baselineMixFile || baselineMixFile.userId !== user._id) {
        throw new Error("Baseline mix file not found");
      }
    }

    // Create analysis record
    const analysisId = await ctx.db.insert("analyses", {
      userId: user._id,
      organizationId: user.organizationId,
      type: "suite_analyzer",
      name: args.name,
      status: "processing",
      inputFiles: baselineMixFile 
        ? [args.orderHistoryFileId, args.packagingSuiteFileId, args.baselineMixFileId!]
        : [args.orderHistoryFileId, args.packagingSuiteFileId],
      createdAt: Date.now()
    });

    // TODO: Schedule the analysis action when backend is enabled
    // await ctx.scheduler.runAfter(0, api.suiteAnalyzer.processAnalysis, {
    //   analysisId,
    //   orderHistoryFileId: args.orderHistoryFileId,
    //   packagingSuiteFileId: args.packagingSuiteFileId,
    //   baselineMixFileId: args.baselineMixFileId,
    //   fallbackDimensions: args.fallbackDimensions
    // });
    
    // For now, mark as completed immediately (frontend handles analysis)
    await ctx.db.patch(analysisId, {
      status: "completed",
      results: { message: "Analysis handled by frontend" },
      completedAt: Date.now()
    });

    return analysisId;
  }
});

/**
 * Update analysis progress
 */
export const updateProgress = mutation({
  args: {
    analysisId: v.id("analyses"),
    progress: v.object({
      stage: v.union(
        v.literal("parsing"),
        v.literal("validation"), 
        v.literal("optimization"),
        v.literal("analysis"),
        v.literal("complete")
      ),
      progress: v.number(),
      currentItem: v.number(),
      totalItems: v.number(),
      message: v.string(),
      timeElapsed: v.number(),
      estimatedTimeRemaining: v.number()
    })
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Store progress in analysis results (temporary)
    await ctx.db.patch(args.analysisId, {
      results: {
        ...((analysis.results as any) || {}),
        progress: args.progress
      }
    });

    return args.analysisId;
  }
});

/**
 * Complete analysis with results
 */
export const completeAnalysis = mutation({
  args: {
    analysisId: v.id("analyses"),
    results: v.any(), // SuiteAnalysisResult type
    success: v.boolean(),
    error: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    await ctx.db.patch(args.analysisId, {
      status: args.success ? "completed" : "failed",
      results: args.success ? args.results : { error: args.error },
      completedAt: Date.now()
    });

    return args.analysisId;
  }
});

// ==========================================
// SUITE ANALYZER QUERIES
// ==========================================

/**
 * Get analysis by ID
 */
export const getAnalysis = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      return null;
    }

    // Verify user has access
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || analysis.userId !== user._id) {
      throw new Error("Access denied");
    }

    return analysis;
  }
});

/**
 * Get user's analyses
 */
export const getUserAnalyses = query({
  args: {
    type: v.optional(v.union(
      v.literal("suite_analyzer"),
      v.literal("spec_generator"), 
      v.literal("demand_planner"),
      v.literal("pdp_analyzer")
    )),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    let query = ctx.db.query("analyses").withIndex("by_user", (q) => q.eq("userId", user._id));
    
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const analyses = await query
      .order("desc")
      .take(args.limit || 50);

    return analyses;
  }
});

/**
 * Get analysis progress
 */
export const getAnalysisProgress = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      return null;
    }

    // Verify user has access
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || analysis.userId !== user._id) {
      throw new Error("Access denied");
    }

    // Return progress from results
    const results = analysis.results as any;
    return results?.progress || null;
  }
});

// ==========================================
// SUITE ANALYZER ACTIONS
// ==========================================

/**
 * Process suite analysis (runs in action to handle long-running operations)
 * TODO: Enable when backend integration is ready
 */
/*
export const processAnalysis = action({
  args: {
    analysisId: v.id("analyses"),
    orderHistoryFileId: v.id("files"),
    packagingSuiteFileId: v.id("files"),
    baselineMixFileId: v.optional(v.id("files")),
    fallbackDimensions: v.object({
      smallest: v.object({
        length: v.number(),
        width: v.number(),
        height: v.number()
      }),
      average: v.object({
        length: v.number(),
        width: v.number(),
        height: v.number()
      }),
      largest: v.object({
        length: v.number(),
        width: v.number(),
        height: v.number()
      })
    })
  },
  handler: async (ctx, args) => {
    console.log("Starting suite analysis processing:", args.analysisId);
    
    try {
      // Get file contents
      const orderHistoryFile = await ctx.storage.get(
        (await ctx.runQuery(api.files.getFile, { fileId: args.orderHistoryFileId }))!.storageId
      );
      const packagingSuiteFile = await ctx.storage.get(
        (await ctx.runQuery(api.files.getFile, { fileId: args.packagingSuiteFileId }))!.storageId
      );
      
      let baselineMixFile = null;
      if (args.baselineMixFileId) {
        baselineMixFile = await ctx.storage.get(
          (await ctx.runQuery(api.files.getFile, { fileId: args.baselineMixFileId }))!.storageId
        );
      }

      if (!orderHistoryFile || !packagingSuiteFile) {
        throw new Error("Could not load required files");
      }

      // Convert files to text
      const orderHistoryCSV = await orderHistoryFile.text();
      const packagingSuiteCSV = await packagingSuiteFile.text();
      const baselineMixCSV = baselineMixFile ? await baselineMixFile.text() : undefined;

      console.log("Files loaded successfully");
      console.log("Order history length:", orderHistoryCSV.length);
      console.log("Packaging suite length:", packagingSuiteCSV.length);
      console.log("Baseline mix length:", baselineMixCSV?.length || 0);

      // Create analyzer with progress callback
      const analyzer = new SuiteAnalyzer(
        {
          allowRotation: true,
          allowStacking: true,
          includeShippingCosts: true,
          minimumFillRate: 30
        },
        async (progress: ProcessingProgress) => {
          // Update progress in database
          await ctx.runMutation(api.suiteAnalyzer.updateProgress, {
            analysisId: args.analysisId,
            progress
          });
        }
      );

      // Prepare analysis input
      const analysisInput: SuiteAnalyzerInput = {
        orderHistoryCSV,
        packagingSuiteCSV,
        baselineMixCSV,
        fallbackDimensions: args.fallbackDimensions
      };

      console.log("Starting analysis with input:", {
        hasOrderHistory: !!analysisInput.orderHistoryCSV,
        hasPackagingSuite: !!analysisInput.packagingSuiteCSV,
        hasBaselineMix: !!analysisInput.baselineMixCSV,
        fallbackDimensions: analysisInput.fallbackDimensions
      });

      // Run analysis
      const results = await analyzer.analyzeSuite(analysisInput);
      
      console.log("Analysis completed successfully");
      console.log("Results summary:", {
        totalOrders: results.summary.totalOrders,
        processedOrders: results.summary.processedOrders,
        totalSavings: results.summary.totalSavings,
        recommendationsCount: results.recommendations.length
      });

      // Save results
      await ctx.runMutation(api.suiteAnalyzer.completeAnalysis, {
        analysisId: args.analysisId,
        results,
        success: true
      });

      console.log("Analysis results saved to database");

    } catch (error) {
      console.error("Analysis failed:", error);
      
      await ctx.runMutation(api.suiteAnalyzer.completeAnalysis, {
        analysisId: args.analysisId,
        results: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
});
*/

/**
 * Delete analysis
 */
export const deleteAnalysis = mutation({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Verify user has access
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || analysis.userId !== user._id) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.analysisId);
    return true;
  }
});