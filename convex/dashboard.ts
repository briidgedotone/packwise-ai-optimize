import { query } from "./_generated/server";
import { v } from "convex/values";

// Get dashboard metrics aggregated from all analyses
export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get recent analyses for the current user (limited to prevent large data reads)
    const analyses = await ctx.db
      .query("analyses")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .take(100); // Limit to recent 100 analyses to prevent large data reads

    // Calculate total savings from suite analyses
    let totalSavings = 0;
    let totalProducts = 0;
    let activeProjects = 0;
    let efficiencyScores: number[] = [];

    for (const analysis of analyses) {
      if (analysis.type === "suite_analyzer" && analysis.results) {
        const results = analysis.results as any;
        
        // Extract savings data
        if (results.totalSavings) {
          totalSavings += results.totalSavings;
        }
        if (results.costReduction) {
          totalSavings += results.costReduction.totalSavings || 0;
        }
        
        // Count products
        if (results.processedCount) {
          totalProducts += results.processedCount;
        }
        if (results.productCount) {
          totalProducts += results.productCount;
        }

        // Calculate efficiency
        if (results.efficiencyScore) {
          efficiencyScores.push(results.efficiencyScore);
        }
        if (results.wasteReduction) {
          efficiencyScores.push(results.wasteReduction.percentage || 0);
        }
      }

      // Count active projects (analyses from last 30 days)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      if (analysis._creationTime > thirtyDaysAgo) {
        activeProjects++;
      }
    }

    // Calculate average efficiency
    const avgEfficiency = efficiencyScores.length > 0 
      ? efficiencyScores.reduce((a, b) => a + b, 0) / efficiencyScores.length 
      : 0;

    // Count this month's analyses
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthStart = thisMonth.getTime();

    const thisMonthAnalyses = analyses.filter(a => a._creationTime >= thisMonthStart);

    return {
      totalSavings,
      efficiencyScore: Math.min(avgEfficiency, 100), // Cap at 100%
      productsAnalyzed: totalProducts,
      activeProjects,
      thisMonthAnalyses: thisMonthAnalyses.length,
      totalAnalyses: analyses.length,
    };
  },
});

// Get recent activity for the timeline
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get recent analyses (last 10)
    const analyses = await ctx.db
      .query("analyses")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .take(10);

    return analyses.map(analysis => {
      const results = analysis.results as any;
      let value = '';
      let description = '';

      switch (analysis.type) {
        case 'suite_analyzer':
          value = results?.totalSavings ? `$${Math.round(results.totalSavings).toLocaleString()} savings` : 'Analysis complete';
          description = `${results?.processedCount || 'Multiple'} products analyzed for cost optimization`;
          break;
        case 'spec_generator':
          value = results?.results?.length ? `${results.results.length} specs` : 'Specs generated';
          description = `Generated specifications with AI analysis`;
          break;
        case 'pdp_analyzer':
          const scores = results?.mainAnalysis?.scores;
          if (scores && typeof scores === 'object') {
            const scoreValues = Object.values(scores).filter((v): v is number => typeof v === 'number');
            const avgScore = scoreValues.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0;
            value = `Score: ${Math.round(avgScore)}`;
          } else {
            value = 'Design analyzed';
          }
          description = `Packaging design analysis with competitor benchmarking`;
          break;
        case 'demand_planner':
          value = 'Forecast updated';
          description = `Demand planning analysis completed`;
          break;
        default:
          value = 'Complete';
          description = 'Analysis completed successfully';
      }

      return {
        id: analysis._id,
        type: analysis.type,
        title: getActivityTitle(analysis.type),
        description,
        value,
        time: getRelativeTime(analysis._creationTime),
        timestamp: analysis._creationTime,
      };
    });
  },
});

// Get tool usage statistics
export const getToolUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const analyses = await ctx.db
      .query("analyses")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .take(1000); // Limit to recent 1000 analyses for stats calculation

    const toolCounts = {
      suite_analyzer: 0,
      spec_generator: 0,
      pdp_analyzer: 0,
      demand_planner: 0,
    };

    analyses.forEach(analysis => {
      if (toolCounts.hasOwnProperty(analysis.type)) {
        toolCounts[analysis.type as keyof typeof toolCounts]++;
      }
    });

    const total = Object.values(toolCounts).reduce((a, b) => a + b, 0);

    return [
      { 
        name: 'Suite Analyzer', 
        usage: total > 0 ? Math.round((toolCounts.suite_analyzer / total) * 100) : 0, 
        count: toolCounts.suite_analyzer, 
        color: 'blue' 
      },
      { 
        name: 'Spec Generator', 
        usage: total > 0 ? Math.round((toolCounts.spec_generator / total) * 100) : 0, 
        count: toolCounts.spec_generator, 
        color: 'purple' 
      },
      { 
        name: 'Design Analyzer', 
        usage: total > 0 ? Math.round((toolCounts.pdp_analyzer / total) * 100) : 0, 
        count: toolCounts.pdp_analyzer, 
        color: 'pink' 
      },
      { 
        name: 'Demand Planner', 
        usage: total > 0 ? Math.round((toolCounts.demand_planner / total) * 100) : 0, 
        count: toolCounts.demand_planner, 
        color: 'orange' 
      },
    ];
  },
});

// Get recent files
export const getRecentFiles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get recent file uploads
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .take(5);

    return files.map(file => {
      return {
        name: file.name,
        tool: getToolName(file.purpose),
        time: getRelativeTime(file._creationTime),
        timestamp: file._creationTime,
        type: file.purpose,
        size: file.size,
      };
    });
  },
});

// Helper functions
function getActivityTitle(type: string): string {
  switch (type) {
    case 'suite_analyzer': return 'Suite Analysis Completed';
    case 'spec_generator': return 'Specs Generated';
    case 'pdp_analyzer': return 'Design Analysis';
    case 'demand_planner': return 'Demand Forecast Updated';
    default: return 'Analysis Completed';
  }
}

function getToolName(purpose: string): string {
  switch (purpose) {
    case 'packaging_suite': return 'Suite Analyzer';
    case 'order_history': return 'Spec Generator';
    case 'pdp_image': return 'Design Analyzer';
    case 'competitor_image': return 'Design Analyzer';
    case 'usage_log': return 'Demand Planner';
    case 'manual_mix': return 'Suite Analyzer';
    default: return 'Unknown';
  }
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  
  return new Date(timestamp).toLocaleDateString();
}