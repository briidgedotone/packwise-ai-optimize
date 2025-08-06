// Suite Analyzer Type Definitions

export interface OrderHistoryItem {
  orderId: string;
  productName?: string;
  length: number;
  width: number;
  height: number;
  unit: 'in' | 'cm' | 'ft' | 'mm' | 'm';
  quantity: number;
  totalVolume?: number; // Total order volume in cubic inches when dimensions aren't available
  weight?: number;
  category?: string;
  priority?: 'standard' | 'express' | 'overnight';
  zone?: string;
}

export interface PackagingOption {
  packageName: string;
  packageId: string;
  length: number;
  width: number;
  height: number;
  unit: 'in' | 'cm' | 'ft' | 'mm' | 'm';
  costPerUnit: number;
  packageWeight: number;
  maxWeight?: number;
  material?: string;
  type: 'box' | 'envelope' | 'tube' | 'bag';
}

export interface BaselineMixItem {
  packageName: string;
  packageId: string;
  currentUsagePercent: number;
  monthlyVolume: number;
  averageCost: number;
}

export interface FallbackDimensions {
  smallest: { length: number; width: number; height: number };
  average: { length: number; width: number; height: number };
  largest: { length: number; width: number; height: number };
}

export interface PackagingAllocation {
  orderId: string;
  originalPackage?: string;
  recommendedPackage: string;
  recommendedPackageId: string;
  itemDimensions: {
    length: number;
    width: number;
    height: number;
    volume: number;
  };
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    volume: number;
  };
  fillRate: number;
  efficiency: number;
  costBreakdown: {
    packageCost: number;
    shippingCost: number;
    totalCost: number;
  };
  savings?: {
    packageSavings: number;
    shippingSavings: number;
    totalSavings: number;
  };
}

export interface BaselineComparison {
  current: {
    totalPackages: number;
    totalCost: number;
    averageFillRate: number;
    packageMix: Record<string, number>;
  };
  optimized: {
    totalPackages: number;
    totalCost: number;
    averageFillRate: number;
    packageMix: Record<string, number>;
  };
  savings: {
    totalSavings: number;
    savingsPercent: number;
    packageReduction: number;
    fillRateImprovement: number;
  };
}

export interface SuiteAnalysisResult {
  analysisId: string;
  timestamp: Date;
  summary: {
    totalOrders: number;
    processedOrders: number;
    failedOrders: number;
    totalSavings: number;
    averageFillRateImprovement: number;
  };
  allocations: PackagingAllocation[];
  baseline: BaselineComparison;
  recommendations: SuiteRecommendation[];
  metrics: AnalysisMetrics;
  packageWeights: Record<string, number>; // Store actual package weights from CSV
}

export interface SuiteRecommendation {
  type: 'package_consolidation' | 'size_optimization' | 'cost_reduction' | 'efficiency_improvement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    savingsAmount: number;
    savingsPercent: number;
    affectedOrders: number;
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'complex';
    timeframe: string;
    steps: string[];
  };
}

export interface AnalysisMetrics {
  processing: {
    totalTime: number;
    ordersPerSecond: number;
    memoryUsage: number;
  };
  optimization: {
    successRate: number;
    averageIterations: number;
    convergenceRate: number;
  };
  quality: {
    fillRateDistribution: Record<string, number>;
    costDistribution: Record<string, number>;
    efficiencyScores: number[];
  };
}

export interface SuiteAnalyzerConfig {
  // Processing options
  allowRotation: boolean;
  allowStacking: boolean;
  maxStackHeight: number;
  
  // Quality thresholds
  minimumFillRate: number;
  targetEfficiency: number;
  
  // Cost optimization
  includeShippingCosts: boolean;
  dimFactor: number;
  
  // Business rules
  fragileHandling: 'separate' | 'padded' | 'bottom_only';
  prioritizeHighValue: boolean;
  
  // Performance
  maxProcessingTime: number;
  batchSize: number;
  parallelProcessing: boolean;
}

export interface ProcessingProgress {
  stage: 'parsing' | 'validation' | 'optimization' | 'analysis' | 'complete';
  progress: number;
  currentItem: number;
  totalItems: number;
  message: string;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}