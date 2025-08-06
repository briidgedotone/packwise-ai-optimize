/**
 * Cost Analysis Engine
 * 
 * Comprehensive cost analysis and ROI calculations for:
 * - Packaging cost optimization
 * - Shipping cost analysis
 * - Material savings calculations
 * - ROI and business impact metrics
 * - Comparative cost analysis
 */

import { calculateCUIN, calculateDimensionalWeight, type Dimensions } from './cuin';
import type { PackageType, OrderItem, PackingResult } from './packaging';
import type { PackingItem, PackingContainer, MultiOrderPackingResult } from '../algorithms/packingOptimizer';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface CostComponents {
  packaging: number;
  shipping: number;
  handling: number;
  insurance?: number;
  storage?: number;
  total: number;
}

export interface CostAnalysisResult {
  currentCosts: CostComponents;
  optimizedCosts: CostComponents;
  savings: CostSavings;
  breakdown: CostBreakdown;
  recommendations: CostRecommendation[];
  metrics: CostMetrics;
}

export interface CostSavings {
  absolute: number;
  percentage: number;
  monthly: number;
  annual: number;
  perShipment: number;
  breakdown: {
    packaging: number;
    shipping: number;
    handling: number;
    total: number;
  };
}

export interface CostBreakdown {
  byCategory: Record<string, number>;
  byPackageType: Record<string, { cost: number; volume: number; percentage: number }>;
  byShippingMethod: Record<string, { cost: number; volume: number; percentage: number }>;
  byTimeframe: Record<string, number>;
}

export interface CostRecommendation {
  type: 'packaging' | 'shipping' | 'handling' | 'process';
  priority: 'high' | 'medium' | 'low';
  impact: number;
  description: string;
  implementation: string;
  estimatedSavings: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CostMetrics {
  costPerCubicInch: number;
  costPerPound: number;
  averagePackagingCost: number;
  averageShippingCost: number;
  dimensionalWeightImpact: number;
  fillRateEfficiency: number;
  packageUtilization: number;
}

export interface ShippingRates {
  carrier: string;
  service: string;
  zones: Record<string, ZoneRates>;
  dimFactor: number;
  fuelSurcharge: number;
  baseRate: number;
}

export interface ZoneRates {
  zone: string;
  rates: WeightTier[];
}

export interface WeightTier {
  minWeight: number;
  maxWeight: number;
  rate: number;
}

export interface MaterialCosts {
  cardboard: number; // per sq ft
  bubble: number;    // per sq ft
  foam: number;      // per cu ft
  tape: number;      // per linear ft
  labels: number;    // per label
  plastic: number;   // per sq ft
}

export interface OperationalCosts {
  laborPerPackage: number;
  warehouseSpacePerDay: number;
  equipmentDepreciation: number;
  qualityControlCost: number;
  returnsHandling: number;
}

// ==========================================
// COST CALCULATION FUNCTIONS
// ==========================================

/**
 * Calculate comprehensive shipping costs with realistic zone and priority pricing
 */
export function calculateShippingCosts(
  dimensions: Dimensions,
  weight: number,
  zone: string = 'domestic',
  priority: string = 'standard',
  carrier: string = 'ups_ground'
): {
  actualWeight: number;
  dimensionalWeight: number;
  chargeableWeight: number;
  baseCost: number;
  zoneSurcharge: number;
  prioritySurcharge: number;
  fuelSurcharge: number;
  totalCost: number;
  savings?: number;
  breakdown: ShippingCostBreakdown;
} {
  const dimensionalWeight = calculateDimensionalWeight(dimensions, 139);
  const chargeableWeight = Math.max(weight, dimensionalWeight);
  
  // Enhanced rate calculation with realistic pricing
  const baseRates: Record<string, number> = {
    ups_ground: 2.25,    // More realistic base rates
    fedex_ground: 2.15,
    usps_priority: 1.85,
    ups_air: 4.50,
    dhl_express: 5.25
  };
  
  // Zone-based pricing multipliers
  const zoneMultipliers: Record<string, number> = {
    'domestic': 1.0,
    'regional': 0.85,
    'zone_2': 1.15,
    'zone_3': 1.35,
    'zone_4': 1.55,
    'zone_5': 1.75,
    'international': 2.8,
    'canada': 2.2,
    'mexico': 2.5
  };
  
  // Priority-based surcharges
  const prioritySurcharges: Record<string, number> = {
    'standard': 0,
    'express': 8.50,
    'overnight': 25.00,
    'two_day': 12.75,
    'economy': -2.50 // Discount for slower service
  };
  
  const baseRate = baseRates[carrier] || 2.25;
  const zoneMultiplier = zoneMultipliers[zone] || 1.0;
  const prioritySurcharge = prioritySurcharges[priority] || 0;
  
  const baseCost = chargeableWeight * baseRate;
  const zoneSurcharge = baseCost * (zoneMultiplier - 1);
  const fuelSurcharge = (baseCost + zoneSurcharge) * 0.145; // 14.5% fuel surcharge
  const totalCost = baseCost + zoneSurcharge + prioritySurcharge + fuelSurcharge;
  
  // Calculate potential savings with better packaging
  const potentialSavings = dimensionalWeight > weight ? 
    (dimensionalWeight - weight) * baseRate * zoneMultiplier * 1.145 : 0;
  
  const breakdown: ShippingCostBreakdown = {
    baseShipping: baseCost,
    zoneAdjustment: zoneSurcharge,
    priorityFee: prioritySurcharge,
    fuelSurcharge: fuelSurcharge,
    dimensionalWeightPenalty: dimensionalWeight > weight ? 
      (dimensionalWeight - weight) * baseRate * 0.5 : 0
  };
  
  return {
    actualWeight: weight,
    dimensionalWeight,
    chargeableWeight,
    baseCost,
    zoneSurcharge,
    prioritySurcharge,
    fuelSurcharge,
    totalCost,
    savings: potentialSavings,
    breakdown
  };
}

export interface ShippingCostBreakdown {
  baseShipping: number;
  zoneAdjustment: number;
  priorityFee: number;
  fuelSurcharge: number;
  dimensionalWeightPenalty: number;
}

/**
 * Calculate packaging material costs
 */
export function calculatePackagingCosts(
  packageType: PackageType,
  quantity: number = 1,
  materialCosts: MaterialCosts = getDefaultMaterialCosts()
): {
  baseCost: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  breakdown: Record<string, number>;
} {
  const baseCost = packageType.cost * quantity;
  
  // Calculate material requirements
  const volume = calculateCUIN(packageType.dimensions);
  const surfaceArea = calculateSurfaceArea(packageType.dimensions);
  
  const breakdown = {
    base_package: baseCost,
    cardboard: surfaceArea * 0.1 * materialCosts.cardboard, // 10% extra material
    tape: (packageType.dimensions.length + packageType.dimensions.width) * 2 * materialCosts.tape,
    labels: quantity * materialCosts.labels,
    bubble_wrap: volume * 0.2 * materialCosts.bubble / 1728, // 20% volume in bubble wrap
  };
  
  const materialCost = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0) - baseCost;
  const laborCost = quantity * 0.50; // $0.50 labor per package
  const totalCost = baseCost + materialCost + laborCost;
  
  return {
    baseCost,
    materialCost,
    laborCost,
    totalCost,
    breakdown
  };
}

/**
 * Calculate surface area for material cost estimation
 */
function calculateSurfaceArea(dimensions: Dimensions): number {
  const { length, width, height } = dimensions;
  // Convert to square feet for material calculation
  const factor = dimensions.unit === 'in' ? 1/144 : // inches to sq ft
                 dimensions.unit === 'ft' ? 1 :
                 dimensions.unit === 'cm' ? 1/929 : // cm to sq ft
                 1/92900; // mm to sq ft
  
  return 2 * (length * width + width * height + height * length) * factor;
}

/**
 * Calculate total cost of ownership for a shipment
 */
export function calculateTotalCostOfOwnership(
  items: OrderItem[],
  packaging: PackingResult[],
  shipping: any,
  operationalCosts: OperationalCosts = getDefaultOperationalCosts()
): CostComponents {
  const packagingCost = packaging.reduce((sum, pack) => sum + pack.cost, 0);
  
  const shippingCost = packaging.reduce((sum, pack) => {
    const shipCost = calculateShippingCosts(
      pack.packageType.dimensions,
      pack.actualWeight || 0
    );
    return sum + shipCost.totalCost;
  }, 0);
  
  const handlingCost = packaging.length * operationalCosts.laborPerPackage;
  const storageCost = items.reduce((sum, item) => {
    const volume = calculateCUIN(item.dimensions) * item.quantity;
    return sum + (volume / 1728) * operationalCosts.warehouseSpacePerDay;
  }, 0);
  
  return {
    packaging: packagingCost,
    shipping: shippingCost,
    handling: handlingCost,
    storage: storageCost,
    total: packagingCost + shippingCost + handlingCost + storageCost
  };
}

// ==========================================
// ROI AND ANALYSIS FUNCTIONS
// ==========================================

/**
 * Perform comprehensive cost analysis comparing current vs optimized packaging
 */
export function performCostAnalysis(
  orders: OrderItem[][],
  currentPackaging: PackingResult[],
  optimizedPackaging: MultiOrderPackingResult,
  monthlyVolume: number = 100
): CostAnalysisResult {
  // Calculate current costs
  const currentCosts = calculateCurrentCosts(orders, currentPackaging);
  
  // Calculate optimized costs
  const optimizedCosts = calculateOptimizedCosts(orders, optimizedPackaging);
  
  // Calculate savings
  const savings = calculateSavings(currentCosts, optimizedCosts, monthlyVolume);
  
  // Generate breakdown
  const breakdown = generateCostBreakdown(orders, currentPackaging, optimizedPackaging);
  
  // Generate recommendations
  const recommendations = generateCostRecommendations(currentCosts, optimizedCosts, savings);
  
  // Calculate metrics
  const metrics = calculateCostMetrics(orders, optimizedPackaging);
  
  return {
    currentCosts,
    optimizedCosts,
    savings,
    breakdown,
    recommendations,
    metrics
  };
}

/**
 * Calculate ROI for packaging optimization investment
 */
export function calculateROI(
  implementation_cost: number,
  monthly_savings: number,
  time_horizon_months: number = 24
): {
  totalSavings: number;
  netBenefit: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
} {
  const totalSavings = monthly_savings * time_horizon_months;
  const netBenefit = totalSavings - implementation_cost;
  const roi = (netBenefit / implementation_cost) * 100;
  const paybackPeriod = implementation_cost / monthly_savings;
  
  // NPV calculation (assuming 5% discount rate)
  const discountRate = 0.05 / 12; // Monthly rate
  let npv = -implementation_cost;
  for (let month = 1; month <= time_horizon_months; month++) {
    npv += monthly_savings / Math.pow(1 + discountRate, month);
  }
  
  // IRR calculation (simplified)
  const irr = calculateIRR(implementation_cost, monthly_savings, time_horizon_months);
  
  return {
    totalSavings,
    netBenefit,
    roi,
    paybackPeriod,
    npv,
    irr
  };
}

/**
 * Calculate break-even analysis
 */
export function calculateBreakEven(
  fixed_costs: number,
  variable_cost_per_unit: number,
  price_per_unit: number
): {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
} {
  const contributionMargin = price_per_unit - variable_cost_per_unit;
  const contributionMarginRatio = contributionMargin / price_per_unit;
  const breakEvenUnits = fixed_costs / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * price_per_unit;
  
  return {
    breakEvenUnits,
    breakEvenRevenue,
    contributionMargin,
    contributionMarginRatio
  };
}

/**
 * Scenario analysis for different optimization strategies
 */
export function performScenarioAnalysis(
  baseCase: CostAnalysisResult,
  scenarios: Array<{
    name: string;
    fillRateImprovement: number;
    shippingReduction: number;
    packagingReduction: number;
    implementationCost: number;
  }>
): Array<{
  scenario: string;
  monthlyImpact: number;
  annualImpact: number;
  roi: number;
  paybackMonths: number;
  riskAdjustedValue: number;
}> {
  return scenarios.map(scenario => {
    const monthlyImpact = 
      (baseCase.savings.breakdown.packaging * scenario.packagingReduction) +
      (baseCase.savings.breakdown.shipping * scenario.shippingReduction);
    
    const annualImpact = monthlyImpact * 12;
    const roi = ((annualImpact - scenario.implementationCost) / scenario.implementationCost) * 100;
    const paybackMonths = scenario.implementationCost / monthlyImpact;
    
    // Risk adjustment based on implementation complexity
    const riskFactor = scenario.implementationCost > 10000 ? 0.8 : 
                      scenario.implementationCost > 5000 ? 0.9 : 1.0;
    const riskAdjustedValue = annualImpact * riskFactor;
    
    return {
      scenario: scenario.name,
      monthlyImpact,
      annualImpact,
      roi,
      paybackMonths,
      riskAdjustedValue
    };
  });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function calculateCurrentCosts(
  orders: OrderItem[][],
  currentPackaging: PackingResult[]
): CostComponents {
  const packaging = currentPackaging.reduce((sum, pack) => sum + pack.cost, 0);
  const shipping = currentPackaging.reduce((sum, pack) => {
    const shipCost = calculateShippingCosts(
      pack.packageType.dimensions,
      pack.actualWeight || 0
    );
    return sum + shipCost.totalCost;
  }, 0);
  
  return {
    packaging,
    shipping,
    handling: currentPackaging.length * 0.5,
    total: packaging + shipping + (currentPackaging.length * 0.5)
  };
}

function calculateOptimizedCosts(
  orders: OrderItem[][],
  optimizedPackaging: MultiOrderPackingResult
): CostComponents {
  const packaging = optimizedPackaging.solutions.reduce((sum, sol) => sum + sol.totalCost, 0);
  const shipping = optimizedPackaging.solutions.reduce((sum, sol) => {
    const shipCost = calculateShippingCosts(
      sol.container.dimensions,
      sol.packedItems.reduce((weight, item) => weight + item.item.weight, 0)
    );
    return sum + shipCost.totalCost;
  }, 0);
  
  return {
    packaging,
    shipping,
    handling: optimizedPackaging.solutions.length * 0.5,
    total: packaging + shipping + (optimizedPackaging.solutions.length * 0.5)
  };
}

function calculateSavings(
  currentCosts: CostComponents,
  optimizedCosts: CostComponents,
  monthlyVolume: number
): CostSavings {
  const absolute = currentCosts.total - optimizedCosts.total;
  const percentage = (absolute / currentCosts.total) * 100;
  const monthly = absolute * monthlyVolume;
  const annual = monthly * 12;
  
  return {
    absolute,
    percentage,
    monthly,
    annual,
    perShipment: absolute,
    breakdown: {
      packaging: currentCosts.packaging - optimizedCosts.packaging,
      shipping: currentCosts.shipping - optimizedCosts.shipping,
      handling: currentCosts.handling - optimizedCosts.handling,
      total: absolute
    }
  };
}

function generateCostBreakdown(
  orders: OrderItem[][],
  currentPackaging: PackingResult[],
  optimizedPackaging: MultiOrderPackingResult
): CostBreakdown {
  return {
    byCategory: {},
    byPackageType: {},
    byShippingMethod: {},
    byTimeframe: {}
  };
}

function generateCostRecommendations(
  currentCosts: CostComponents,
  optimizedCosts: CostComponents,
  savings: CostSavings
): CostRecommendation[] {
  const recommendations: CostRecommendation[] = [];
  
  if (savings.breakdown.packaging > 0) {
    recommendations.push({
      type: 'packaging',
      priority: 'high',
      impact: savings.breakdown.packaging,
      description: 'Optimize package selection to reduce material costs',
      implementation: 'Update packaging guidelines and train staff',
      estimatedSavings: savings.breakdown.packaging * 12,
      timeframe: '2-4 weeks',
      riskLevel: 'low'
    });
  }
  
  if (savings.breakdown.shipping > 0) {
    recommendations.push({
      type: 'shipping',
      priority: 'high',
      impact: savings.breakdown.shipping,
      description: 'Reduce dimensional weight impact through better packaging',
      implementation: 'Implement right-sizing protocols',
      estimatedSavings: savings.breakdown.shipping * 12,
      timeframe: '1-2 weeks',
      riskLevel: 'low'
    });
  }
  
  return recommendations;
}

function calculateCostMetrics(
  orders: OrderItem[][],
  optimizedPackaging: MultiOrderPackingResult
): CostMetrics {
  const totalVolume = orders.flat().reduce((sum, item) => 
    sum + calculateCUIN(item.dimensions) * item.quantity, 0
  );
  
  const totalWeight = orders.flat().reduce((sum, item) => 
    sum + item.weight * item.quantity, 0
  );
  
  return {
    costPerCubicInch: optimizedPackaging.totalCost / totalVolume,
    costPerPound: optimizedPackaging.totalCost / totalWeight,
    averagePackagingCost: optimizedPackaging.totalCost / optimizedPackaging.totalContainers,
    averageShippingCost: optimizedPackaging.totalCost / optimizedPackaging.totalContainers,
    dimensionalWeightImpact: 0,
    fillRateEfficiency: optimizedPackaging.averageFillRate,
    packageUtilization: optimizedPackaging.averageFillRate
  };
}

function calculateIRR(
  initial_investment: number,
  monthly_cashflow: number,
  periods: number
): number {
  // Simplified IRR calculation
  const totalCashflows = monthly_cashflow * periods;
  if (totalCashflows <= initial_investment) return 0;
  
  // Approximate IRR using Newton's method (simplified)
  return ((totalCashflows / initial_investment) ** (1/periods) - 1) * 12 * 100;
}

function getDefaultMaterialCosts(): MaterialCosts {
  return {
    cardboard: 0.05,  // per sq ft
    bubble: 0.03,     // per sq ft
    foam: 0.08,       // per cu ft
    tape: 0.02,       // per linear ft
    labels: 0.05,     // per label
    plastic: 0.04     // per sq ft
  };
}

function getDefaultOperationalCosts(): OperationalCosts {
  return {
    laborPerPackage: 0.50,
    warehouseSpacePerDay: 0.10,
    equipmentDepreciation: 0.05,
    qualityControlCost: 0.15,
    returnsHandling: 0.25
  };
}

/**
 * Generate executive cost summary
 */
export function generateCostSummary(analysis: CostAnalysisResult): string {
  const savings = analysis.savings;
  
  return `
📊 COST ANALYSIS SUMMARY

💰 Current Monthly Costs: $${analysis.currentCosts.total.toLocaleString()}
✅ Optimized Monthly Costs: $${analysis.optimizedCosts.total.toLocaleString()}
💡 Monthly Savings: $${savings.monthly.toLocaleString()} (${savings.percentage.toFixed(1)}%)
🎯 Annual Impact: $${savings.annual.toLocaleString()}

🔍 SAVINGS BREAKDOWN:
• Packaging: $${savings.breakdown.packaging.toFixed(2)} per shipment
• Shipping: $${savings.breakdown.shipping.toFixed(2)} per shipment  
• Handling: $${savings.breakdown.handling.toFixed(2)} per shipment

📈 KEY METRICS:
• Average Fill Rate: ${analysis.metrics.fillRateEfficiency.toFixed(1)}%
• Cost per Cubic Inch: $${analysis.metrics.costPerCubicInch.toFixed(4)}
• Average Package Cost: $${analysis.metrics.averagePackagingCost.toFixed(2)}

🎯 TOP RECOMMENDATIONS:
${analysis.recommendations.slice(0, 3).map(rec => 
  `• ${rec.description} (Est. savings: $${rec.estimatedSavings.toLocaleString()}/year)`
).join('\n')}
  `;
}