// Web Worker for heavy analysis processing
// This runs in a separate thread to avoid blocking the UI

interface ParsedOrder {
  orderId: string;
  volume: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
}

interface ParsedPackage {
  packageId: string;
  packageName: string;
  length: number;
  width: number;
  height: number;
  costPerUnit: number;
  packageWeight: number;
  maxWeight?: number;
  usage?: string | null;  // Baseline usage percentage
}

interface AllocationResult {
  orderId: string;
  recommendedPackage: string;
  fillRate: number;
  efficiency: number;
  cost: number;
  orderVolume: number;
  packageVolume: number;
}

interface PackageCostBreakdown {
  packageName: string;
  baselineOrders: number;
  optimizedOrders: number;
  baselineCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  packageCost: number;
}

interface PackageMaterialBreakdown {
  packageName: string;
  baselineOrders: number;
  optimizedOrders: number;
  baselineMaterial: number; // Total weight used in baseline
  optimizedMaterial: number; // Total weight used in optimized
  materialSavings: number; // Weight saved vs baseline
  materialSavingsPercentage: number; // Percentage of material saved
  packageWeight: number; // Weight per package unit
}

interface AnalysisResults {
  allocations: AllocationResult[];
  summary: {
    totalOrders: number;
    processedOrders: number;
    averageFillRate: number;
    totalCost: number;
    baselineCost: number; // Cost using baseline package distribution
    savings: number; // Amount saved vs baseline
    savingsPercentage: number; // Percentage saved vs baseline
    totalMaterial: number; // Total material weight used in optimized
    baselineMaterial: number; // Total material weight in baseline
    materialSavings: number; // Material weight saved vs baseline
    materialSavingsPercentage: number; // Percentage of material saved
    processingTime: number;
    memoryUsed?: number;
    throughput: number; // orders per second
  };
  packageDistribution: { name: string; count: number; percentage: number; baselinePercentage?: number }[];
  packageCostBreakdown: PackageCostBreakdown[]; // Per-package cost analysis
  packageMaterialBreakdown: PackageMaterialBreakdown[]; // Per-package material analysis
  fillRateDistribution: { range: string; count: number }[];
  volumeDistribution: { range: string; count: number; percentage: number }[];
  efficiency: {
    optimalAllocations: number;
    subOptimalAllocations: number;
    unallocatedOrders: number;
  };
}

// Optimized algorithm for high-volume processing
function findBestPackage(order: ParsedOrder, packages: ParsedPackage[]): ParsedPackage | null {
  const orderVolume = order.volume;

  if (!orderVolume || orderVolume <= 0) {
    return null;
  }

  // Pre-calculate package volumes for performance (done once per chunk)
  const packagesWithVolume = packages.map(pkg => ({
    ...pkg,
    volume: pkg.length * pkg.width * pkg.height
  }));

  // Filter packages that can physically fit the order
  let candidatePackages: typeof packagesWithVolume;

  if (order.length && order.width && order.height) {
    // Use dimensional fitting for orders with actual dimensions
    candidatePackages = packagesWithVolume.filter(pkg => {
      // Quick volume check first (fastest filter)
      if (pkg.volume < orderVolume) return false;

      // Weight check (only if both weight and maxWeight are defined and > 0)
      if (pkg.maxWeight && pkg.maxWeight > 0 && order.weight > 0 && order.weight > pkg.maxWeight) return false;

      // Dimensional fitting with rotation optimization
      const orderDims = [order.length!, order.width!, order.height!].sort((a, b) => b - a);
      const packageDims = [pkg.length, pkg.width, pkg.height].sort((a, b) => b - a);

      return orderDims[0] <= packageDims[0] &&
             orderDims[1] <= packageDims[1] &&
             orderDims[2] <= packageDims[2];
    });
  } else {
    // Volume-based fitting (faster path for volume-only orders)
    candidatePackages = packagesWithVolume.filter(pkg => {
      // Volume check
      if (pkg.volume < orderVolume) return false;

      // Weight check (only if both weight and maxWeight are defined and > 0)
      if (pkg.maxWeight && pkg.maxWeight > 0 && order.weight > 0 && order.weight > pkg.maxWeight) return false;

      return true;
    });
  }

  if (candidatePackages.length === 0) {
    return null;
  }

  // Optimized efficiency calculation
  let bestPackage = candidatePackages[0];
  let bestEfficiency = (orderVolume / bestPackage.volume) / Math.max(bestPackage.costPerUnit, 0.01); // Avoid division by zero

  for (let i = 1; i < candidatePackages.length; i++) {
    const pkg = candidatePackages[i];
    const efficiency = (orderVolume / pkg.volume) / Math.max(pkg.costPerUnit, 0.01); // Avoid division by zero

    if (efficiency > bestEfficiency) {
      bestEfficiency = efficiency;
      bestPackage = pkg;
    }
  }

  return bestPackage;
}

function createAllocation(order: ParsedOrder, packageOption: ParsedPackage): AllocationResult {
  const orderVolume = order.volume;
  const packageVolume = packageOption.length * packageOption.width * packageOption.height;
  const fillRate = (orderVolume / packageVolume) * 100;
  
  // Efficiency combines fill rate and cost effectiveness
  const efficiency = fillRate / packageOption.costPerUnit;

  return {
    orderId: order.orderId,
    recommendedPackage: packageOption.packageName,
    fillRate,
    efficiency,
    cost: packageOption.costPerUnit,
    orderVolume,
    packageVolume
  };
}

function calculateDistributions(allocations: AllocationResult[]) {
  // Package distribution
  const packageCounts: Record<string, number> = {};
  allocations.forEach(alloc => {
    packageCounts[alloc.recommendedPackage] = (packageCounts[alloc.recommendedPackage] || 0) + 1;
  });
  
  const packageDistribution = Object.entries(packageCounts).map(([name, count]) => ({
    name,
    count,
    percentage: (count / allocations.length) * 100
  }));
  
  // Fill rate distribution
  const fillRanges = {
    '0-25%': 0,
    '25-50%': 0,
    '50-75%': 0,
    '75-100%': 0
  };
  
  allocations.forEach(alloc => {
    const fillRate = alloc.fillRate;
    if (fillRate < 25) fillRanges['0-25%']++;
    else if (fillRate < 50) fillRanges['25-50%']++;
    else if (fillRate < 75) fillRanges['50-75%']++;
    else fillRanges['75-100%']++;
  });
  
  const fillRateDistribution = Object.entries(fillRanges).map(([range, count]) => ({
    range,
    count
  }));
  
  return { packageDistribution, fillRateDistribution };
}

function calculateVolumeDistribution(allocations: AllocationResult[]) {
  if (allocations.length === 0) {
    return [];
  }

  // Extract all order volumes
  const volumes = allocations.map(alloc => alloc.orderVolume);

  // Calculate min and max
  const minVolume = Math.min(...volumes);
  const maxVolume = Math.max(...volumes);

  // Handle edge case where all volumes are the same
  if (minVolume === maxVolume) {
    return [{
      range: `${Math.round(minVolume)} cu in`,
      count: allocations.length,
      percentage: 100
    }];
  }

  // Calculate optimal bin count (50-100 bins based on data size)
  // More data points = more bins for better granularity
  const binCount = allocations.length < 1000 ? 50 :
                   allocations.length < 10000 ? 75 : 100;

  // Calculate bin width
  const range = maxVolume - minVolume;
  const binWidth = range / binCount;

  // Initialize bins
  const bins: { min: number; max: number; count: number }[] = [];
  for (let i = 0; i < binCount; i++) {
    bins.push({
      min: minVolume + (i * binWidth),
      max: minVolume + ((i + 1) * binWidth),
      count: 0
    });
  }

  // Count orders in each bin
  allocations.forEach(alloc => {
    const volume = alloc.orderVolume;
    // Find which bin this volume belongs to
    let binIndex = Math.floor((volume - minVolume) / binWidth);
    // Handle edge case where volume === maxVolume (would be binCount)
    if (binIndex >= binCount) binIndex = binCount - 1;
    bins[binIndex].count++;
  });

  // Format bins for display
  const volumeDistribution = bins
    .filter(bin => bin.count > 0) // Only include bins with data
    .map(bin => {
      const minRounded = Math.round(bin.min);
      const maxRounded = Math.round(bin.max);
      return {
        range: `${minRounded}-${maxRounded}`,
        count: bin.count,
        percentage: (bin.count / allocations.length) * 100
      };
    });

  return volumeDistribution;
}

// Memory-efficient processing for 1M+ orders
function processOrders(orders: ParsedOrder[], packages: ParsedPackage[]): AnalysisResults {
  const startTime = performance.now();
  const allocations: AllocationResult[] = [];

  const totalOrders = orders.length;
  let processed = 0;

  // Optimized batch size for large datasets
  const CHUNK_SIZE = 10000; // Process 10K orders at a time to manage memory
  const PROGRESS_INTERVAL = Math.max(1000, Math.floor(totalOrders / 100)); // Progress every 1K orders or 1%

  // Process orders in memory-efficient chunks
  for (let chunkStart = 0; chunkStart < totalOrders; chunkStart += CHUNK_SIZE) {
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, totalOrders);
    const chunk = orders.slice(chunkStart, chunkEnd);

    // Process current chunk
    for (let i = 0; i < chunk.length; i++) {
      const order = chunk[i];

      // Find best package for this order
      const bestPackage = findBestPackage(order, packages);

      if (bestPackage) {
        const allocation = createAllocation(order, bestPackage);
        allocations.push(allocation);
      }

      processed++;

      // Send progress update at intervals
      if (processed % PROGRESS_INTERVAL === 0 || processed === totalOrders) {
        const progress = (processed / totalOrders) * 100;
        self.postMessage({
          type: 'progress',
          data: {
            progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
            processed,
            total: totalOrders,
            currentChunk: Math.floor(chunkStart / CHUNK_SIZE) + 1,
            totalChunks: Math.ceil(totalOrders / CHUNK_SIZE)
          }
        });
      }
    }

    // Force garbage collection hint between chunks
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }
  
  const endTime = performance.now();
  const processingTime = Math.round(endTime - startTime);
  const throughput = Math.round((processed / processingTime) * 1000); // orders per second

  // Calculate summary metrics
  const totalCost = allocations.reduce((sum, alloc) => sum + alloc.cost, 0);
  const averageFillRate = allocations.length > 0
    ? allocations.reduce((sum, alloc) => sum + alloc.fillRate, 0) / allocations.length
    : 0;

  // Calculate baseline cost and per-package breakdown
  let baselineCost = 0;
  const totalOrdersProcessed = allocations.length;

  // Parse baseline usage percentages from packages
  const baselineDistribution: Record<string, number> = {};
  packages.forEach(pkg => {
    if (pkg.usage) {
      const usagePercent = parseFloat(pkg.usage.toString().replace('%', ''));
      if (!isNaN(usagePercent)) {
        baselineDistribution[pkg.packageName] = usagePercent / 100;
      }
    }
  });

  // Calculate optimized package counts from allocations
  const optimizedCounts: Record<string, number> = {};
  allocations.forEach(alloc => {
    optimizedCounts[alloc.recommendedPackage] = (optimizedCounts[alloc.recommendedPackage] || 0) + 1;
  });

  // Create per-package cost and material breakdown
  const packageCostBreakdown: PackageCostBreakdown[] = [];
  const packageMaterialBreakdown: PackageMaterialBreakdown[] = [];
  let baselineMaterial = 0;

  packages.forEach(pkg => {
    // Baseline calculations
    const baselinePercentage = baselineDistribution[pkg.packageName] || (Object.keys(baselineDistribution).length === 0 ? 1 / packages.length : 0);
    const baselineOrders = Math.round(totalOrdersProcessed * baselinePercentage);
    const packageBaselineCost = baselineOrders * pkg.costPerUnit;
    const packageBaselineMaterial = baselineOrders * pkg.packageWeight;

    // Optimized calculations
    const optimizedOrders = optimizedCounts[pkg.packageName] || 0;
    const packageOptimizedCost = optimizedOrders * pkg.costPerUnit;
    const packageOptimizedMaterial = optimizedOrders * pkg.packageWeight;

    // Cost savings calculations
    const packageSavings = packageBaselineCost - packageOptimizedCost;
    const packageSavingsPercentage = packageBaselineCost > 0 ? (packageSavings / packageBaselineCost) * 100 : 0;

    // Material savings calculations
    const packageMaterialSavings = packageBaselineMaterial - packageOptimizedMaterial;
    const packageMaterialSavingsPercentage = packageBaselineMaterial > 0 ? (packageMaterialSavings / packageBaselineMaterial) * 100 : 0;

    packageCostBreakdown.push({
      packageName: pkg.packageName,
      baselineOrders,
      optimizedOrders,
      baselineCost: packageBaselineCost,
      optimizedCost: packageOptimizedCost,
      savings: packageSavings,
      savingsPercentage: packageSavingsPercentage,
      packageCost: pkg.costPerUnit
    });

    packageMaterialBreakdown.push({
      packageName: pkg.packageName,
      baselineOrders,
      optimizedOrders,
      baselineMaterial: packageBaselineMaterial,
      optimizedMaterial: packageOptimizedMaterial,
      materialSavings: packageMaterialSavings,
      materialSavingsPercentage: packageMaterialSavingsPercentage,
      packageWeight: pkg.packageWeight
    });

    baselineCost += packageBaselineCost;
    baselineMaterial += packageBaselineMaterial;
  });

  // Calculate total cost and material savings
  const savings = baselineCost - totalCost;
  const savingsPercentage = baselineCost > 0 ? (savings / baselineCost) * 100 : 0;

  // Calculate total material usage
  const totalMaterial = allocations.reduce((sum, alloc) => {
    const pkg = packages.find(p => p.packageName === alloc.recommendedPackage);
    return sum + (pkg ? pkg.packageWeight : 0);
  }, 0);

  const materialSavings = baselineMaterial - totalMaterial;
  const materialSavingsPercentage = baselineMaterial > 0 ? (materialSavings / baselineMaterial) * 100 : 0;

  // Calculate efficiency metrics
  const optimalAllocations = allocations.filter(alloc => alloc.fillRate >= 75).length;
  const subOptimalAllocations = allocations.filter(alloc => alloc.fillRate >= 25 && alloc.fillRate < 75).length;
  const unallocatedOrders = totalOrders - allocations.length;

  // Calculate distributions with baseline comparison
  const { packageDistribution, fillRateDistribution } = calculateDistributions(allocations);
  const volumeDistribution = calculateVolumeDistribution(allocations);

  // Add baseline percentages to package distribution
  packageDistribution.forEach(dist => {
    dist.baselinePercentage = (baselineDistribution[dist.name] || 0) * 100;
  });

  // Memory usage estimation (rough)
  const memoryUsed = Math.round((
    allocations.length * 200 + // ~200 bytes per allocation
    totalOrders * 100 + // ~100 bytes per order
    packages.length * 80 // ~80 bytes per package
  ) / 1024 / 1024); // Convert to MB

  return {
    allocations,
    summary: {
      totalOrders,
      processedOrders: allocations.length,
      averageFillRate: Math.round(averageFillRate * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      baselineCost: Math.round(baselineCost * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
      totalMaterial: Math.round(totalMaterial * 1000) / 1000, // Round to 3 decimal places for weight
      baselineMaterial: Math.round(baselineMaterial * 1000) / 1000,
      materialSavings: Math.round(materialSavings * 1000) / 1000,
      materialSavingsPercentage: Math.round(materialSavingsPercentage * 100) / 100,
      processingTime,
      memoryUsed,
      throughput
    },
    packageDistribution,
    packageCostBreakdown: packageCostBreakdown.map(breakdown => ({
      ...breakdown,
      baselineCost: Math.round(breakdown.baselineCost * 100) / 100,
      optimizedCost: Math.round(breakdown.optimizedCost * 100) / 100,
      savings: Math.round(breakdown.savings * 100) / 100,
      savingsPercentage: Math.round(breakdown.savingsPercentage * 100) / 100
    })),
    packageMaterialBreakdown: packageMaterialBreakdown.map(breakdown => ({
      ...breakdown,
      baselineMaterial: Math.round(breakdown.baselineMaterial * 1000) / 1000,
      optimizedMaterial: Math.round(breakdown.optimizedMaterial * 1000) / 1000,
      materialSavings: Math.round(breakdown.materialSavings * 1000) / 1000,
      materialSavingsPercentage: Math.round(breakdown.materialSavingsPercentage * 100) / 100
    })),
    fillRateDistribution,
    volumeDistribution,
    efficiency: {
      optimalAllocations,
      subOptimalAllocations,
      unallocatedOrders
    }
  };
}

// Worker message handler with enhanced error handling
self.onmessage = function(e: MessageEvent) {
  const { orders, packages } = e.data;

  try {
    // Validate input data
    if (!Array.isArray(orders) || orders.length === 0) {
      throw new Error('Invalid or empty orders data');
    }

    if (!Array.isArray(packages) || packages.length === 0) {
      throw new Error('Invalid or empty packages data');
    }

    console.log(`Worker: Starting processing of ${orders.length.toLocaleString()} orders with ${packages.length} packages`);

    // Send initial progress
    self.postMessage({
      type: 'progress',
      data: { progress: 0, processed: 0, total: orders.length, currentChunk: 1, totalChunks: Math.ceil(orders.length / 10000) }
    });

    const results = processOrders(orders, packages);

    console.log(`Worker: Completed processing. Allocated ${results.allocations.length} orders`);

    self.postMessage({
      type: 'complete',
      data: results
    });
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({
      type: 'error',
      data: {
        message: error instanceof Error ? error.message : 'Processing failed',
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }
};

export {}; // Make this a module