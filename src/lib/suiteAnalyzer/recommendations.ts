// Suite Analyzer - Recommendations Engine

import type { 
  SuiteAnalysisResult,
  SuiteRecommendation,
  PackagingAllocation,
  BaselineComparison,
  AnalysisMetrics 
} from './types';

export interface RecommendationContext {
  allocations: PackagingAllocation[];
  baseline: BaselineComparison;
  metrics: AnalysisMetrics;
  businessContext?: {
    monthlyVolume: number;
    currentBudget: number;
    priorities: ('cost' | 'efficiency' | 'sustainability' | 'speed')[];
    constraints: string[];
  };
}

export class RecommendationsEngine {
  /**
   * Generate comprehensive recommendations based on analysis results
   */
  static generateRecommendations(context: RecommendationContext): SuiteRecommendation[] {
    const recommendations: SuiteRecommendation[] = [];

    // Generate different types of recommendations
    recommendations.push(...this.generateCostReductionRecommendations(context));
    recommendations.push(...this.generateEfficiencyRecommendations(context));
    recommendations.push(...this.generatePackageConsolidationRecommendations(context));
    recommendations.push(...this.generateOperationalRecommendations(context));
    recommendations.push(...this.generateStrategicRecommendations(context));

    // Sort by priority and impact
    return recommendations
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return b.impact.savingsAmount - a.impact.savingsAmount;
      })
      .slice(0, 8); // Return top 8 recommendations
  }

  /**
   * Generate cost reduction recommendations
   */
  private static generateCostReductionRecommendations(context: RecommendationContext): SuiteRecommendation[] {
    const recommendations: SuiteRecommendation[] = [];
    const { baseline, allocations } = context;

    // High-impact cost reduction
    if (baseline.savings.savingsPercent > 20) {
      recommendations.push({
        type: 'cost_reduction',
        priority: 'high',
        title: 'Implement Packaging Optimization System',
        description: `Achieve ${Math.round(baseline.savings.savingsPercent)}% cost reduction through algorithmic package selection and right-sizing.`,
        impact: {
          savingsAmount: baseline.savings.totalSavings,
          savingsPercent: baseline.savings.savingsPercent,
          affectedOrders: allocations.length
        },
        implementation: {
          difficulty: 'medium',
          timeframe: '2-4 weeks',
          steps: [
            'Deploy optimization algorithm to production systems',
            'Train fulfillment team on new package selection criteria',
            'Implement real-time cost monitoring dashboard',
            'Establish monthly review process for continuous improvement'
          ]
        }
      });
    }

    // Shipping cost optimization
    const shippingOptimization = this.analyzeShippingOptimization(allocations);
    if (shippingOptimization.potential > 1000) {
      recommendations.push({
        type: 'cost_reduction',
        priority: 'high',
        title: 'Optimize Dimensional Weight Impact',
        description: `Reduce shipping costs by $${Math.round(shippingOptimization.potential)} through dimensional weight optimization.`,
        impact: {
          savingsAmount: shippingOptimization.potential,
          savingsPercent: (shippingOptimization.potential / baseline.current.totalCost) * 100,
          affectedOrders: shippingOptimization.affectedOrders
        },
        implementation: {
          difficulty: 'easy',
          timeframe: '1-2 weeks',
          steps: [
            'Implement dimensional weight checking in fulfillment process',
            'Update package selection rules to minimize DIM weight penalties',
            'Train team on DIM weight thresholds',
            'Monitor shipping cost improvements'
          ]
        }
      });
    }

    return recommendations;
  }

  /**
   * Generate efficiency improvement recommendations
   */
  private static generateEfficiencyRecommendations(context: RecommendationContext): SuiteRecommendation[] {
    const recommendations: SuiteRecommendation[] = [];
    const { allocations, baseline } = context;

    // Fill rate improvement
    if (baseline.savings.fillRateImprovement > 15) {
      const lowFillRateOrders = allocations.filter(a => a.fillRate < 60).length;
      
      recommendations.push({
        type: 'efficiency_improvement',
        priority: 'medium',
        title: 'Improve Space Utilization',
        description: `Increase average fill rate by ${Math.round(baseline.savings.fillRateImprovement)}% through better package sizing.`,
        impact: {
          savingsAmount: baseline.savings.totalSavings * 0.4, // Estimate 40% of savings from efficiency
          savingsPercent: baseline.savings.fillRateImprovement,
          affectedOrders: lowFillRateOrders
        },
        implementation: {
          difficulty: 'medium',
          timeframe: '2-3 weeks',
          steps: [
            'Implement real-time fill rate monitoring',
            'Create fill rate targets for fulfillment team',
            'Develop package selection guidelines',
            'Set up automated alerts for poor utilization'
          ]
        }
      });
    }

    // Packaging standardization
    const standardizationOpportunity = this.analyzeStandardizationOpportunity(allocations);
    if (standardizationOpportunity.potential > 0) {
      recommendations.push({
        type: 'efficiency_improvement',
        priority: 'medium',
        title: 'Standardize Package Portfolio',
        description: `Reduce operational complexity by focusing on ${standardizationOpportunity.optimalCount} high-performing package sizes.`,
        impact: {
          savingsAmount: standardizationOpportunity.savings,
          savingsPercent: 5, // Estimated efficiency gain
          affectedOrders: allocations.length
        },
        implementation: {
          difficulty: 'easy',
          timeframe: '1-2 weeks',
          steps: [
            'Analyze package usage patterns',
            'Identify top-performing package sizes',
            'Phase out underutilized packages',
            'Update fulfillment procedures'
          ]
        }
      });
    }

    return recommendations;
  }

  /**
   * Generate package consolidation recommendations
   */
  private static generatePackageConsolidationRecommendations(context: RecommendationContext): SuiteRecommendation[] {
    const recommendations: SuiteRecommendation[] = [];
    const { allocations } = context;

    const consolidationAnalysis = this.analyzeConsolidationOpportunity(allocations);
    
    if (consolidationAnalysis.opportunities.length > 0) {
      const topOpportunity = consolidationAnalysis.opportunities[0];
      
      recommendations.push({
        type: 'package_consolidation',
        priority: 'medium',
        title: `Consolidate ${topOpportunity.fromPackage} Usage`,
        description: `Replace ${topOpportunity.orderCount} orders using ${topOpportunity.fromPackage} with ${topOpportunity.toPackage} for better efficiency.`,
        impact: {
          savingsAmount: topOpportunity.savingsAmount,
          savingsPercent: (topOpportunity.savingsAmount / topOpportunity.currentCost) * 100,
          affectedOrders: topOpportunity.orderCount
        },
        implementation: {
          difficulty: 'easy',
          timeframe: '1 week',
          steps: [
            `Identify orders currently using ${topOpportunity.fromPackage}`,
            `Update fulfillment rules to use ${topOpportunity.toPackage}`,
            'Train team on new package selection criteria',
            'Monitor consolidation effectiveness'
          ]
        }
      });
    }

    return recommendations;
  }

  /**
   * Generate operational recommendations
   */
  private static generateOperationalRecommendations(context: RecommendationContext): SuiteRecommendation[] {
    const recommendations: SuiteRecommendation[] = [];
    const { metrics, allocations } = context;

    // Performance optimization
    if (metrics.processing.ordersPerSecond < 50) {
      recommendations.push({
        type: 'efficiency_improvement',
        priority: 'low',
        title: 'Optimize Processing Performance',
        description: 'Improve system performance to handle larger order volumes more efficiently.',
        impact: {
          savingsAmount: 0,
          savingsPercent: 0,
          affectedOrders: 0
        },
        implementation: {
          difficulty: 'complex',
          timeframe: '3-4 weeks',
          steps: [
            'Profile current processing bottlenecks',
            'Implement batch processing optimizations',
            'Add parallel processing capabilities',
            'Monitor performance improvements'
          ]
        }
      });
    }

    // Quality control
    const qualityIssues = this.identifyQualityIssues(allocations);
    if (qualityIssues.length > 0) {
      recommendations.push({
        type: 'efficiency_improvement',
        priority: 'medium',
        title: 'Implement Quality Control Measures',
        description: `Address ${qualityIssues.length} quality issues to improve packaging consistency.`,
        impact: {
          savingsAmount: qualityIssues.length * 0.50, // Estimated cost per quality issue
          savingsPercent: 2,
          affectedOrders: qualityIssues.length
        },
        implementation: {
          difficulty: 'medium',
          timeframe: '2-3 weeks',
          steps: [
            'Establish packaging quality metrics',
            'Implement validation checks in fulfillment process',
            'Create quality control dashboard',
            'Train team on quality standards'
          ]
        }
      });
    }

    return recommendations;
  }

  /**
   * Generate strategic recommendations
   */
  private static generateStrategicRecommendations(context: RecommendationContext): SuiteRecommendation[] {
    const recommendations: SuiteRecommendation[] = [];
    const { allocations, baseline, businessContext } = context;

    // ROI analysis
    const monthlyVolume = businessContext?.monthlyVolume || allocations.length;
    const annualSavings = baseline.savings.totalSavings * (monthlyVolume / allocations.length) * 12;

    if (annualSavings > 10000) {
      recommendations.push({
        type: 'cost_reduction',
        priority: 'high',
        title: 'Develop Packaging Optimization Strategy',
        description: `Create comprehensive packaging strategy with projected annual savings of $${Math.round(annualSavings).toLocaleString()}.`,
        impact: {
          savingsAmount: annualSavings,
          savingsPercent: baseline.savings.savingsPercent,
          affectedOrders: monthlyVolume * 12
        },
        implementation: {
          difficulty: 'complex',
          timeframe: '6-8 weeks',
          steps: [
            'Develop comprehensive packaging strategy document',
            'Create implementation roadmap with milestones',
            'Establish ROI tracking and measurement framework',
            'Plan change management and training programs',
            'Set up continuous improvement processes'
          ]
        }
      });
    }

    return recommendations;
  }

  /**
   * Analyze shipping optimization opportunities
   */
  private static analyzeShippingOptimization(allocations: PackagingAllocation[]) {
    let totalShippingSavings = 0;
    let affectedOrders = 0;

    for (const allocation of allocations) {
      const shippingCost = allocation.costBreakdown.shippingCost;
      const packageCost = allocation.costBreakdown.packageCost;
      
      // Estimate potential shipping savings (DIM weight optimization)
      if (shippingCost > packageCost * 2) { // High shipping cost relative to package
        const estimatedSavings = shippingCost * 0.15; // 15% reduction potential
        totalShippingSavings += estimatedSavings;
        affectedOrders++;
      }
    }

    return {
      potential: Math.round(totalShippingSavings * 100) / 100,
      affectedOrders
    };
  }

  /**
   * Analyze standardization opportunities
   */
  private static analyzeStandardizationOpportunity(allocations: PackagingAllocation[]) {
    const packageUsage: Record<string, number> = {};
    const packageCosts: Record<string, number> = {};

    for (const allocation of allocations) {
      const packageName = allocation.recommendedPackage;
      packageUsage[packageName] = (packageUsage[packageName] || 0) + 1;
      packageCosts[packageName] = allocation.costBreakdown.packageCost;
    }

    const totalPackages = Object.keys(packageUsage).length;
    const usageArray = Object.values(packageUsage).sort((a, b) => b - a);
    
    // 80/20 rule: top 20% of packages should handle 80% of volume
    const top20Percent = Math.ceil(totalPackages * 0.2);
    const top20Volume = usageArray.slice(0, top20Percent).reduce((sum, count) => sum + count, 0);
    const totalVolume = usageArray.reduce((sum, count) => sum + count, 0);
    
    const currentRatio = (top20Volume / totalVolume) * 100;
    const optimalCount = Math.max(3, top20Percent); // At least 3 package types
    
    return {
      optimalCount,
      currentRatio,
      savings: totalPackages > optimalCount ? (totalPackages - optimalCount) * 100 : 0 // Estimated savings
    };
  }

  /**
   * Analyze consolidation opportunities
   */
  private static analyzeConsolidationOpportunity(allocations: PackagingAllocation[]) {
    const packageGroups: Record<string, PackagingAllocation[]> = {};
    
    for (const allocation of allocations) {
      const packageName = allocation.recommendedPackage;
      if (!packageGroups[packageName]) {
        packageGroups[packageName] = [];
      }
      packageGroups[packageName].push(allocation);
    }

    const opportunities: Array<{
      fromPackage: string;
      toPackage: string;
      orderCount: number;
      currentCost: number;
      newCost: number;
      savingsAmount: number;
    }> = [];

    // Look for packages with low usage that could be consolidated
    const lowUsagePackages = Object.entries(packageGroups)
      .filter(([_, orders]) => orders.length < allocations.length * 0.05) // Less than 5% usage
      .map(([packageName, orders]) => ({ packageName, orders }));

    for (const lowUsage of lowUsagePackages) {
      // Find a better alternative package
      const betterAlternative = this.findBetterAlternative(lowUsage.orders, packageGroups);
      
      if (betterAlternative) {
        const currentCost = lowUsage.orders.reduce((sum, o) => sum + o.costBreakdown.totalCost, 0);
        const estimatedNewCost = currentCost * 0.9; // 10% improvement
        
        opportunities.push({
          fromPackage: lowUsage.packageName,
          toPackage: betterAlternative,
          orderCount: lowUsage.orders.length,
          currentCost,
          newCost: estimatedNewCost,
          savingsAmount: currentCost - estimatedNewCost
        });
      }
    }

    return {
      opportunities: opportunities.sort((a, b) => b.savingsAmount - a.savingsAmount)
    };
  }

  /**
   * Find better alternative package for consolidation
   */
  private static findBetterAlternative(
    orders: PackagingAllocation[],
    packageGroups: Record<string, PackagingAllocation[]>
  ): string | null {
    const averageVolume = orders.reduce((sum, o) => sum + o.itemDimensions.volume, 0) / orders.length;
    
    // Find packages with similar volume requirements but better utilization
    for (const [packageName, packageOrders] of Object.entries(packageGroups)) {
      if (packageOrders.length < 10) continue; // Skip low-usage packages
      
      const packageAverageVolume = packageOrders.reduce((sum, o) => sum + o.itemDimensions.volume, 0) / packageOrders.length;
      const packageAverageFillRate = packageOrders.reduce((sum, o) => sum + o.fillRate, 0) / packageOrders.length;
      
      // If volume is similar but fill rate is better, this could be a good alternative
      if (Math.abs(packageAverageVolume - averageVolume) < averageVolume * 0.2 && packageAverageFillRate > 70) {
        return packageName;
      }
    }
    
    return null;
  }

  /**
   * Identify quality issues in allocations
   */
  private static identifyQualityIssues(allocations: PackagingAllocation[]): PackagingAllocation[] {
    return allocations.filter(allocation => 
      allocation.fillRate < 30 || // Very poor fill rate
      allocation.efficiency < 40 || // Poor overall efficiency
      allocation.costBreakdown.totalCost > allocation.costBreakdown.packageCost * 5 // Excessive shipping cost
    );
  }
}