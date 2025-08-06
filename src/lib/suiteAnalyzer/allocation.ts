// Suite Analyzer - Packaging Allocation Algorithm

import { bestFitDecreasing } from '../algorithms/packingOptimizer';
import { calculateShippingCosts } from '../calculations/costAnalysis';
import { calculateCUIN, convertToInches } from '../calculations/cuin';
import type { 
  OrderHistoryItem, 
  PackagingOption, 
  PackagingAllocation,
  ProcessingProgress 
} from './types';

export interface AllocationResult {
  allocations: PackagingAllocation[];
  summary: {
    totalOrders: number;
    successfulAllocations: number;
    failedAllocations: number;
    averageFillRate: number;
    totalCostOptimized: number;
    totalCostBaseline: number;
    totalSavings: number;
  };
  metrics: {
    processingTime: number;
    averageTimePerOrder: number;
    fillRateDistribution: Record<string, number>;
    packageUtilization: Record<string, number>;
  };
}

export class PackagingAllocationEngine {
  private packagingOptions: PackagingOption[];
  private progressCallback?: (progress: ProcessingProgress) => void;

  constructor(
    packagingOptions: PackagingOption[],
    progressCallback?: (progress: ProcessingProgress) => void
  ) {
    this.packagingOptions = packagingOptions;
    this.progressCallback = progressCallback;
  }

  /**
   * Allocate optimal packaging for all orders
   */
  async allocateOptimalPackaging(orders: OrderHistoryItem[]): Promise<AllocationResult> {
    const startTime = Date.now();
    
    console.log('Starting allocation for orders:', orders.length);
    console.log('First order:', orders[0]);
    console.log('Available packaging options:', this.packagingOptions.length);
    
    try {
      this.updateProgress('optimization', 0, 0, orders.length, 'Starting packaging allocation...');

      const allocations: PackagingAllocation[] = [];
      const failedOrders: string[] = [];
      
      // Process orders in batches for better performance
      const batchSize = 100;
      const batches = this.createBatches(orders, batchSize);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchProgress = (batchIndex / batches.length) * 80; // 0-80% for processing
        
        this.updateProgress(
          'optimization',
          batchProgress,
          batchIndex * batchSize,
          orders.length,
          `Processing batch ${batchIndex + 1} of ${batches.length}...`
        );

        // Process batch
        const batchAllocations = await this.processBatch(batch);
        allocations.push(...batchAllocations.successful);
        failedOrders.push(...batchAllocations.failed);
      }

      // Calculate summary metrics
      this.updateProgress('analysis', 85, orders.length, orders.length, 'Calculating metrics...');
      const summary = this.calculateSummaryMetrics(allocations, orders.length);
      
      // Calculate processing metrics
      this.updateProgress('analysis', 95, orders.length, orders.length, 'Finalizing analysis...');
      const processingTime = Date.now() - startTime;
      const metrics = this.calculateProcessingMetrics(allocations, processingTime);

      this.updateProgress('complete', 100, orders.length, orders.length, 'Allocation complete');

      return {
        allocations,
        summary: {
          ...summary,
          failedAllocations: failedOrders.length
        },
        metrics
      };

    } catch (error) {
      throw new Error(`Failed to allocate packaging: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process a batch of orders
   */
  private async processBatch(orders: OrderHistoryItem[]): Promise<{
    successful: PackagingAllocation[];
    failed: string[];
  }> {
    const successful: PackagingAllocation[] = [];
    const failed: string[] = [];

    for (const order of orders) {
      try {
        const allocation = await this.allocatePackagingForOrder(order);
        if (allocation) {
          successful.push(allocation);
        } else {
          failed.push(order.orderId);
        }
      } catch (error) {
        console.warn(`Failed to allocate packaging for order ${order.orderId}:`, error);
        failed.push(order.orderId);
      }
    }

    return { successful, failed };
  }

  /**
   * Allocate optimal packaging for a single order
   */
  private async allocatePackagingForOrder(order: OrderHistoryItem): Promise<PackagingAllocation | null> {
    try {
      console.log('Allocating packaging for order:', order.orderId);
      
      // Convert order to packing items format
      const packingItems = this.convertOrderToPackingItems(order);
      console.log('Packing items:', packingItems);
      
      // Convert packaging options to containers format
      const containers = this.convertPackagingOptionsToContainers();
      console.log('Available containers:', containers.length);

      // Run optimization algorithm
      const optimizationResult = bestFitDecreasing(packingItems, containers);
      
      console.log('Optimization result:', {
        hasSolutions: !!optimizationResult.solutions,
        solutionsCount: optimizationResult.solutions?.length || 0,
        totalContainers: optimizationResult.totalContainers,
        totalCost: optimizationResult.totalCost
      });
      
      if (!optimizationResult.solutions || optimizationResult.solutions.length === 0) {
        console.warn('No packing solution found for order:', order.orderId);
        return null;
      }

      // Get the best solution
      const bestSolution = optimizationResult.solutions[0];
      const recommendedPackage = this.packagingOptions.find(
        pkg => pkg.packageId === bestSolution.container.id
      );

      if (!recommendedPackage) {
        return null;
      }

      // Calculate item dimensions and volume
      let itemDimensions;
      let itemVolume;
      
      if (order.totalVolume && (!order.length || !order.width || !order.height || 
          order.length === 0 || order.width === 0 || order.height === 0)) {
        // Use total volume directly
        itemVolume = order.totalVolume;
        // Estimate dimensions for display
        const cubeRoot = Math.pow(order.totalVolume / order.quantity, 1/3);
        itemDimensions = {
          length: cubeRoot,
          width: cubeRoot,
          height: cubeRoot
        };
      } else {
        // Calculate from dimensions
        itemDimensions = convertToInches({
          length: order.length,
          width: order.width,
          height: order.height,
          unit: order.unit
        });
        itemVolume = calculateCUIN(itemDimensions);
      }

      // Calculate package dimensions
      const packageDimensions = convertToInches({
        length: recommendedPackage.length,
        width: recommendedPackage.width,
        height: recommendedPackage.height,
        unit: recommendedPackage.unit
      });

      const packageVolume = calculateCUIN(packageDimensions);

      // Calculate fill rate and efficiency
      const fillRate = (itemVolume / packageVolume) * 100;
      const weightUtilization = recommendedPackage.maxWeight 
        ? ((order.weight || 1) / recommendedPackage.maxWeight) * 100 
        : 50; // Default if max weight not specified
      const efficiency = (fillRate + weightUtilization) / 2;

      // Calculate costs
      const costBreakdown = this.calculatePackagingCosts(
        order,
        recommendedPackage,
        itemDimensions,
        packageDimensions
      );

      const allocation: PackagingAllocation = {
        orderId: order.orderId,
        recommendedPackage: recommendedPackage.packageName,
        recommendedPackageId: recommendedPackage.packageId,
        itemDimensions: {
          length: itemDimensions.length,
          width: itemDimensions.width,
          height: itemDimensions.height,
          volume: itemVolume
        },
        packageDimensions: {
          length: packageDimensions.length,
          width: packageDimensions.width,
          height: packageDimensions.height,
          volume: packageVolume
        },
        fillRate: Math.round(fillRate * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        costBreakdown
      };

      return allocation;

    } catch (error) {
      console.warn(`Error allocating packaging for order ${order.orderId}:`, error);
      return null;
    }
  }

  /**
   * Convert order to packing items format
   */
  private convertOrderToPackingItems(order: OrderHistoryItem) {
    let dimensions;
    
    // Check if we have individual dimensions or just total volume
    if (order.totalVolume && (!order.length || !order.width || !order.height || 
        order.length === 0 || order.width === 0 || order.height === 0)) {
      // Use total volume to estimate dimensions
      // Create a cube-like dimension based on volume for simplicity
      const cubeRoot = Math.pow(order.totalVolume / order.quantity, 1/3);
      dimensions = {
        length: cubeRoot,
        width: cubeRoot,
        height: cubeRoot
      };
      console.log('Using total volume to estimate dimensions:', {
        orderId: order.orderId,
        totalVolume: order.totalVolume,
        quantity: order.quantity,
        estimatedDims: dimensions
      });
    } else {
      // Use provided dimensions
      dimensions = convertToInches({
        length: order.length,
        width: order.width,
        height: order.height,
        unit: order.unit
      });
    }
    
    console.log('Converting order to packing items:', {
      orderId: order.orderId,
      originalDims: { l: order.length, w: order.width, h: order.height, unit: order.unit },
      totalVolume: order.totalVolume,
      convertedDims: dimensions,
      quantity: order.quantity
    });

    return Array(order.quantity).fill(null).map((_, index) => ({
      id: `${order.orderId}_${index + 1}`,
      name: order.productName || `Item ${index + 1}`,
      dimensions,
      weight: order.weight || 1,
      quantity: 1, // Each item has quantity 1 since we're creating multiple items
      fragile: false,
      stackable: true,
      category: order.category || 'general'
    }));
  }

  /**
   * Convert packaging options to containers format
   */
  private convertPackagingOptionsToContainers() {
    return this.packagingOptions.map(pkg => {
      const dimensions = convertToInches({
        length: pkg.length,
        width: pkg.width,
        height: pkg.height,
        unit: pkg.unit
      });

      return {
        id: pkg.packageId,
        name: pkg.packageName,
        dimensions,
        maxWeight: pkg.maxWeight || 50, // Default max weight
        cost: pkg.costPerUnit,
        type: pkg.type || 'box',
        material: pkg.material || 'cardboard'
      };
    });
  }

  /**
   * Calculate packaging costs including shipping
   */
  private calculatePackagingCosts(
    order: OrderHistoryItem,
    packageOption: PackagingOption,
    itemDimensions: { length: number; width: number; height: number },
    packageDimensions: { length: number; width: number; height: number }
  ) {
    const packageCost = packageOption.costPerUnit;
    
    // Calculate shipping cost using the shipping calculation from cost analysis
    const totalWeight = (order.weight || 1) + packageOption.packageWeight;
    const zone = order.zone || 'domestic';
    const priority = order.priority || 'standard';

    const shippingResult = calculateShippingCosts(
      {
        length: packageDimensions.length,
        width: packageDimensions.width,
        height: packageDimensions.height,
        unit: 'in' as const
      },
      totalWeight,
      zone,
      priority
    );

    const shippingCost = shippingResult.totalCost;
    const totalCost = packageCost + shippingCost;

    return {
      packageCost,
      shippingCost,
      totalCost
    };
  }

  /**
   * Calculate summary metrics
   */
  private calculateSummaryMetrics(allocations: PackagingAllocation[], totalOrders: number) {
    const successfulAllocations = allocations.length;
    const averageFillRate = allocations.length > 0
      ? allocations.reduce((sum, a) => sum + a.fillRate, 0) / allocations.length
      : 0;

    const totalCostOptimized = allocations.reduce((sum, a) => sum + a.costBreakdown.totalCost, 0);
    
    // Estimate baseline cost (assuming 25% higher costs with poor optimization)
    const totalCostBaseline = totalCostOptimized * 1.25;
    const totalSavings = totalCostBaseline - totalCostOptimized;

    return {
      totalOrders,
      successfulAllocations,
      averageFillRate: Math.round(averageFillRate * 100) / 100,
      totalCostOptimized: Math.round(totalCostOptimized * 100) / 100,
      totalCostBaseline: Math.round(totalCostBaseline * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100
    };
  }

  /**
   * Calculate processing metrics
   */
  private calculateProcessingMetrics(allocations: PackagingAllocation[], processingTime: number) {
    const averageTimePerOrder = allocations.length > 0 
      ? processingTime / allocations.length 
      : 0;

    // Fill rate distribution
    const fillRateDistribution: Record<string, number> = {
      'Poor (0-50%)': 0,
      'Fair (51-70%)': 0,
      'Good (71-85%)': 0,
      'Excellent (86-100%)': 0
    };

    // Package utilization
    const packageUtilization: Record<string, number> = {};

    for (const allocation of allocations) {
      // Categorize fill rate
      if (allocation.fillRate <= 50) {
        fillRateDistribution['Poor (0-50%)']++;
      } else if (allocation.fillRate <= 70) {
        fillRateDistribution['Fair (51-70%)']++;
      } else if (allocation.fillRate <= 85) {
        fillRateDistribution['Good (71-85%)']++;
      } else {
        fillRateDistribution['Excellent (86-100%)']++;
      }

      // Count package usage
      const packageName = allocation.recommendedPackage;
      packageUtilization[packageName] = (packageUtilization[packageName] || 0) + 1;
    }

    return {
      processingTime,
      averageTimePerOrder: Math.round(averageTimePerOrder * 100) / 100,
      fillRateDistribution,
      packageUtilization
    };
  }

  /**
   * Create batches from orders array
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Update progress callback
   */
  private updateProgress(
    stage: ProcessingProgress['stage'],
    progress: number,
    currentItem: number,
    totalItems: number,
    message: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress: Math.min(100, Math.max(0, progress)),
        currentItem,
        totalItems,
        message,
        timeElapsed: Date.now(),
        estimatedTimeRemaining: 0
      });
    }
  }
}