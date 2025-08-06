/**
 * Packaging Calculations Module
 * 
 * Higher-level packaging optimization functions that use the CUIN module
 * for real-world packaging scenarios and business logic
 */

import {
  calculateCUIN,
  calculateFillRate,
  findOptimalContainer,
  calculateDimensionalWeight,
  type Dimensions,
  type VolumeResult
} from './cuin';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface PackageType {
  id: string;
  name: string;
  dimensions: Dimensions;
  cost: number;
  maxWeight: number;
  category: 'envelope' | 'box' | 'tube' | 'specialty';
}

export interface ShippingMethod {
  id: string;
  name: string;
  dimFactor: number;
  costPerLb: number;
  freeWeightThreshold?: number;
}

export interface PackingResult {
  packageType: PackageType;
  fillRate: number;
  efficiency: number;
  cost: number;
  dimensionalWeight: number;
  actualWeight?: number;
  shippingCost?: number;
  recommendations: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  dimensions: Dimensions;
  weight: number;
  quantity: number;
  fragile?: boolean;
  category?: string;
}

export interface PackingAnalysis {
  totalItems: number;
  totalVolume: number;
  totalWeight: number;
  recommendedPackages: PackingResult[];
  alternativeOptions: PackingResult[];
  savings: {
    volumeEfficiency: number;
    costSavings: number;
    dimensionalWeightSavings: number;
  };
}

// ==========================================
// STANDARD PACKAGE TYPES
// ==========================================

export const STANDARD_PACKAGES: PackageType[] = [
  // Envelopes
  {
    id: 'envelope-small',
    name: 'Small Padded Envelope',
    dimensions: { length: 6, width: 9, height: 0.5, unit: 'in' },
    cost: 0.25,
    maxWeight: 0.5,
    category: 'envelope'
  },
  {
    id: 'envelope-medium',
    name: 'Medium Padded Envelope',
    dimensions: { length: 7.25, width: 10.5, height: 0.75, unit: 'in' },
    cost: 0.35,
    maxWeight: 1,
    category: 'envelope'
  },
  {
    id: 'envelope-large',
    name: 'Large Padded Envelope',
    dimensions: { length: 9.5, width: 12.5, height: 1, unit: 'in' },
    cost: 0.45,
    maxWeight: 2,
    category: 'envelope'
  },

  // Small Boxes
  {
    id: 'box-xs',
    name: 'Extra Small Box',
    dimensions: { length: 6, width: 4, height: 2, unit: 'in' },
    cost: 0.35,
    maxWeight: 5,
    category: 'box'
  },
  {
    id: 'box-small',
    name: 'Small Box',
    dimensions: { length: 8.7, width: 5.4, height: 3.1, unit: 'in' },
    cost: 0.45,
    maxWeight: 10,
    category: 'box'
  },
  {
    id: 'box-medium',
    name: 'Medium Box',
    dimensions: { length: 16, width: 12, height: 8, unit: 'in' },
    cost: 1.85,
    maxWeight: 25,
    category: 'box'
  },
  {
    id: 'box-large',
    name: 'Large Box',
    dimensions: { length: 20, width: 16, height: 12, unit: 'in' },
    cost: 2.50,
    maxWeight: 40,
    category: 'box'
  },
  {
    id: 'box-xl',
    name: 'Extra Large Box',
    dimensions: { length: 24, width: 18, height: 15, unit: 'in' },
    cost: 3.25,
    maxWeight: 65,
    category: 'box'
  },

  // Specialty
  {
    id: 'tube-small',
    name: 'Small Tube',
    dimensions: { length: 12, width: 3, height: 3, unit: 'in' },
    cost: 0.75,
    maxWeight: 5,
    category: 'tube'
  },
  {
    id: 'tube-medium',
    name: 'Medium Tube',
    dimensions: { length: 24, width: 4, height: 4, unit: 'in' },
    cost: 1.25,
    maxWeight: 10,
    category: 'tube'
  }
];

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'ups-ground',
    name: 'UPS Ground',
    dimFactor: 139,
    costPerLb: 1.2,
    freeWeightThreshold: 1
  },
  {
    id: 'fedex-ground',
    name: 'FedEx Ground',
    dimFactor: 139,
    costPerLb: 1.15,
    freeWeightThreshold: 1
  },
  {
    id: 'usps-priority',
    name: 'USPS Priority',
    dimFactor: 166,
    costPerLb: 0.95,
  },
  {
    id: 'ups-air',
    name: 'UPS Next Day Air',
    dimFactor: 139,
    costPerLb: 3.5,
  }
];

// ==========================================
// CORE PACKING FUNCTIONS
// ==========================================

/**
 * Find the best package for a single item
 */
export function findBestPackageForItem(
  item: OrderItem,
  availablePackages: PackageType[] = STANDARD_PACKAGES,
  shippingMethod?: ShippingMethod
): PackingResult | null {
  const itemVolume = calculateCUIN(item.dimensions) * item.quantity;
  const totalWeight = item.weight * item.quantity;

  let bestResult: PackingResult | null = null;
  let bestScore = 0;

  for (const packageType of availablePackages) {
    // Check if item fits
    if (totalWeight > packageType.maxWeight) continue;

    const containerResult = findOptimalContainer(
      item.dimensions, 
      [packageType.dimensions]
    );

    if (!containerResult) continue;

    const fillRate = containerResult.fillRate;
    const dimensionalWeight = calculateDimensionalWeight(
      packageType.dimensions,
      shippingMethod?.dimFactor || 139
    );

    // Calculate shipping cost if method provided
    let shippingCost = 0;
    if (shippingMethod) {
      const chargeableWeight = Math.max(totalWeight, dimensionalWeight);
      shippingCost = chargeableWeight * shippingMethod.costPerLb;
      
      if (shippingMethod.freeWeightThreshold && chargeableWeight < shippingMethod.freeWeightThreshold) {
        shippingCost = shippingMethod.freeWeightThreshold * shippingMethod.costPerLb;
      }
    }

    const totalCost = packageType.cost + shippingCost;

    // Calculate efficiency score (higher is better)
    // Factors: fill rate (40%), cost efficiency (30%), weight efficiency (30%)
    const costEfficiency = Math.max(0, 100 - (totalCost * 10)); // Arbitrary scaling
    const weightEfficiency = totalWeight > 0 ? Math.min(100, (totalWeight / dimensionalWeight) * 100) : 50;
    const efficiency = (fillRate * 0.4) + (costEfficiency * 0.3) + (weightEfficiency * 0.3);

    const recommendations: string[] = [];
    
    // Fill Rate Recommendations
    if (fillRate < 20) {
      recommendations.push('🚨 Very low space utilization - consider a much smaller package to reduce costs');
    } else if (fillRate < 30) {
      recommendations.push('⚠️ Low efficiency - consider a smaller package to improve utilization');
    } else if (fillRate > 90) {
      recommendations.push('✅ Excellent space utilization - optimal packaging choice');
    } else if (fillRate > 75) {
      recommendations.push('👍 Good space utilization - well-optimized package size');
    }

    // Dimensional Weight vs Actual Weight Analysis
    
    if (dimensionalWeight > totalWeight * 2.0) {
      recommendations.push('🚨 DIM weight is 2x+ actual weight - significant shipping cost impact! Consider denser packing or smaller box');
    } else if (dimensionalWeight > totalWeight * 1.5) {
      recommendations.push('⚠️ DIM weight exceeds actual weight by 50%+ - consider denser packing or different package shape');
    } else if (dimensionalWeight <= totalWeight) {
      recommendations.push('💰 Actual weight drives shipping cost - DIM weight optimized');
    }

    // Cost Efficiency Recommendations
    if (totalCost > 2.0) {
      recommendations.push('💸 High total packaging cost - explore alternative package options');
    }

    // Package-Specific Recommendations
    if (packageType.category === 'envelope' && totalWeight > packageType.maxWeight * 0.8) {
      recommendations.push('📦 Near weight limit for envelope - consider upgrading to small box for safety');
    }

    if (packageType.category === 'box' && fillRate < 25) {
      recommendations.push('📏 Box significantly oversized - check if envelope or smaller box could work');
    }

    // Business Impact Recommendations
    if (dimensionalWeight > 10 && fillRate < 40) {
      recommendations.push('📊 High DIM weight + low efficiency = major cost opportunity - prioritize optimization');
    }

    const result: PackingResult = {
      packageType,
      fillRate,
      efficiency,
      cost: totalCost,
      dimensionalWeight,
      actualWeight: totalWeight,
      shippingCost,
      recommendations
    };

    if (efficiency > bestScore) {
      bestScore = efficiency;
      bestResult = result;
    }
  }

  return bestResult;
}

/**
 * Analyze packing options for multiple items
 */
export function analyzeOrderPacking(
  items: OrderItem[],
  availablePackages: PackageType[] = STANDARD_PACKAGES,
  shippingMethod?: ShippingMethod
): PackingAnalysis {
  const totalVolume = items.reduce((sum, item) => {
    return sum + (calculateCUIN(item.dimensions) * item.quantity);
  }, 0);

  const totalWeight = items.reduce((sum, item) => {
    return sum + (item.weight * item.quantity);
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get best package for each item
  const itemResults = items.map(item => ({
    item,
    result: findBestPackageForItem(item, availablePackages, shippingMethod)
  })).filter(r => r.result !== null) as Array<{ item: OrderItem; result: PackingResult }>;

  const recommendedPackages = itemResults.map(r => r.result);

  // Calculate alternative: single large package
  const alternativeOptions: PackingResult[] = [];
  
  // Try to fit everything in one large package
  const largestPackage = availablePackages
    .filter(pkg => pkg.maxWeight >= totalWeight)
    .sort((a, b) => calculateCUIN(b.dimensions) - calculateCUIN(a.dimensions))[0];

  if (largestPackage) {
    const packageVolume = calculateCUIN(largestPackage.dimensions);
    const fillRate = calculateFillRate(totalVolume, packageVolume);
    
    if (fillRate <= 100) { // Items would fit
      const dimensionalWeight = calculateDimensionalWeight(
        largestPackage.dimensions,
        shippingMethod?.dimFactor || 139
      );

      let shippingCost = 0;
      if (shippingMethod) {
        const chargeableWeight = Math.max(totalWeight, dimensionalWeight);
        shippingCost = chargeableWeight * shippingMethod.costPerLb;
      }

      const alternative: PackingResult = {
        packageType: largestPackage,
        fillRate,
        efficiency: fillRate * 0.7, // Slightly penalize for potentially poor fit
        cost: largestPackage.cost + shippingCost,
        dimensionalWeight,
        actualWeight: totalWeight,
        shippingCost,
        recommendations: ['Single package option - consider fragility and protection needs']
      };

      alternativeOptions.push(alternative);
    }
  }

  // Calculate savings
  const currentTotalCost = recommendedPackages.reduce((sum, pkg) => sum + pkg.cost, 0);
  const currentVolumeEfficiency = recommendedPackages.reduce((sum, pkg) => sum + pkg.fillRate, 0) / recommendedPackages.length;
  
  const alternativeCost = alternativeOptions.length > 0 ? alternativeOptions[0].cost : currentTotalCost;
  const costSavings = ((currentTotalCost - alternativeCost) / currentTotalCost) * 100;

  const currentDimWeight = recommendedPackages.reduce((sum, pkg) => sum + pkg.dimensionalWeight, 0);
  const alternativeDimWeight = alternativeOptions.length > 0 ? alternativeOptions[0].dimensionalWeight : currentDimWeight;
  const dimensionalWeightSavings = ((currentDimWeight - alternativeDimWeight) / currentDimWeight) * 100;

  return {
    totalItems,
    totalVolume,
    totalWeight,
    recommendedPackages,
    alternativeOptions,
    savings: {
      volumeEfficiency: currentVolumeEfficiency,
      costSavings: Math.max(0, costSavings),
      dimensionalWeightSavings: Math.max(0, dimensionalWeightSavings)
    }
  };
}

/**
 * Calculate packaging cost comparison
 */
export function comparePackagingOptions(
  items: OrderItem[],
  packageOptions: PackageType[],
  shippingMethods: ShippingMethod[]
): Array<{
  packageType: PackageType;
  shippingMethod: ShippingMethod;
  result: PackingResult;
  totalCost: number;
}> {
  const comparisons: Array<{
    packageType: PackageType;
    shippingMethod: ShippingMethod;
    result: PackingResult;
    totalCost: number;
  }> = [];

  for (const packageType of packageOptions) {
    for (const shippingMethod of shippingMethods) {
      // For simplicity, assume single package scenario
      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      
      if (totalWeight <= packageType.maxWeight) {
        const result = findBestPackageForItem(
          items[0], // Simplified for demo
          [packageType],
          shippingMethod
        );

        if (result) {
          comparisons.push({
            packageType,
            shippingMethod,
            result,
            totalCost: result.cost
          });
        }
      }
    }
  }

  return comparisons.sort((a, b) => a.totalCost - b.totalCost);
}

/**
 * Generate packaging recommendations based on order patterns
 */
export function generatePackagingRecommendations(
  items: OrderItem[],
  options?: {
    prioritizeSpeed?: boolean;
    prioritizeCost?: boolean;
    prioritizeProtection?: boolean;
    sustainabilityFocus?: boolean;
  }
): string[] {
  const recommendations: string[] = [];
  const analysis = analyzeOrderPacking(items);

  // Volume efficiency recommendations
  if (analysis.savings.volumeEfficiency < 40) {
    recommendations.push('⚠️ Low volume efficiency detected. Consider consolidating into fewer packages.');
  }

  if (analysis.savings.volumeEfficiency > 80) {
    recommendations.push('✅ Excellent volume efficiency! Current packaging is well-optimized.');
  }

  // Cost optimization recommendations
  if (analysis.savings.costSavings > 15) {
    recommendations.push(`💰 Potential cost savings of ${analysis.savings.costSavings.toFixed(1)}% available with alternative packaging.`);
  }

  // Weight optimization recommendations
  if (analysis.savings.dimensionalWeightSavings > 20) {
    recommendations.push(`📦 Dimensional weight could be reduced by ${analysis.savings.dimensionalWeightSavings.toFixed(1)}% with better packaging choices.`);
  }

  // Fragile item recommendations
  const fragileItems = items.filter(item => item.fragile);
  if (fragileItems.length > 0) {
    recommendations.push('🔒 Fragile items detected. Ensure adequate padding and protection.');
  }

  // Item-specific recommendations
  if (items.length > 5) {
    recommendations.push('📋 Large order detected. Consider batch packing for efficiency.');
  }

  // Sustainability recommendations
  if (options?.sustainabilityFocus) {
    recommendations.push('♻️ Consider recyclable packaging materials and right-sizing to reduce waste.');
  }

  return recommendations;
}

/**
 * Calculate monthly packaging optimization metrics
 */
export function calculatePackagingMetrics(
  monthlyOrders: OrderItem[][],
  currentPackaging: PackageType[],
  optimizedPackaging: PackageType[]
): {
  currentCosts: number;
  optimizedCosts: number;
  savings: number;
  volumeWaste: number;
  co2Impact: number;
} {
  let currentCosts = 0;
  let optimizedCosts = 0;
  let totalVolumeWaste = 0;

  for (const order of monthlyOrders) {
    const currentAnalysis = analyzeOrderPacking(order, currentPackaging);
    const optimizedAnalysis = analyzeOrderPacking(order, optimizedPackaging);

    currentCosts += currentAnalysis.recommendedPackages.reduce((sum, pkg) => sum + pkg.cost, 0);
    optimizedCosts += optimizedAnalysis.recommendedPackages.reduce((sum, pkg) => sum + pkg.cost, 0);

    // Calculate volume waste (unused space)
    currentAnalysis.recommendedPackages.forEach(pkg => {
      const packageVolume = calculateCUIN(pkg.packageType.dimensions);
      const usedVolume = packageVolume * (pkg.fillRate / 100);
      totalVolumeWaste += packageVolume - usedVolume;
    });
  }

  const savings = currentCosts - optimizedCosts;
  const co2Impact = totalVolumeWaste * 0.0001; // Rough estimate: 0.0001 kg CO2 per cubic inch waste

  return {
    currentCosts,
    optimizedCosts,
    savings,
    volumeWaste: totalVolumeWaste,
    co2Impact
  };
}