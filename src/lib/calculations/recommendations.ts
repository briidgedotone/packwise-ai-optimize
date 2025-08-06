/**
 * Smart Packaging Recommendations Engine
 * 
 * Provides intelligent, actionable recommendations for packaging optimization
 * with real business value and specific cost impact calculations
 */

import { calculateCUIN, calculateDimensionalWeight, type Dimensions } from './cuin';
import type { PackingResult, OrderItem, PackageType } from './packaging';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface RecommendationRule {
  id: string;
  condition: (result: PackingResult, item?: OrderItem) => boolean;
  message: (result: PackingResult, item?: OrderItem) => string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'cost' | 'efficiency' | 'protection' | 'sustainability' | 'compliance';
  businessImpact: 'high' | 'medium' | 'low';
  estimatedSavings?: (result: PackingResult) => number;
}

export interface SmartRecommendation {
  id: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'cost' | 'efficiency' | 'protection' | 'sustainability' | 'compliance';
  businessImpact: 'high' | 'medium' | 'low';
  estimatedSavings?: number;
  actionable: boolean;
  specificActions?: string[];
}

// ==========================================
// RECOMMENDATION RULES ENGINE
// ==========================================

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  // CRITICAL DIM WEIGHT ISSUES
  {
    id: 'dim-weight-critical',
    condition: (result) => result.dimensionalWeight > (result.actualWeight || 0) * 2.0,
    message: (result) => {
      const ratio = ((result.dimensionalWeight / (result.actualWeight || 1)) * 100).toFixed(0);
      const potentialSavings = ((result.shippingCost || 0) * 0.4).toFixed(2);
      return `🚨 CRITICAL: DIM weight is ${ratio}% of actual weight! Potential savings: $${potentialSavings} per shipment`;
    },
    priority: 'critical',
    category: 'cost',
    businessImpact: 'high',
    estimatedSavings: (result) => (result.shippingCost || 0) * 0.4
  },

  // HIGH DIM WEIGHT IMPACT
  {
    id: 'dim-weight-high',
    condition: (result) => {
      const actualWeight = result.actualWeight || 0;
      return result.dimensionalWeight > actualWeight * 1.5 && result.dimensionalWeight <= actualWeight * 2.0;
    },
    message: (result) => {
      const excess = (result.dimensionalWeight - (result.actualWeight || 0)).toFixed(1);
      const costImpact = (excess * 1.2).toFixed(2); // Assume $1.20/lb
      return `⚠️ DIM weight adds ${excess} lbs to shipping costs (~$${costImpact} extra). Consider denser packing or smaller box.`;
    },
    priority: 'high',
    category: 'cost',
    businessImpact: 'high',
    estimatedSavings: (result) => {
      const excess = result.dimensionalWeight - (result.actualWeight || 0);
      return excess > 0 ? excess * 1.2 : 0;
    }
  },

  // SPACE UTILIZATION CRITICAL
  {
    id: 'space-critical',
    condition: (result) => result.fillRate < 20,
    message: (result) => {
      const wastedSpace = 100 - result.fillRate;
      return `🚨 WASTED SPACE: ${wastedSpace.toFixed(0)}% of package is empty air! Switch to smaller packaging immediately.`;
    },
    priority: 'critical',
    category: 'efficiency',
    businessImpact: 'high',
    estimatedSavings: (result) => (result.cost * 0.3) // Estimate 30% cost reduction
  },

  // EXCELLENT OPTIMIZATION
  {
    id: 'optimization-excellent',
    condition: (result) => result.fillRate > 85 && result.dimensionalWeight <= (result.actualWeight || 0) * 1.1,
    message: () => '✅ EXCELLENT: Near-perfect packaging optimization! Space utilization and DIM weight are optimal.',
    priority: 'low',
    category: 'efficiency',
    businessImpact: 'low'
  },

  // ENVELOPE TO BOX UPGRADE NEEDED
  {
    id: 'envelope-upgrade',
    condition: (result, item) => {
      return result.packageType.category === 'envelope' && 
             (result.actualWeight || 0) > result.packageType.maxWeight * 0.9;
    },
    message: (result) => {
      const weightLimit = result.packageType.maxWeight;
      const currentWeight = result.actualWeight || 0;
      return `📦 SAFETY RISK: Item weight (${currentWeight.toFixed(1)} lbs) near envelope limit (${weightLimit} lbs). Upgrade to small box to prevent damage.`;
    },
    priority: 'high',
    category: 'protection',
    businessImpact: 'medium'
  },

  // OVERSIZED BOX WARNING
  {
    id: 'box-oversized',
    condition: (result) => {
      return result.packageType.category === 'box' && 
             result.fillRate < 25 && 
             result.dimensionalWeight > 5;
    },
    message: (result) => {
      const dimWeight = result.dimensionalWeight.toFixed(1);
      const fillRate = result.fillRate.toFixed(0);
      return `📏 OVERSIZED BOX: Only ${fillRate}% filled, adding ${dimWeight} lbs DIM weight. Check if smaller box or envelope works.`;
    },
    priority: 'high',
    category: 'cost',
    businessImpact: 'high',
    estimatedSavings: (result) => result.dimensionalWeight * 1.2 * 0.5 // Estimate 50% DIM weight reduction
  },

  // COST EFFICIENCY WARNING
  {
    id: 'cost-high',
    condition: (result) => result.cost > 3.0,
    message: (result) => {
      const cost = result.cost.toFixed(2);
      return `💸 HIGH COST: $${cost} total packaging cost detected. Review if premium packaging is necessary.`;
    },
    priority: 'medium',
    category: 'cost',
    businessImpact: 'medium'
  },

  // FRAGILE ITEM PROTECTION
  {
    id: 'fragile-protection',
    condition: (result, item) => {
      return item?.fragile && result.fillRate > 80;
    },
    message: () => '🔒 FRAGILE ALERT: High fill rate with fragile item. Ensure adequate padding and protection.',
    priority: 'high',
    category: 'protection',
    businessImpact: 'high'
  },

  // SUSTAINABILITY OPPORTUNITY
  {
    id: 'sustainability',
    condition: (result) => result.fillRate < 40 && result.packageType.category === 'box',
    message: (result) => {
      const wastedVolume = calculateCUIN(result.packageType.dimensions) * (1 - result.fillRate / 100);
      const co2Impact = (wastedVolume * 0.0001).toFixed(3); // Rough CO2 estimate
      return `♻️ SUSTAINABILITY: ${wastedVolume.toFixed(0)} cu in wasted space = ~${co2Impact} kg extra CO2. Right-size packaging.`;
    },
    priority: 'medium',
    category: 'sustainability',
    businessImpact: 'low'
  },

  // BULK SHIPPING OPPORTUNITY
  {
    id: 'bulk-opportunity',
    condition: (result, item) => {
      return (item?.quantity || 1) > 3 && result.fillRate < 60;
    },
    message: (result, item) => {
      const qty = item?.quantity || 1;
      return `📦 BULK OPPORTUNITY: ${qty} items with low fill rate. Consider multi-item packaging for better efficiency.`;
    },
    priority: 'medium',
    category: 'efficiency',
    businessImpact: 'medium'
  },

  // WEIGHT DISTRIBUTION WARNING
  {
    id: 'weight-distribution',
    condition: (result) => {
      const actualWeight = result.actualWeight || 0;
      return actualWeight > 10 && result.packageType.category !== 'box';
    },
    message: (result) => {
      const weight = result.actualWeight?.toFixed(1) || '0';
      return `⚖️ HEAVY ITEM: ${weight} lbs in non-box packaging. Consider structural integrity and handling safety.`;
    },
    priority: 'medium',
    category: 'protection',
    businessImpact: 'medium'
  }
];

// ==========================================
// SMART RECOMMENDATION GENERATOR
// ==========================================

/**
 * Generate smart, actionable recommendations for a packing result
 */
export function generateSmartRecommendations(
  result: PackingResult,
  item?: OrderItem
): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  for (const rule of RECOMMENDATION_RULES) {
    if (rule.condition(result, item)) {
      const recommendation: SmartRecommendation = {
        id: rule.id,
        message: rule.message(result, item),
        priority: rule.priority,
        category: rule.category,
        businessImpact: rule.businessImpact,
        estimatedSavings: rule.estimatedSavings ? rule.estimatedSavings(result) : undefined,
        actionable: true,
        specificActions: generateSpecificActions(rule.id, result, item)
      };

      recommendations.push(recommendation);
    }
  }

  // Sort by priority and business impact
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const impactOrder = { high: 3, medium: 2, low: 1 };
    
    const aScore = priorityOrder[a.priority] + impactOrder[a.businessImpact];
    const bScore = priorityOrder[b.priority] + impactOrder[b.businessImpact];
    
    return bScore - aScore;
  });
}

/**
 * Generate specific actionable steps for each recommendation
 */
function generateSpecificActions(
  ruleId: string,
  result: PackingResult,
  item?: OrderItem
): string[] {
  const actions: Record<string, string[]> = {
    'dim-weight-critical': [
      'Switch to smallest box that fits the item',
      'Add denser packing material to increase actual weight',
      'Consider custom packaging for this product',
      'Bundle with other items to improve weight density'
    ],
    'dim-weight-high': [
      'Try next smaller box size',
      'Use tighter packaging materials',
      'Reduce empty space with proper void fill'
    ],
    'space-critical': [
      'Measure item again to confirm dimensions',
      'Try envelope packaging if item is flexible',
      'Use smallest available box that fits',
      'Consider custom packaging for regular shipments'
    ],
    'envelope-upgrade': [
      'Switch to Small Box (6x4x2) for better protection',
      'Add extra padding if staying with envelope',
      'Consider product redesign if this is a regular issue'
    ],
    'box-oversized': [
      'Check if Medium Padded Envelope works',
      'Try next smaller box size',
      'Use void fill only where necessary',
      'Optimize product packaging design'
    ],
    'fragile-protection': [
      'Add bubble wrap or foam padding',
      'Use "Fragile" stickers and handling instructions',
      'Consider specialized fragile item packaging',
      'Reduce fill rate to allow more protection space'
    ]
  };

  return actions[ruleId] || ['Review packaging options', 'Consult packaging specialist'];
}

// ==========================================
// COST IMPACT CALCULATOR
// ==========================================

/**
 * Calculate the financial impact of packaging recommendations
 */
export function calculateRecommendationImpact(
  recommendations: SmartRecommendation[],
  monthlyVolume: number = 100
): {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  highImpactRecommendations: number;
  implementationPriority: string[];
} {
  const totalSavingsPerShipment = recommendations.reduce((sum, rec) => {
    return sum + (rec.estimatedSavings || 0);
  }, 0);

  const totalMonthlySavings = totalSavingsPerShipment * monthlyVolume;
  const totalAnnualSavings = totalMonthlySavings * 12;

  const highImpactRecommendations = recommendations.filter(
    rec => rec.businessImpact === 'high' && rec.priority !== 'low'
  ).length;

  const implementationPriority = recommendations
    .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
    .map(rec => rec.message.split(':')[0].replace(/[🚨⚠️📦💸]/g, '').trim())
    .slice(0, 3); // Top 3 priorities

  return {
    totalMonthlySavings,
    totalAnnualSavings,
    highImpactRecommendations,
    implementationPriority
  };
}

/**
 * Generate executive summary of packaging optimization opportunities
 */
export function generateExecutiveSummary(
  recommendations: SmartRecommendation[],
  monthlyVolume: number = 100
): string {
  const impact = calculateRecommendationImpact(recommendations, monthlyVolume);
  const criticalIssues = recommendations.filter(rec => rec.priority === 'critical').length;
  const highPriorityIssues = recommendations.filter(rec => rec.priority === 'high').length;

  let summary = `📊 PACKAGING OPTIMIZATION SUMMARY\n\n`;
  
  if (impact.totalAnnualSavings > 1000) {
    summary += `💰 Potential Annual Savings: $${impact.totalAnnualSavings.toLocaleString()}\n`;
  }
  
  if (criticalIssues > 0) {
    summary += `🚨 Critical Issues: ${criticalIssues} items require immediate attention\n`;
  }
  
  if (highPriorityIssues > 0) {
    summary += `⚠️ High Priority: ${highPriorityIssues} optimization opportunities\n`;
  }

  if (impact.implementationPriority.length > 0) {
    summary += `\n🎯 TOP PRIORITIES:\n`;
    impact.implementationPriority.forEach((priority, index) => {
      summary += `${index + 1}. ${priority}\n`;
    });
  }

  return summary;
}