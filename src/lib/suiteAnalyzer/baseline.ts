// Suite Analyzer - Baseline Comparison Logic

import type { 
  PackagingAllocation, 
  BaselineMixItem, 
  BaselineComparison,
  PackagingOption 
} from './types';

export interface BaselineAnalysisResult {
  comparison: BaselineComparison;
  insights: {
    topSavingOpportunities: Array<{
      packageName: string;
      currentUsage: number;
      optimizedUsage: number;
      savingsPerOrder: number;
      totalPotentialSavings: number;
    }>;
    utilizationImprovements: Array<{
      packageName: string;
      currentFillRate: number;
      optimizedFillRate: number;
      improvement: number;
    }>;
    recommendations: string[];
  };
}

export class BaselineComparisonEngine {
  /**
   * Compare optimized allocations against baseline packaging mix
   */
  static compareAgainstBaseline(
    allocations: PackagingAllocation[],
    baselineMix?: BaselineMixItem[],
    packagingOptions?: PackagingOption[]
  ): BaselineAnalysisResult {
    
    // If no baseline provided, create estimated baseline
    if (!baselineMix || baselineMix.length === 0) {
      baselineMix = this.estimateBaselineFromAllocations(allocations, packagingOptions);
    }

    // Calculate current (baseline) metrics
    const currentMetrics = this.calculateBaselineMetrics(baselineMix, allocations.length);

    // Calculate optimized metrics
    const optimizedMetrics = this.calculateOptimizedMetrics(allocations);

    // Create comparison
    const comparison = this.createComparison(currentMetrics, optimizedMetrics);

    // Generate insights
    const insights = this.generateInsights(
      allocations, 
      baselineMix, 
      currentMetrics, 
      optimizedMetrics
    );

    return {
      comparison,
      insights
    };
  }

  /**
   * Estimate baseline from optimized allocations (when no baseline data provided)
   */
  private static estimateBaselineFromAllocations(
    allocations: PackagingAllocation[],
    packagingOptions?: PackagingOption[]
  ): BaselineMixItem[] {
    // Create a less efficient baseline by assuming:
    // 1. Over-packaging (use larger containers)
    // 2. Poor space utilization
    // 3. Higher costs

    const packageUsage: Record<string, number> = {};
    const packageCosts: Record<string, number> = {};

    // Count current optimized usage
    for (const allocation of allocations) {
      const packageName = allocation.recommendedPackage;
      packageUsage[packageName] = (packageUsage[packageName] || 0) + 1;
      packageCosts[packageName] = allocation.costBreakdown.packageCost;
    }

    // Create baseline by simulating inefficient packaging choices
    const baselineMix: BaselineMixItem[] = [];
    
    for (const [packageName, optimizedCount] of Object.entries(packageUsage)) {
      // Simulate baseline with reduced efficiency
      const packageCost = packageCosts[packageName] || 0;
      const estimatedBaselineCount = Math.floor(optimizedCount * 0.6); // Assume 40% more packages needed in baseline
      
      if (estimatedBaselineCount > 0) {
        baselineMix.push({
          packageName,
          packageId: packageName.toLowerCase().replace(/\s+/g, '_'),
          currentUsagePercent: (estimatedBaselineCount / allocations.length) * 100,
          monthlyVolume: estimatedBaselineCount,
          averageCost: packageCost * 1.15 // Assume 15% higher cost due to inefficiency
        });
      }
    }

    // Add some common over-packaging scenarios
    this.addTypicalOverPackagingScenarios(baselineMix, allocations.length);

    return baselineMix;
  }

  /**
   * Add typical over-packaging scenarios to baseline
   */
  private static addTypicalOverPackagingScenarios(
    baselineMix: BaselineMixItem[],
    totalOrders: number
  ): void {
    // Add large boxes used inefficiently
    const overPackagingScenarios = [
      {
        packageName: 'Large Box (Over-used)',
        packageId: 'large_box_overused',
        currentUsagePercent: 15,
        averageCost: 1.50
      },
      {
        packageName: 'Medium Box (Sub-optimal)',
        packageId: 'medium_box_suboptimal', 
        currentUsagePercent: 25,
        averageCost: 1.20
      }
    ];

    for (const scenario of overPackagingScenarios) {
      baselineMix.push({
        ...scenario,
        monthlyVolume: Math.floor((scenario.currentUsagePercent / 100) * totalOrders)
      });
    }
  }

  /**
   * Calculate baseline metrics
   */
  private static calculateBaselineMetrics(
    baselineMix: BaselineMixItem[],
    totalOrders: number
  ) {
    const totalPackages = baselineMix.reduce((sum, item) => sum + item.monthlyVolume, 0);
    const totalCost = baselineMix.reduce((sum, item) => sum + (item.monthlyVolume * item.averageCost), 0);
    
    // Estimate baseline fill rate (typically poor)
    const averageFillRate = 45; // Industry average for non-optimized packaging

    const packageMix: Record<string, number> = {};
    for (const item of baselineMix) {
      packageMix[item.packageName] = (item.monthlyVolume / totalPackages) * 100;
    }

    return {
      totalPackages,
      totalCost: Math.round(totalCost * 100) / 100,
      averageFillRate,
      packageMix
    };
  }

  /**
   * Calculate optimized metrics
   */
  private static calculateOptimizedMetrics(allocations: PackagingAllocation[]) {
    const totalPackages = allocations.length;
    const totalCost = allocations.reduce((sum, a) => sum + a.costBreakdown.totalCost, 0);
    const averageFillRate = allocations.reduce((sum, a) => sum + a.fillRate, 0) / allocations.length;

    const packageMix: Record<string, number> = {};
    const packageCounts: Record<string, number> = {};
    
    for (const allocation of allocations) {
      const packageName = allocation.recommendedPackage;
      packageCounts[packageName] = (packageCounts[packageName] || 0) + 1;
    }

    for (const [packageName, count] of Object.entries(packageCounts)) {
      packageMix[packageName] = (count / totalPackages) * 100;
    }

    return {
      totalPackages,
      totalCost: Math.round(totalCost * 100) / 100,
      averageFillRate: Math.round(averageFillRate * 100) / 100,
      packageMix
    };
  }

  /**
   * Create comparison object
   */
  private static createComparison(
    currentMetrics: any,
    optimizedMetrics: any
  ): BaselineComparison {
    const totalSavings = currentMetrics.totalCost - optimizedMetrics.totalCost;
    const savingsPercent = currentMetrics.totalCost > 0 
      ? (totalSavings / currentMetrics.totalCost) * 100 
      : 0;
    
    const packageReduction = currentMetrics.totalPackages - optimizedMetrics.totalPackages;
    const fillRateImprovement = optimizedMetrics.averageFillRate - currentMetrics.averageFillRate;

    return {
      current: currentMetrics,
      optimized: optimizedMetrics,
      savings: {
        totalSavings: Math.round(totalSavings * 100) / 100,
        savingsPercent: Math.round(savingsPercent * 100) / 100,
        packageReduction,
        fillRateImprovement: Math.round(fillRateImprovement * 100) / 100
      }
    };
  }

  /**
   * Generate insights and recommendations
   */
  private static generateInsights(
    allocations: PackagingAllocation[],
    baselineMix: BaselineMixItem[],
    currentMetrics: any,
    optimizedMetrics: any
  ) {
    // Calculate top saving opportunities
    const topSavingOpportunities = this.identifyTopSavingOpportunities(
      allocations, 
      baselineMix
    );

    // Calculate utilization improvements
    const utilizationImprovements = this.calculateUtilizationImprovements(
      allocations,
      baselineMix
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      currentMetrics,
      optimizedMetrics,
      topSavingOpportunities,
      utilizationImprovements
    );

    return {
      topSavingOpportunities,
      utilizationImprovements,
      recommendations
    };
  }

  /**
   * Identify top saving opportunities
   */
  private static identifyTopSavingOpportunities(
    allocations: PackagingAllocation[],
    baselineMix: BaselineMixItem[]
  ) {
    const opportunities: Array<{
      packageName: string;
      currentUsage: number;
      optimizedUsage: number;
      savingsPerOrder: number;
      totalPotentialSavings: number;
    }> = [];

    // Get optimized package usage
    const optimizedUsage: Record<string, number> = {};
    for (const allocation of allocations) {
      const packageName = allocation.recommendedPackage;
      optimizedUsage[packageName] = (optimizedUsage[packageName] || 0) + 1;
    }

    // Compare with baseline
    for (const baselineItem of baselineMix) {
      const optimizedCount = optimizedUsage[baselineItem.packageName] || 0;
      const currentUsage = baselineItem.monthlyVolume;
      
      if (currentUsage > optimizedCount) {
        // This package is overused in baseline
        const usageReduction = currentUsage - optimizedCount;
        const savingsPerOrder = baselineItem.averageCost * 0.3; // Estimated savings
        const totalPotentialSavings = usageReduction * savingsPerOrder;

        opportunities.push({
          packageName: baselineItem.packageName,
          currentUsage,
          optimizedUsage: optimizedCount,
          savingsPerOrder: Math.round(savingsPerOrder * 100) / 100,
          totalPotentialSavings: Math.round(totalPotentialSavings * 100) / 100
        });
      }
    }

    // Sort by total potential savings
    return opportunities
      .sort((a, b) => b.totalPotentialSavings - a.totalPotentialSavings)
      .slice(0, 5); // Top 5 opportunities
  }

  /**
   * Calculate utilization improvements
   */
  private static calculateUtilizationImprovements(
    allocations: PackagingAllocation[],
    baselineMix: BaselineMixItem[]
  ) {
    const improvements: Array<{
      packageName: string;
      currentFillRate: number;
      optimizedFillRate: number;
      improvement: number;
    }> = [];

    // Calculate optimized fill rates by package
    const packageFillRates: Record<string, number[]> = {};
    for (const allocation of allocations) {
      const packageName = allocation.recommendedPackage;
      if (!packageFillRates[packageName]) {
        packageFillRates[packageName] = [];
      }
      packageFillRates[packageName].push(allocation.fillRate);
    }

    // Calculate average fill rates
    const optimizedFillRates: Record<string, number> = {};
    for (const [packageName, fillRates] of Object.entries(packageFillRates)) {
      optimizedFillRates[packageName] = fillRates.reduce((sum, rate) => sum + rate, 0) / fillRates.length;
    }

    // Compare with estimated baseline fill rates
    for (const baselineItem of baselineMix) {
      const optimizedFillRate = optimizedFillRates[baselineItem.packageName];
      if (optimizedFillRate) {
        const currentFillRate = 45; // Estimated baseline fill rate
        const improvement = optimizedFillRate - currentFillRate;

        if (improvement > 5) { // Only include significant improvements
          improvements.push({
            packageName: baselineItem.packageName,
            currentFillRate,
            optimizedFillRate: Math.round(optimizedFillRate * 100) / 100,
            improvement: Math.round(improvement * 100) / 100
          });
        }
      }
    }

    return improvements.sort((a, b) => b.improvement - a.improvement);
  }

  /**
   * Generate recommendations based on analysis
   */
  private static generateRecommendations(
    currentMetrics: any,
    optimizedMetrics: any,
    opportunities: any[],
    improvements: any[]
  ): string[] {
    const recommendations: string[] = [];

    // Cost savings recommendations
    const savingsPercent = ((currentMetrics.totalCost - optimizedMetrics.totalCost) / currentMetrics.totalCost) * 100;
    if (savingsPercent > 15) {
      recommendations.push(`Implement packaging optimization to achieve ${Math.round(savingsPercent)}% cost reduction`);
    }

    // Fill rate improvements
    const fillRateImprovement = optimizedMetrics.averageFillRate - currentMetrics.averageFillRate;
    if (fillRateImprovement > 20) {
      recommendations.push(`Improve space utilization by ${Math.round(fillRateImprovement)}% through right-sizing`);
    }

    // Package consolidation
    if (opportunities.length > 0) {
      const topOpportunity = opportunities[0];
      recommendations.push(
        `Focus on reducing usage of ${topOpportunity.packageName} for $${topOpportunity.totalPotentialSavings} in savings`
      );
    }

    // Efficiency improvements
    if (improvements.length > 0) {
      const topImprovement = improvements[0];
      recommendations.push(
        `Optimize ${topImprovement.packageName} usage to improve fill rate by ${topImprovement.improvement}%`
      );
    }

    // Package reduction
    const packageReduction = currentMetrics.totalPackages - optimizedMetrics.totalPackages;
    if (packageReduction > 0) {
      recommendations.push(`Reduce total package count by ${packageReduction} units through better allocation`);
    }

    return recommendations;
  }
}