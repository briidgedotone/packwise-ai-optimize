/**
 * Package Optimization Calculations
 * Provides recommendations for package dimensions based on target fill rates
 */

export interface PackageStats {
  packageName: string;
  currentVolume: number;
  currentDimensions: {
    length: number;
    width: number;
    height: number;
  };
  averageFillRate: number;
  medianFillRate: number;
  orderCount: number;
  averageItemVolume: number;
  fillRateDistribution: {
    below60: number;
    between60and80: number;
    above80: number;
  };
}

export interface OptimizationRecommendation {
  packageName: string;
  currentStats: PackageStats;
  targetFillRate: number;
  recommendedVolume: number;
  volumeReduction: number;
  volumeReductionPercent: number;
  dimensionOptions: DimensionOption[];
  projectedSavings: {
    materialSavings: number; // in pounds
    costSavings: number; // in dollars
    costSavingsPercent: number; // percentage of total cost saved
    wasteReduction: number; // percentage
  };
  impactedOrders: number;
}

export interface DimensionOption {
  length: number;
  width: number;
  height: number;
  volume: number;
  aspectRatio: string; // e.g., "Cubic", "Rectangular", "Elongated"
  description: string;
}

/**
 * Calculate package statistics from order allocations
 */
export function calculatePackageStats(
  allocations: any[],
  packageName: string,
  packageDimensions: { length: number; width: number; height: number }
): PackageStats {
  const packageOrders = allocations.filter(a => a.recommendedPackage === packageName);
  
  if (packageOrders.length === 0) {
    return {
      packageName,
      currentVolume: packageDimensions.length * packageDimensions.width * packageDimensions.height,
      currentDimensions: packageDimensions,
      averageFillRate: 0,
      medianFillRate: 0,
      orderCount: 0,
      averageItemVolume: 0,
      fillRateDistribution: {
        below60: 0,
        between60and80: 0,
        above80: 0
      }
    };
  }

  const fillRates = packageOrders.map(o => o.fillRate);
  const itemVolumes = packageOrders.map(o => o.itemDimensions.volume);
  
  // Calculate average and median fill rates
  const averageFillRate = fillRates.reduce((sum, rate) => sum + rate, 0) / fillRates.length;
  const sortedRates = [...fillRates].sort((a, b) => a - b);
  const medianFillRate = sortedRates.length % 2 === 0
    ? (sortedRates[sortedRates.length / 2 - 1] + sortedRates[sortedRates.length / 2]) / 2
    : sortedRates[Math.floor(sortedRates.length / 2)];

  // Calculate average item volume
  const averageItemVolume = itemVolumes.reduce((sum, vol) => sum + vol, 0) / itemVolumes.length;

  // Calculate fill rate distribution
  const fillRateDistribution = {
    below60: fillRates.filter(r => r < 60).length,
    between60and80: fillRates.filter(r => r >= 60 && r < 80).length,
    above80: fillRates.filter(r => r >= 80).length
  };

  return {
    packageName,
    currentVolume: packageDimensions.length * packageDimensions.width * packageDimensions.height,
    currentDimensions: packageDimensions,
    averageFillRate,
    medianFillRate,
    orderCount: packageOrders.length,
    averageItemVolume,
    fillRateDistribution
  };
}

/**
 * Generate dimension options for a given volume
 */
export function generateDimensionOptions(targetVolume: number): DimensionOption[] {
  const options: DimensionOption[] = [];
  
  // Option 1: Cubic (equal dimensions)
  const cubicSide = Math.cbrt(targetVolume);
  options.push({
    length: Math.round(cubicSide * 10) / 10,
    width: Math.round(cubicSide * 10) / 10,
    height: Math.round(cubicSide * 10) / 10,
    volume: targetVolume,
    aspectRatio: "Cubic",
    description: "Equal dimensions for maximum stability"
  });

  // Option 2: Golden Ratio (aesthetically pleasing)
  const goldenRatio = 1.618;
  const height = Math.cbrt(targetVolume / (goldenRatio * goldenRatio));
  options.push({
    length: Math.round(height * goldenRatio * goldenRatio * 10) / 10,
    width: Math.round(height * goldenRatio * 10) / 10,
    height: Math.round(height * 10) / 10,
    volume: targetVolume,
    aspectRatio: "Golden Ratio",
    description: "Aesthetically pleasing proportions"
  });

  // Option 3: Standard Shipping (2:1.5:1 ratio)
  const baseHeight = Math.cbrt(targetVolume / 3);
  options.push({
    length: Math.round(baseHeight * 2 * 10) / 10,
    width: Math.round(baseHeight * 1.5 * 10) / 10,
    height: Math.round(baseHeight * 10) / 10,
    volume: targetVolume,
    aspectRatio: "Standard",
    description: "Common shipping box proportions"
  });

  // Option 4: Flat/Wide (for stackability)
  const flatHeight = Math.cbrt(targetVolume / 4);
  options.push({
    length: Math.round(flatHeight * 2 * 10) / 10,
    width: Math.round(flatHeight * 2 * 10) / 10,
    height: Math.round(flatHeight * 10) / 10,
    volume: targetVolume,
    aspectRatio: "Flat",
    description: "Low profile for easy stacking"
  });

  // Option 5: Elongated (for long items)
  const elongatedHeight = Math.cbrt(targetVolume / 6);
  options.push({
    length: Math.round(elongatedHeight * 3 * 10) / 10,
    width: Math.round(elongatedHeight * 2 * 10) / 10,
    height: Math.round(elongatedHeight * 10) / 10,
    volume: targetVolume,
    aspectRatio: "Elongated",
    description: "Ideal for long, narrow items"
  });

  return options;
}

/**
 * Calculate optimization recommendation for a package
 */
export function calculateOptimizationRecommendation(
  stats: PackageStats,
  targetFillRate: number,
  packageCost: number = 0,
  packageWeight: number = 0.5 // default weight in lbs
): OptimizationRecommendation {
  // Calculate recommended volume based on target fill rate
  const recommendedVolume = stats.averageItemVolume / (targetFillRate / 100);
  const volumeReduction = stats.currentVolume - recommendedVolume;
  const volumeReductionPercent = (volumeReduction / stats.currentVolume) * 100;

  // Generate dimension options
  const dimensionOptions = generateDimensionOptions(recommendedVolume);

  // Calculate projected savings
  const materialSavingsPercent = volumeReductionPercent; // Assuming material usage scales with volume
  const materialSavings = (packageWeight * stats.orderCount * materialSavingsPercent) / 100;
  
  // Cost savings (assuming cost scales with size reduction)
  const currentTotalCost = packageCost * stats.orderCount; // Current total cost spent
  const costSavings = packageCost > 0 
    ? (packageCost * stats.orderCount * volumeReductionPercent) / 100
    : 0;
  // Cost savings percentage = (cost saved) / (cost spent) * 100
  const costSavingsPercent = currentTotalCost > 0 ? (costSavings / currentTotalCost) * 100 : 0;
  
  // Waste reduction is the improvement in fill rate
  const wasteReduction = targetFillRate - stats.averageFillRate;

  // Count impacted orders (those below target fill rate)
  const impactedOrders = stats.fillRateDistribution.below60 + 
    (targetFillRate > 80 ? stats.fillRateDistribution.between60and80 : 0);

  return {
    packageName: stats.packageName,
    currentStats: stats,
    targetFillRate,
    recommendedVolume,
    volumeReduction,
    volumeReductionPercent,
    dimensionOptions,
    projectedSavings: {
      materialSavings,
      costSavings,
      costSavingsPercent,
      wasteReduction
    },
    impactedOrders
  };
}

/**
 * Generate recommendations for all packages
 */
export function generatePackageRecommendations(
  allocations: any[],
  packages: Array<{ name: string; dimensions: { length: number; width: number; height: number }; cost?: number; weight?: number }>,
  targetFillRate: number = 85
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];

  for (const pkg of packages) {
    const stats = calculatePackageStats(allocations, pkg.name, pkg.dimensions);
    
    // Only generate recommendations for packages with room for improvement
    if (stats.orderCount > 0 && stats.averageFillRate < targetFillRate) {
      const recommendation = calculateOptimizationRecommendation(
        stats,
        targetFillRate,
        pkg.cost || 0,
        pkg.weight || 0.5
      );
      recommendations.push(recommendation);
    }
  }

  // Sort by potential impact (most impacted orders first)
  return recommendations.sort((a, b) => b.impactedOrders - a.impactedOrders);
}

/**
 * Calculate the overall impact of implementing all recommendations
 */
export function calculateTotalImpact(recommendations: OptimizationRecommendation[]) {
  return {
    totalMaterialSavings: recommendations.reduce((sum, r) => sum + r.projectedSavings.materialSavings, 0),
    totalCostSavings: recommendations.reduce((sum, r) => sum + r.projectedSavings.costSavings, 0),
    averageWasteReduction: recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.projectedSavings.wasteReduction, 0) / recommendations.length
      : 0,
    totalImpactedOrders: recommendations.reduce((sum, r) => sum + r.impactedOrders, 0),
    packagesOptimized: recommendations.length
  };
}

/**
 * Format dimension for display
 */
export function formatDimension(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

/**
 * Format dimension option as string
 */
export function formatDimensionOption(option: DimensionOption): string {
  return `${formatDimension(option.length)}" × ${formatDimension(option.width)}" × ${formatDimension(option.height)}"`;
}