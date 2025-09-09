import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Get all analyses/reports for the current user
export const getUserReports = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get recent analyses for this user (limit to prevent large data reads)
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100); // Limit to recent 100 reports

    // Format the analyses with additional metadata
    const formattedReports = analyses.map((analysis) => {
      // Calculate duration if completed
      let duration = null;
      if (analysis.completedAt) {
        duration = Math.round((analysis.completedAt - analysis.createdAt) / 1000); // in seconds
      }

      // Get display name based on type
      const typeDisplayNames = {
        suite_analyzer: "Suite Analysis",
        spec_generator: "Spec Generation",
        demand_planner: "Demand Planning",
        pdp_analyzer: "Design Analysis",
      };

      // Get icon color based on type
      const typeColors = {
        suite_analyzer: "blue",
        spec_generator: "purple",
        demand_planner: "emerald",
        pdp_analyzer: "pink",
      };

      return {
        _id: analysis._id,
        name: analysis.name,
        type: analysis.type,
        typeDisplay: typeDisplayNames[analysis.type] || analysis.type,
        typeColor: typeColors[analysis.type] || "gray",
        status: analysis.status,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt,
        duration,
        hasResults: !!analysis.results,
        error: analysis.error,
        // Add result summary if available
        resultSummary: analysis.results ? generateResultSummary(analysis.type, analysis.results) : null,
      };
    });

    return formattedReports;
  },
});

// Get reports by status
export const getReportsByStatus = query({
  args: {
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .take(50); // Limit to recent 50 analyses for filtered results

    return analyses;
  },
});

// Get a single report by ID
export const getReport = query({
  args: { reportId: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const analysis = await ctx.db.get(args.reportId);
    if (!analysis) {
      throw new Error("Report not found");
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

// Delete a report
export const deleteReport = mutation({
  args: { reportId: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const analysis = await ctx.db.get(args.reportId);
    if (!analysis) {
      throw new Error("Report not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || analysis.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Delete associated reports (PDFs, CSVs)
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_analysis", (q) => q.eq("analysisId", args.reportId))
      .take(100); // Limit to prevent large data reads during deletion

    for (const report of reports) {
      await ctx.db.delete(report._id);
    }

    // Delete the analysis
    await ctx.db.delete(args.reportId);

    return { success: true };
  },
});

// Get report statistics
export const getReportStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return {
        total: 0,
        completed: 0,
        processing: 0,
        failed: 0,
        byType: {},
      };
    }

    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(1000); // Limit to recent 1000 analyses for stats calculation

    const stats = {
      total: analyses.length,
      completed: analyses.filter(a => a.status === "completed").length,
      processing: analyses.filter(a => a.status === "processing").length,
      failed: analyses.filter(a => a.status === "failed").length,
      byType: {
        suite_analyzer: analyses.filter(a => a.type === "suite_analyzer").length,
        spec_generator: analyses.filter(a => a.type === "spec_generator").length,
        demand_planner: analyses.filter(a => a.type === "demand_planner").length,
        pdp_analyzer: analyses.filter(a => a.type === "pdp_analyzer").length,
      },
    };

    return stats;
  },
});

// Helper function to generate result summary
function generateResultSummary(type: string, results: Record<string, unknown>): string {
  if (!results) return "";

  switch (type) {
    case "suite_analyzer":
      if (results.optimizedMix && results.costSavings) {
        return `${(results.costSavings as {percentage: number}).percentage}% cost reduction identified`;
      }
      return "Analysis complete";

    case "spec_generator":
      if (results.specifications) {
        return `${(results.specifications as unknown[]).length} specifications generated`;
      }
      return "Specifications generated";

    case "demand_planner":
      if (results.forecast) {
        return `Forecast for ${(results.forecast as unknown[]).length} package types`;
      }
      return "Demand forecast complete";

    case "pdp_analyzer":
      if (results.score) {
        return `Score: ${results.score as number}/100`;
      }
      return "Design analysis complete";

    default:
      return "Analysis complete";
  }
}

// Export report as CSV or PDF (action for long-running task)
export const exportReport = action({
  args: {
    reportId: v.id("analyses"),
    format: v.union(v.literal("csv"), v.literal("pdf")),
  },
  handler: async (ctx, args) => {
    // Get the analysis
    const analysis = await ctx.runQuery(api.reports.getReport, {
      reportId: args.reportId,
    });

    if (!analysis) {
      throw new Error("Report not found");
    }

    // Generate export based on format
    // This is a placeholder - actual implementation would generate real files
    if (args.format === "csv") {
      // Generate CSV content
      return {
        success: true,
        message: "CSV export generated",
        downloadUrl: "#", // Would be actual download URL
      };
    } else {
      // Generate PDF content
      return {
        success: true,
        message: "PDF export generated",
        downloadUrl: "#", // Would be actual download URL
      };
    }
  },
});