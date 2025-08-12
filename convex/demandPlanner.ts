import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Data type definitions
interface UsageRecord {
  date: string;
  packageType: string;
  quantityUsed: number;
}

interface ManualMixRecord {
  packageType: string;
  usagePercent: number;
}

interface PackagingSuiteRecord {
  packageType: string;
  length: number;
  width: number;
  height: number;
  internalVolume?: number;
  costPerUnit?: number;
  weightPerUnit?: number;
}

interface DemandResult {
  packageType: string;
  baseQty: number;
  usagePercent: number;
  safetyStockPercent: number;
  finalQty: number;
  estimatedCost: number;
  estimatedWeight: number;
}

// Main demand planning calculation
export const calculateDemandPlanning = action({
  args: {
    totalOrders: v.number(),
    forecastPeriod: v.string(),
    usageLogData: v.optional(v.string()), // CSV data
    manualMixData: v.optional(v.string()), // CSV data (overrides usage log)
    packagingSuiteData: v.string(), // CSV data
    safetyStockPercent: v.optional(v.number()),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    analysisId: any;
    results: DemandResult[];
    totalPackages: number;
    totalCost: number;
    totalWeight: number;
    insights: string[];
  }> => {
    try {
      // Parse packaging suite data (required)
      const packagingSuite = parsePackagingSuite(args.packagingSuiteData);
      
      // Determine packaging mix percentages
      let packagingMix: Record<string, number>;
      
      if (args.manualMixData) {
        // Option B: Manual mix overrides usage log
        packagingMix = parseManualMix(args.manualMixData);
      } else if (args.usageLogData) {
        // Option A: Calculate from usage log
        const usageRecords = parseUsageLog(args.usageLogData);
        
        // Get existing usage data and merge
        const existingUsage = await ctx.runQuery(api.demandPlanner.getUsageHistory, {
          userId: args.userId,
        });
        
        const combinedUsage = [...existingUsage, ...usageRecords];
        packagingMix = calculateMixFromUsage(combinedUsage);
        
        // Store new usage records
        for (const record of usageRecords) {
          await ctx.runMutation(api.demandPlanner.storeUsageRecord, {
            userId: args.userId,
            date: record.date,
            packageType: record.packageType,
            quantityUsed: record.quantityUsed,
          });
        }
      } else {
        throw new Error("Either usage log data or manual mix data must be provided");
      }

      // Calculate demand for each package type
      const demandResults: DemandResult[] = [];
      const safetyStock = args.safetyStockPercent || 0;
      
      for (const [packageType, usagePercent] of Object.entries(packagingMix)) {
        const packageSpec = packagingSuite.find(spec => spec.packageType === packageType);
        
        if (!packageSpec) {
          console.warn(`Package type "${packageType}" not found in packaging suite`);
          continue;
        }
        
        const baseQty = Math.round(args.totalOrders * (usagePercent / 100));
        const finalQty = Math.round(baseQty * (1 + safetyStock / 100));
        const estimatedCost = (packageSpec.costPerUnit || 0) * finalQty;
        const estimatedWeight = (packageSpec.weightPerUnit || 0) * finalQty;
        
        demandResults.push({
          packageType,
          baseQty,
          usagePercent,
          safetyStockPercent: safetyStock,
          finalQty,
          estimatedCost,
          estimatedWeight,
        });
      }
      
      // Store analysis result
      const analysisId: any = await ctx.runMutation(api.demandPlanner.storeDemandAnalysis, {
        userId: args.userId,
        totalOrders: args.totalOrders,
        forecastPeriod: args.forecastPeriod,
        safetyStockPercent: safetyStock,
        results: demandResults,
        insights: generateInsights(demandResults, args.totalOrders, safetyStock),
      });
      
      return {
        analysisId,
        results: demandResults,
        totalPackages: demandResults.reduce((sum, r) => sum + r.finalQty, 0),
        totalCost: demandResults.reduce((sum, r) => sum + r.estimatedCost, 0),
        totalWeight: demandResults.reduce((sum, r) => sum + r.estimatedWeight, 0),
        insights: generateInsights(demandResults, args.totalOrders, safetyStock),
      };
      
    } catch (error) {
      console.error('Error in demand planning calculation:', error);
      throw new Error(error instanceof Error ? error.message : "Failed to calculate demand planning");
    }
  },
});

// Store usage record for ongoing tracking
export const storeUsageRecord = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    packageType: v.string(),
    quantityUsed: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("demandPlannerUsage", {
      userId: args.userId,
      date: args.date,
      packageType: args.packageType,
      quantityUsed: args.quantityUsed,
      createdAt: Date.now(),
    });
  },
});

// Get usage history for a user
export const getUsageHistory = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("demandPlannerUsage")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    return records.map(record => ({
      date: record.date,
      packageType: record.packageType,
      quantityUsed: record.quantityUsed,
    }));
  },
});

// Store demand analysis result
export const storeDemandAnalysis = mutation({
  args: {
    userId: v.string(),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("demandPlannerAnalyses", {
      userId: args.userId,
      totalOrders: args.totalOrders,
      forecastPeriod: args.forecastPeriod,
      safetyStockPercent: args.safetyStockPercent,
      results: args.results,
      insights: args.insights,
      createdAt: Date.now(),
    });
  },
});

// Parse usage log CSV with flexible column matching
function parseUsageLog(csvData: string): UsageRecord[] {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ''));
  
  // Flexible date column matching
  const dateIndex = headers.findIndex(h => 
    h.includes('date') || 
    h.includes('time') || 
    h.includes('day') || 
    h.includes('when') ||
    h.match(/\d{4}/) // Year pattern
  );
  
  // Flexible package type column matching
  const packageTypeIndex = headers.findIndex(h => 
    (h.includes('package') && (h.includes('type') || h.includes('kind'))) ||
    (h.includes('box') && h.includes('type')) ||
    (h.includes('container') && h.includes('type')) ||
    h.includes('packaging') ||
    h.includes('package name') ||
    h.includes('package id') ||
    h.includes('sku') ||
    h.includes('item type') ||
    h.includes('product type') ||
    h === 'type' ||
    h === 'package' ||
    h === 'container' ||
    h === 'packaging'
  );
  
  // Flexible quantity column matching
  const quantityIndex = headers.findIndex(h => 
    h.includes('quantity') ||
    h.includes('qty') ||
    h.includes('amount') ||
    h.includes('count') ||
    h.includes('used') ||
    h.includes('consumed') ||
    h.includes('volume') ||
    h.includes('units') ||
    h.includes('pieces') ||
    h.includes('number') ||
    h === 'qty' ||
    h === 'count' ||
    h === 'used' ||
    h === 'amount'
  );
  
  if (dateIndex === -1) {
    throw new Error('Usage log must contain a date column (Date, Time, Day, When, or year pattern)');
  }
  if (packageTypeIndex === -1) {
    throw new Error('Usage log must contain a package type column (Package Type, Packaging, SKU, Item Type, Type, etc.)');
  }
  if (quantityIndex === -1) {
    throw new Error('Usage log must contain a quantity column (Quantity, Qty, Amount, Count, Used, Volume, Units, etc.)');
  }
  
  console.log(`Detected columns: Date(${dateIndex}), Package Type(${packageTypeIndex}), Quantity(${quantityIndex})`);
  
  return lines.slice(1).map((line, lineIndex) => {
    const values = line.split(',');
    const record = {
      date: values[dateIndex]?.trim().replace(/"/g, '') || '',
      packageType: values[packageTypeIndex]?.trim().replace(/"/g, '') || '',
      quantityUsed: parseInt(values[quantityIndex]?.trim().replace(/[^0-9]/g, '')) || 0,
    };
    
    // Validate each record
    if (!record.date || !record.packageType || record.quantityUsed <= 0) {
      console.warn(`Skipping invalid record at line ${lineIndex + 2}: ${JSON.stringify(record)}`);
      return null;
    }
    
    return record;
  }).filter((record): record is UsageRecord => record !== null);
}

// Parse manual mix CSV with flexible column matching
function parseManualMix(csvData: string): Record<string, number> {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ''));
  
  // Flexible package type column matching
  const packageTypeIndex = headers.findIndex(h => 
    (h.includes('package') && (h.includes('type') || h.includes('kind'))) ||
    (h.includes('box') && h.includes('type')) ||
    (h.includes('container') && h.includes('type')) ||
    h.includes('packaging') ||
    h.includes('package name') ||
    h.includes('package id') ||
    h.includes('sku') ||
    h.includes('item type') ||
    h.includes('product type') ||
    h === 'type' ||
    h === 'package' ||
    h === 'container' ||
    h === 'packaging' ||
    h === 'item'
  );
  
  // Flexible percentage column matching
  const usagePercentIndex = headers.findIndex(h => 
    (h.includes('usage') && (h.includes('percent') || h.includes('pct') || h.includes('%'))) ||
    (h.includes('mix') && (h.includes('percent') || h.includes('pct') || h.includes('%'))) ||
    h.includes('percentage') ||
    h.includes('proportion') ||
    h.includes('ratio') ||
    h.includes('share') ||
    h.includes('distribution') ||
    h.includes('allocation') ||
    h === 'percent' ||
    h === 'pct' ||
    h === '%' ||
    h === 'usage' ||
    h === 'mix' ||
    h === 'share'
  );
  
  if (packageTypeIndex === -1) {
    throw new Error('Manual mix must contain a package type column (Package Type, Packaging, SKU, Item Type, Type, etc.)');
  }
  if (usagePercentIndex === -1) {
    throw new Error('Manual mix must contain a percentage column (Usage %, Mix %, Percentage, Proportion, Share, etc.)');
  }
  
  console.log(`Detected columns: Package Type(${packageTypeIndex}), Percentage(${usagePercentIndex})`);
  
  const mixData: Record<string, number> = {};
  
  lines.slice(1).forEach((line, lineIndex) => {
    const values = line.split(',');
    const packageType = values[packageTypeIndex]?.trim().replace(/"/g, '') || '';
    const percentString = values[usagePercentIndex]?.trim().replace(/["%\s]/g, '') || '0';
    const usagePercent = parseFloat(percentString) || 0;
    
    if (packageType && usagePercent > 0) {
      mixData[packageType] = usagePercent;
    } else {
      console.warn(`Skipping invalid mix record at line ${lineIndex + 2}: ${packageType}, ${usagePercent}%`);
    }
  });
  
  // Validate total doesn't exceed 100% (with tolerance)
  const total = Object.values(mixData).reduce((sum, val) => sum + val, 0);
  if (total > 105) {
    console.warn(`Total percentage is ${total}%, which exceeds 100%. This may indicate an error in the data.`);
  }
  
  return mixData;
}

// Parse packaging suite CSV with flexible column matching
function parsePackagingSuite(csvData: string): PackagingSuiteRecord[] {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ''));
  
  // Flexible package type column matching
  const packageTypeIndex = headers.findIndex(h => 
    (h.includes('package') && (h.includes('type') || h.includes('kind'))) ||
    (h.includes('box') && h.includes('type')) ||
    (h.includes('container') && h.includes('type')) ||
    h.includes('packaging') ||
    h.includes('package name') ||
    h.includes('package id') ||
    h.includes('sku') ||
    h.includes('item type') ||
    h.includes('product type') ||
    h === 'type' ||
    h === 'package' ||
    h === 'container' ||
    h === 'packaging' ||
    h === 'item'
  );
  
  // Flexible dimension column matching
  const lengthIndex = headers.findIndex(h => 
    h.includes('length') ||
    h.includes('l') ||
    h === 'len' ||
    h === 'l' ||
    (h.includes('dim') && h.includes('1')) ||
    h.includes('x dimension')
  );
  
  const widthIndex = headers.findIndex(h => 
    h.includes('width') ||
    h.includes('w') ||
    h === 'wid' ||
    h === 'w' ||
    (h.includes('dim') && h.includes('2')) ||
    h.includes('y dimension')
  );
  
  const heightIndex = headers.findIndex(h => 
    h.includes('height') ||
    h.includes('h') ||
    h === 'hgt' ||
    h === 'h' ||
    h.includes('depth') ||
    h.includes('d') ||
    (h.includes('dim') && h.includes('3')) ||
    h.includes('z dimension')
  );
  
  // Flexible optional column matching
  const volumeIndex = headers.findIndex(h => 
    h.includes('volume') ||
    h.includes('vol') ||
    h.includes('cubic') ||
    h.includes('cuin') ||
    h.includes('capacity') ||
    h.includes('internal volume') ||
    h.includes('interior volume')
  );
  
  const costIndex = headers.findIndex(h => 
    h.includes('cost') ||
    h.includes('price') ||
    h.includes('unit cost') ||
    h.includes('cost per unit') ||
    h.includes('unit price') ||
    h.includes('rate') ||
    h.includes('charge') ||
    h === 'cost' ||
    h === 'price'
  );
  
  const weightIndex = headers.findIndex(h => 
    h.includes('weight') ||
    h.includes('wgt') ||
    h.includes('mass') ||
    h.includes('unit weight') ||
    h.includes('weight per unit') ||
    h.includes('pounds') ||
    h.includes('lbs') ||
    h.includes('kg') ||
    h === 'weight' ||
    h === 'wgt'
  );
  
  if (packageTypeIndex === -1) {
    throw new Error('Packaging suite must contain a package type column (Package Type, Packaging, SKU, Item Type, etc.)');
  }
  if (lengthIndex === -1) {
    throw new Error('Packaging suite must contain a length column (Length, L, Len, X Dimension, etc.)');
  }
  if (widthIndex === -1) {
    throw new Error('Packaging suite must contain a width column (Width, W, Wid, Y Dimension, etc.)');
  }
  if (heightIndex === -1) {
    throw new Error('Packaging suite must contain a height column (Height, H, Hgt, Depth, Z Dimension, etc.)');
  }
  
  console.log(`Detected columns: Package Type(${packageTypeIndex}), Length(${lengthIndex}), Width(${widthIndex}), Height(${heightIndex}), Volume(${volumeIndex}), Cost(${costIndex}), Weight(${weightIndex})`);
  
  return lines.slice(1).map((line, lineIndex): PackagingSuiteRecord | null => {
    const values = line.split(',');
    const packageType = values[packageTypeIndex]?.trim().replace(/"/g, '') || '';
    const length = parseFloat(values[lengthIndex]?.trim().replace(/[^0-9.]/g, '')) || 0;
    const width = parseFloat(values[widthIndex]?.trim().replace(/[^0-9.]/g, '')) || 0;
    const height = parseFloat(values[heightIndex]?.trim().replace(/[^0-9.]/g, '')) || 0;
    
    // Calculate or parse volume
    const parsedVolume = volumeIndex !== -1 
      ? parseFloat(values[volumeIndex]?.trim().replace(/[^0-9.]/g, '')) || 0
      : 0;
    const calculatedVolume = length * width * height;
    const finalVolume = parsedVolume > 0 ? parsedVolume : calculatedVolume;
    
    // Parse cost (remove currency symbols)
    const costPerUnit = costIndex !== -1 
      ? parseFloat(values[costIndex]?.trim().replace(/[$,]/g, '')) || 0
      : 0;
    
    // Parse weight
    const weightPerUnit = weightIndex !== -1 
      ? parseFloat(values[weightIndex]?.trim().replace(/[^0-9.]/g, '')) || 0
      : 0;
    
    const record: PackagingSuiteRecord = {
      packageType,
      length,
      width,
      height,
      internalVolume: finalVolume > 0 ? finalVolume : undefined,
      costPerUnit: costPerUnit > 0 ? costPerUnit : undefined,
      weightPerUnit: weightPerUnit > 0 ? weightPerUnit : undefined,
    };
    
    // Validate required fields
    if (!packageType || length <= 0 || width <= 0 || height <= 0) {
      console.warn(`Skipping invalid packaging record at line ${lineIndex + 2}: ${JSON.stringify(record)}`);
      return null;
    }
    
    return record;
  }).filter((record): record is PackagingSuiteRecord => record !== null);
}

// Calculate packaging mix from usage records
function calculateMixFromUsage(usageRecords: UsageRecord[]): Record<string, number> {
  const totals: Record<string, number> = {};
  let grandTotal = 0;
  
  // Sum up usage by package type
  usageRecords.forEach(record => {
    totals[record.packageType] = (totals[record.packageType] || 0) + record.quantityUsed;
    grandTotal += record.quantityUsed;
  });
  
  // Convert to percentages
  const mixData: Record<string, number> = {};
  for (const [packageType, total] of Object.entries(totals)) {
    mixData[packageType] = (total / grandTotal) * 100;
  }
  
  return mixData;
}

// Generate AI insights
function generateInsights(results: DemandResult[], totalOrders: number, safetyStock: number): string[] {
  const insights: string[] = [];
  const totalPackages = results.reduce((sum, r) => sum + r.finalQty, 0);
  
  // Overall summary
  insights.push(`You are forecasted to use ${totalPackages.toLocaleString()} packages${safetyStock > 0 ? ` with your ${safetyStock}% safety stock buffer` : ''}.`);
  
  // Highlight dominant package type
  const dominant = results.reduce((max, current) => 
    current.usagePercent > max.usagePercent ? current : max
  );
  insights.push(`${dominant.packageType} represents ${dominant.usagePercent.toFixed(1)}% of demand — consider early bulk ordering.`);
  
  // Cost insights
  const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);
  if (totalCost > 0) {
    const mostExpensive = results.reduce((max, current) => 
      current.estimatedCost > max.estimatedCost ? current : max
    );
    insights.push(`${mostExpensive.packageType} accounts for the highest cost at $${mostExpensive.estimatedCost.toFixed(2)}.`);
  }
  
  // Usage tracking recommendation
  insights.push("Upload new usage logs monthly to keep your mix percentages accurate.");
  
  // Safety stock insight
  if (safetyStock === 0) {
    insights.push("Consider adding a safety stock buffer to prevent packaging shortages.");
  }
  
  return insights;
}