import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// ==========================================
// SUITE ANALYZER BACKEND - COMPLETE REBUILD
// ==========================================

/**
 * Helper function to get or create a user
 */
async function getOrCreateUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    // Create user if they don't exist
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "",
      name: identity.name || "Unknown User",
      organizationId: undefined,
      role: "user",
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    });
    
    user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Failed to create user");
    }
  }

  return user;
}

/**
 * Start a new Suite Analyzer analysis with file uploads
 */
export const startSuiteAnalysis = mutation({
  args: {
    name: v.string(),
    orderHistoryCSV: v.string(),
    packagingSuiteCSV: v.string(),
    baselineMixCSV: v.optional(v.string()),
    fallbackDimensions: v.optional(v.object({
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
    })),
    config: v.optional(v.object({
      allowRotation: v.boolean(),
      allowStacking: v.boolean(),
      includeShippingCosts: v.boolean(),
      minimumFillRate: v.number()
    }))
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);

    // Create analysis record
    const analysisId = await ctx.db.insert("analyses", {
      userId: user._id,
      organizationId: user.organizationId,
      type: "suite_analyzer",
      name: args.name,
      status: "processing",
      inputFiles: [], // We're storing CSV content directly
      createdAt: Date.now(),
      results: {
        stage: "parsing",
        progress: 0,
        message: "Starting analysis..."
      }
    });

    // Schedule the analysis processing
    await ctx.scheduler.runAfter(0, api.suiteAnalyzerBackend.processSuiteAnalysis, {
      analysisId,
      orderHistoryCSV: args.orderHistoryCSV,
      packagingSuiteCSV: args.packagingSuiteCSV,
      baselineMixCSV: args.baselineMixCSV,
      fallbackDimensions: args.fallbackDimensions,
      config: args.config || {
        allowRotation: true,
        allowStacking: true,
        includeShippingCosts: true,
        minimumFillRate: 30
      }
    });

    return analysisId;
  }
});

/**
 * Update analysis progress in real-time
 */
export const updateAnalysisProgress = mutation({
  args: {
    analysisId: v.id("analyses"),
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
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    await ctx.db.patch(args.analysisId, {
      results: {
        ...((analysis.results as any) || {}),
        progress: {
          stage: args.stage,
          progress: args.progress,
          currentItem: args.currentItem,
          totalItems: args.totalItems,
          message: args.message,
          timeElapsed: args.timeElapsed,
          estimatedTimeRemaining: args.estimatedTimeRemaining
        }
      }
    });

    return args.analysisId;
  }
});

/**
 * Complete analysis with full results
 */
export const completeAnalysis = mutation({
  args: {
    analysisId: v.id("analyses"),
    results: v.any(),
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

/**
 * Get analysis by ID
 */
export const getAnalysis = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
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
      return null;
    }

    return analysis;
  }
});

/**
 * Get analysis progress for real-time updates
 */
export const getAnalysisProgress = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
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
      return null;
    }

    const results = analysis.results as any;
    return results?.progress || null;
  }
});

/**
 * Get user's Suite Analyzer analyses
 */
export const getUserSuiteAnalyses = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("type"), "suite_analyzer"))
      .order("desc")
      .take(args.limit || 50);

    return analyses;
  }
});

/**
 * Delete Suite Analyzer analysis
 */
export const deleteSuiteAnalysis = mutation({
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

// ==========================================
// SUITE ANALYZER PROCESSING ACTION
// ==========================================

/**
 * Process Suite Analysis with full algorithm implementation
 */
export const processSuiteAnalysis = action({
  args: {
    analysisId: v.id("analyses"),
    orderHistoryCSV: v.string(),
    packagingSuiteCSV: v.string(),
    baselineMixCSV: v.optional(v.string()),
    fallbackDimensions: v.optional(v.object({
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
    })),
    config: v.object({
      allowRotation: v.boolean(),
      allowStacking: v.boolean(),
      includeShippingCosts: v.boolean(),
      minimumFillRate: v.number()
    })
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    
    try {
      console.log("Starting Suite Analysis processing:", args.analysisId);

      // Phase 1: Parse CSV data
      await updateProgress(ctx, args.analysisId, "parsing", 10, 1, 5, "Parsing order history...", startTime);
      const orderHistory = parseOrderHistoryCSV(args.orderHistoryCSV, args.fallbackDimensions);
      
      await updateProgress(ctx, args.analysisId, "parsing", 30, 2, 5, "Parsing packaging suite...", startTime);
      const packagingSuite = parsePackagingSuiteCSV(args.packagingSuiteCSV);
      
      let baselineMix = null;
      if (args.baselineMixCSV) {
        await updateProgress(ctx, args.analysisId, "parsing", 50, 3, 5, "Parsing baseline mix...", startTime);
        baselineMix = parseBaselineMixCSV(args.baselineMixCSV);
      }

      // Phase 2: Validation
      await updateProgress(ctx, args.analysisId, "validation", 60, 4, 5, "Validating data...", startTime);
      validateInputData(orderHistory, packagingSuite, baselineMix);

      // Phase 3: Run optimization
      await updateProgress(ctx, args.analysisId, "optimization", 70, 5, 5, "Running optimization...", startTime);
      const allocations = await processOrderAllocations(
        ctx, 
        args.analysisId, 
        orderHistory, 
        packagingSuite, 
        args.config,
        startTime
      );

      // Phase 4: Generate analysis results
      await updateProgress(ctx, args.analysisId, "analysis", 90, 1, 1, "Generating analysis...", startTime);
      console.log("Generating analysis results with allocations:", allocations.length);
      const results = generateAnalysisResults(allocations, orderHistory, packagingSuite, baselineMix, startTime);
      console.log("Analysis results generated successfully");

      // Phase 5: Complete analysis
      console.log("Calling completeAnalysis mutation...");
      await ctx.runMutation(api.suiteAnalyzerBackend.completeAnalysis, {
        analysisId: args.analysisId,
        results,
        success: true
      });

      console.log("Suite Analysis completed successfully");

    } catch (error) {
      console.error("Suite Analysis failed:", error);
      
      await ctx.runMutation(api.suiteAnalyzerBackend.completeAnalysis, {
        analysisId: args.analysisId,
        results: {} as any,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function updateProgress(
  ctx: any, 
  analysisId: any, 
  stage: string, 
  progress: number, 
  currentItem: number, 
  totalItems: number, 
  message: string, 
  startTime: number
) {
  const timeElapsed = Date.now() - startTime;
  const estimatedTimeRemaining = progress > 0 ? (timeElapsed / progress) * (100 - progress) : 0;
  
  await ctx.runMutation(api.suiteAnalyzerBackend.updateAnalysisProgress, {
    analysisId,
    stage: stage as any,
    progress,
    currentItem,
    totalItems,
    message,
    timeElapsed,
    estimatedTimeRemaining
  });
}

function parseOrderHistoryCSV(csv: string, fallbackDimensions?: any) {
  console.log("Parsing order history CSV, first 200 chars:", csv.substring(0, 200));
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  console.log("Order CSV Headers:", headers);
  
  const orders = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const order: any = {};
    
    headers.forEach((header, index) => {
      order[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
    });
    
    // Parse dimensions - only use actual dimensions from CSV, no fallbacks for classification
    let length = null, width = null, height = null;
    let hasActualDimensions = false;
    
    // Check if individual dimensions are provided in CSV
    if (order.length && order.width && order.height) {
      length = parseFloat(order.length);
      width = parseFloat(order.width);
      height = parseFloat(order.height);
      hasActualDimensions = true;
    }
    
    // Try to find the order ID field (various common names)
    const orderId = order.order_id || order.orderid || order.id || order.order || `ORDER-${i}`;
    
    // Try to find the volume field (various common names)
    const volume = order.total_cuin || order.totalcuin || order.total_order_volume || 
                   order.totalordervolume || order.volume || order.total_volume || 
                   order.cubic_inches || order.size || null;
    
    // Log the first few orders for debugging
    if (i <= 3) {
      console.log(`Order ${i} parsed:`, {
        orderId,
        volume,
        hasActualDimensions,
        rawOrder: order
      });
    }
    
    orders.push({
      orderId: orderId,
      productName: order.product_name || order.productname || order.name || 'Unknown Product',
      length,
      width,
      height,
      hasActualDimensions,
      originalVolume: volume ? parseFloat(volume) : null,
      unit: order.unit || 'in',
      quantity: parseInt(order.quantity) || 1,
      weight: parseFloat(order.weight) || 1,
      category: order.category || 'General',
      priority: order.priority || 'standard',
      zone: order.zone || 'domestic'
    });
  }
  
  console.log(`Parsed ${orders.length} orders from CSV`);
  return orders;
}

function parsePackagingSuiteCSV(csv: string) {
  console.log("Parsing packaging suite CSV, first 500 chars:", csv.substring(0, 500));
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  console.log("Package CSV Headers:", headers);
  console.log("Headers after transformation:", headers.map(h => h.toLowerCase().replace(/\s+/g, '_')));
  
  const packages = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const pkg: any = {};
    
    headers.forEach((header, index) => {
      const key = header.toLowerCase().replace(/\s+/g, '_');
      pkg[key] = values[index];
      // Debug the usage field specifically
      if (key.includes('usage')) {
        console.log(`Found usage field: "${header}" -> "${key}" = "${values[index]}"`);
      }
    });
    
    const providedCost = pkg.cost_per_unit || pkg.costperunit || pkg.cost || pkg.price;
    const costPerUnit = parseFloat(providedCost) || 0.0;
    const usingDefaultCost = !providedCost || parseFloat(providedCost) === 0;
    
    packages.push({
      packageName: pkg.package_name || pkg.packagename || pkg.name || `Package-${i}`,
      packageId: pkg.package_id || pkg.packageid || pkg.id || `PKG-${i}`,
      length: parseFloat(pkg.length) || 12,
      width: parseFloat(pkg.width) || 9,
      height: parseFloat(pkg.height) || 3,
      unit: pkg.unit || 'in',
      costPerUnit,
      usingDefaultCost,
      packageWeight: parseFloat(pkg.package_weight || pkg.packageweight || pkg.weight) || 0.1,
      maxWeight: parseFloat(pkg.max_weight || pkg.maxweight) || 50,
      material: pkg.material || 'Cardboard',
      type: pkg.type || 'box',
      usage: pkg['usage_%'] || pkg.usage_percent || pkg.usage || null // Add usage percentage (usage_% comes from "Usage %" header)
    });
  }
  
  console.log(`Parsed ${packages.length} packages from CSV`);
  if (packages.length > 0) {
    console.log("First package:", packages[0]);
    console.log("Usage values found:", packages.map(p => ({ name: p.packageName, usage: p.usage })));
  }
  return packages;
}

function parseBaselineMixCSV(csv: string) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const baseline = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const item: any = {};
    
    headers.forEach((header, index) => {
      item[header.toLowerCase().replace(/\s+/g, '')] = values[index];
    });
    
    baseline.push({
      packageName: item.packagename || item.name || `Package-${i}`,
      packageId: item.packageid || item.id || `PKG-${i}`,
      currentUsagePercent: parseFloat(item.currentusagepercent || item.percentage) || 0,
      monthlyVolume: parseInt(item.monthlyvolume || item.volume) || 0,
      averageCost: parseFloat(item.averagecost || item.cost) || 0
    });
  }
  
  return baseline;
}

function validateInputData(orderHistory: any[], packagingSuite: any[], baselineMix: any[] | null) {
  if (!orderHistory.length) {
    throw new Error("No valid orders found in order history");
  }
  
  if (!packagingSuite.length) {
    throw new Error("No valid packages found in packaging suite");
  }
  
  // Additional validation can be added here
}

async function processOrderAllocations(
  ctx: any,
  analysisId: any,
  orderHistory: any[],
  packagingSuite: any[],
  config: any,
  startTime: number
) {
  const allocations = [];
  const totalOrders = orderHistory.length;
  
  for (let i = 0; i < orderHistory.length; i++) {
    const order = orderHistory[i];
    
    // Update progress every 10 orders
    if (i % 10 === 0) {
      const progress = 70 + ((i / totalOrders) * 20); // 70-90% range
      await updateProgress(
        ctx, 
        analysisId, 
        "optimization", 
        progress, 
        i + 1, 
        totalOrders, 
        `Processing order ${i + 1} of ${totalOrders}...`,
        startTime
      );
    }
    
    // Find best package for this order
    const bestPackage = findBestPackage(order, packagingSuite, config);
    
    if (bestPackage) {
      const allocation = createAllocation(order, bestPackage);
      allocations.push(allocation);
    }
  }
  
  return allocations;
}

function findBestPackage(order: any, packagingSuite: any[], config: any) {
  const orderVolume = order.originalVolume || (order.length * order.width * order.height);
  
  if (!orderVolume) {
    return null; // Can't classify without volume data
  }
  
  let candidatePackages;
  
  if (order.hasActualDimensions) {
    // Use dimensional fitting for orders with actual L×W×H
    candidatePackages = packagingSuite.filter(pkg => {
      const canFit = (
        pkg.length >= order.length &&
        pkg.width >= order.width &&
        pkg.height >= order.height
      ) || (config.allowRotation && canFitWithRotation(order, pkg));
      
      const weightOk = !pkg.maxWeight || order.weight <= pkg.maxWeight;
      
      return canFit && weightOk;
    });
  } else {
    // Use volume-based fitting for orders with only volume data
    candidatePackages = packagingSuite.filter(pkg => {
      const packageVolume = pkg.length * pkg.width * pkg.height;
      const volumeOk = packageVolume >= orderVolume;
      const weightOk = !pkg.maxWeight || order.weight <= pkg.maxWeight;
      
      return volumeOk && weightOk;
    });
  }
  
  if (!candidatePackages.length) {
    return null;
  }
  
  // Sort by efficiency (fill rate / cost ratio)
  candidatePackages.sort((a, b) => {
    const aVolume = a.length * a.width * a.height;
    const bVolume = b.length * b.width * b.height;
    
    const aFillRate = orderVolume / aVolume;
    const bFillRate = orderVolume / bVolume;
    
    const aEfficiency = aFillRate / a.costPerUnit;
    const bEfficiency = bFillRate / b.costPerUnit;
    
    return bEfficiency - aEfficiency; // Higher efficiency first
  });
  
  return candidatePackages[0];
}

function canFitWithRotation(order: any, pkg: any) {
  const orderDims = [order.length, order.width, order.height].sort((a, b) => b - a);
  const pkgDims = [pkg.length, pkg.width, pkg.height].sort((a, b) => b - a);
  
  return orderDims[0] <= pkgDims[0] && orderDims[1] <= pkgDims[1] && orderDims[2] <= pkgDims[2];
}

// Calculate baseline distribution from user-provided usage percentages
function calculateBaselineFromUsage(packagingSuite: any[]) {
  const baselineDistribution: Record<string, number> = {};
  
  // Use the provided usage percentages directly
  let totalUsage = 0;
  
  // Log baseline calculation data (limited to avoid spam)
  if (packagingSuite.length <= 10) {
    console.log("Packages for baseline calculation:", packagingSuite.map(p => ({ 
      name: p.packageName, 
      usage: p['usage_%'] || p.usage_percent || p.usage
    })));
  }
  
  for (const pkg of packagingSuite) {
    // Fix: Look for the correct usage field names that were parsed from CSV
    const usage = parseFloat(pkg['usage_%'] || pkg.usage_percent || pkg.usage || '0');
    if (usage > 0) {
      baselineDistribution[pkg.packageName] = usage;
      totalUsage += usage;
    }
  }
  
  // DON'T USE FALLBACK - User explicitly said no fallback
  if (totalUsage === 0) {
    console.error("ERROR: No usage data found in packages! User provided:", packagingSuite.map(p => ({ name: p.packageName, usage: p['usage_%'] || p.usage_percent || p.usage })));
    // Return empty baseline instead of fallback
    return {};
  } else {
    // Normalize to ensure percentages sum to 1.0 (handles both percentages and counts)
    for (const pkgName in baselineDistribution) {
      baselineDistribution[pkgName] = baselineDistribution[pkgName] / totalUsage;
    }
  }
  
  console.log("Final baseline distribution:", baselineDistribution);
  console.log("Total usage sum:", totalUsage);
  
  return baselineDistribution;
}

// Calculate package distribution from allocations
function calculatePackageDistribution(allocations: any[]) {
  const distribution: Record<string, number> = {};
  
  // Count allocations per package
  for (const alloc of allocations) {
    const pkgName = alloc.recommendedPackage;
    distribution[pkgName] = (distribution[pkgName] || 0) + 1;
  }
  
  // Convert to percentages
  const total = allocations.length;
  const percentages: Record<string, number> = {};
  
  for (const [pkgName, count] of Object.entries(distribution)) {
    percentages[pkgName] = total > 0 ? (count / total) : 0;
  }
  
  return percentages;
}

function createAllocation(order: any, packageOption: any) {
  const orderVolume = order.originalVolume || (order.length * order.width * order.height);
  const packageVolume = packageOption.length * packageOption.width * packageOption.height;
  const fillRate = (orderVolume / packageVolume) * 100;
  const efficiency = fillRate > 0 ? Math.min(100, fillRate * 1.2) : 0;
  
  return {
    orderId: order.orderId,
    originalPackage: undefined,
    recommendedPackage: packageOption.packageName,
    recommendedPackageId: packageOption.packageId,
    itemDimensions: {
      length: order.hasActualDimensions ? order.length : null,
      width: order.hasActualDimensions ? order.width : null,
      height: order.hasActualDimensions ? order.height : null,
      volume: orderVolume
    },
    packageDimensions: {
      length: packageOption.length,
      width: packageOption.width,
      height: packageOption.height,
      volume: packageVolume
    },
    fillRate,
    efficiency,
    costBreakdown: {
      packageCost: packageOption.costPerUnit,
      totalCost: packageOption.costPerUnit,
      usingDefaultCost: packageOption.usingDefaultCost
    }
  };
}


function generateAnalysisResults(
  allocations: any[],
  orderHistory: any[],
  packagingSuite: any[],
  baselineMix: any[] | null,
  startTime: number
) {
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Calculate baseline distribution from user-provided usage percentages
  const baselineDistribution = calculateBaselineFromUsage(packagingSuite);
  
  // Calculate summary metrics
  const processedOrders = allocations.length;
  const failedOrders = orderHistory.length - processedOrders;
  const averageFillRate = processedOrders > 0 ? 
    allocations.reduce((sum, alloc) => sum + alloc.fillRate, 0) / processedOrders : 0;
  
  // Generate recommendations
  const recommendations = generateRecommendations(allocations, packagingSuite);
  
  // Generate metrics
  const metrics = {
    processing: {
      totalTime,
      ordersPerSecond: processedOrders / (totalTime / 1000),
      memoryUsage: 0 // Placeholder
    },
    optimization: {
      successRate: (processedOrders / orderHistory.length) * 100,
      averageIterations: 1,
      convergenceRate: 100
    },
    quality: {
      fillRateDistribution: calculateFillRateDistribution(allocations),
      costDistribution: calculateCostDistribution(allocations),
      efficiencyScores: allocations.map(a => a.efficiency)
    }
  };
  
  // Calculate optimized distribution from allocations
  const optimizedDistribution = calculatePackageDistribution(allocations);
  
  return {
    analysisId: "temp-id", // Will be replaced with actual ID
    timestamp: endTime,
    summary: {
      totalOrders: orderHistory.length,
      processedOrders,
      failedOrders,
      averageFillRate
    },
    allocations,
    baselineDistribution,
    optimizedDistribution,
    recommendations,
    metrics
  };
}


function generateRecommendations(allocations: any[], packagingSuite: any[]) {
  const recommendations = [];
  
  // Low fill rate recommendation
  const lowFillRateOrders = allocations.filter(a => a.fillRate < 60);
  if (lowFillRateOrders.length > 0) {
    recommendations.push({
      type: "size_optimization" as const,
      priority: "high" as const,
      title: "Optimize Package Sizes",
      description: `${lowFillRateOrders.length} orders have fill rates below 60%. Consider smaller packaging options.`,
      impact: {
        savingsAmount: lowFillRateOrders.length * 0.85,
        savingsPercent: 12,
        affectedOrders: lowFillRateOrders.length
      },
      implementation: {
        difficulty: "medium" as const,
        timeframe: "2-4 weeks",
        steps: [
          "Analyze current package inventory",
          "Source smaller packaging options",
          "Update packaging guidelines",
          "Train fulfillment team"
        ]
      }
    });
  }
  
  // High cost recommendation
  const highCostOrders = allocations.filter(a => a.costBreakdown.totalCost > 15);
  if (highCostOrders.length > 0) {
    recommendations.push({
      type: "cost_reduction" as const,
      priority: "medium" as const,
      title: "Reduce High-Cost Orders",
      description: `${highCostOrders.length} orders have packaging costs above $15. Review for optimization opportunities.`,
      impact: {
        savingsAmount: highCostOrders.length * 2.50,
        savingsPercent: 8,
        affectedOrders: highCostOrders.length
      },
      implementation: {
        difficulty: "easy" as const,
        timeframe: "1-2 weeks",
        steps: [
          "Review high-cost order patterns",
          "Negotiate better shipping rates",
          "Consider bulk packaging discounts"
        ]
      }
    });
  }
  
  return recommendations;
}

function calculateFillRateDistribution(allocations: any[]) {
  const distribution: Record<string, number> = {
    "0-25%": 0,
    "25-50%": 0,
    "50-75%": 0,
    "75-100%": 0
  };
  
  allocations.forEach(alloc => {
    const fillRate = alloc.fillRate;
    if (fillRate < 25) distribution["0-25%"]++;
    else if (fillRate < 50) distribution["25-50%"]++;
    else if (fillRate < 75) distribution["50-75%"]++;
    else distribution["75-100%"]++;
  });
  
  return distribution;
}

function calculateCostDistribution(allocations: any[]) {
  const distribution: Record<string, number> = {
    "Under_5": 0,
    "5_to_10": 0,
    "10_to_20": 0,
    "Over_20": 0
  };
  
  allocations.forEach(alloc => {
    const cost = alloc.costBreakdown.totalCost;
    if (cost < 5) distribution["Under_5"]++;
    else if (cost < 10) distribution["5_to_10"]++;
    else if (cost < 20) distribution["10_to_20"]++;
    else distribution["Over_20"]++;
  });
  
  return distribution;
}