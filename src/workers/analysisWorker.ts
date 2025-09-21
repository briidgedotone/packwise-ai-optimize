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
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  cost: number;
  weight: number;
  maxWeight: number;
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

interface AnalysisResults {
  allocations: AllocationResult[];
  summary: {
    totalOrders: number;
    processedOrders: number;
    averageFillRate: number;
    totalCost: number;
    processingTime: number;
  };
  packageDistribution: { name: string; count: number; percentage: number }[];
  fillRateDistribution: { range: string; count: number }[];
}

// Pure math optimization algorithm
function findBestPackage(order: ParsedOrder, packages: ParsedPackage[]): ParsedPackage | null {
  const orderVolume = order.volume;
  
  if (!orderVolume || orderVolume <= 0) {
    return null;
  }
  
  // Filter packages that can physically fit the order
  let candidatePackages: ParsedPackage[];
  
  if (order.length && order.width && order.height) {
    // Use dimensional fitting for orders with actual dimensions
    candidatePackages = packages.filter(pkg => {
      // Check if order fits in package (allowing rotation)
      const orderDims = [order.length!, order.width!, order.height!].sort((a, b) => b - a);
      const packageDims = [pkg.length, pkg.width, pkg.height].sort((a, b) => b - a);
      
      const dimensionalFit = orderDims[0] <= packageDims[0] && 
                            orderDims[1] <= packageDims[1] && 
                            orderDims[2] <= packageDims[2];
      
      const weightFit = order.weight <= pkg.maxWeight;
      const volumeFit = pkg.length * pkg.width * pkg.height >= orderVolume;
      
      return dimensionalFit && weightFit && volumeFit;
    });
  } else {
    // Use volume-based fitting for orders with only volume data
    candidatePackages = packages.filter(pkg => {
      const packageVolume = pkg.length * pkg.width * pkg.height;
      const volumeFit = packageVolume >= orderVolume;
      const weightFit = order.weight <= pkg.maxWeight;
      
      return volumeFit && weightFit;
    });
  }
  
  if (candidatePackages.length === 0) {
    return null;
  }
  
  // Sort by efficiency: maximize fill rate while minimizing cost
  candidatePackages.sort((a, b) => {
    const aVolume = a.length * a.width * a.height;
    const bVolume = b.length * b.width * b.height;
    
    const aFillRate = orderVolume / aVolume;
    const bFillRate = orderVolume / bVolume;
    
    // Efficiency score: fill rate divided by cost (higher is better)
    const aEfficiency = aFillRate / a.cost;
    const bEfficiency = bFillRate / b.cost;
    
    return bEfficiency - aEfficiency; // Descending order
  });
  
  return candidatePackages[0];
}

function createAllocation(order: ParsedOrder, packageOption: ParsedPackage): AllocationResult {
  const orderVolume = order.volume;
  const packageVolume = packageOption.length * packageOption.width * packageOption.height;
  const fillRate = (orderVolume / packageVolume) * 100;
  
  // Efficiency combines fill rate and cost effectiveness
  const efficiency = fillRate / packageOption.cost;
  
  return {
    orderId: order.orderId,
    recommendedPackage: packageOption.name,
    fillRate,
    efficiency,
    cost: packageOption.cost,
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

// Main processing function
function processOrders(orders: ParsedOrder[], packages: ParsedPackage[]): AnalysisResults {
  const startTime = performance.now();
  const allocations: AllocationResult[] = [];
  
  const totalOrders = orders.length;
  let processed = 0;
  
  // Process orders in batches to provide progress updates
  const batchSize = Math.max(1, Math.floor(totalOrders / 100)); // 100 progress updates max
  
  for (let i = 0; i < totalOrders; i++) {
    const order = orders[i];
    
    // Find best package for this order
    const bestPackage = findBestPackage(order, packages);
    
    if (bestPackage) {
      const allocation = createAllocation(order, bestPackage);
      allocations.push(allocation);
    }
    
    processed++;
    
    // Send progress update every batch
    if (i % batchSize === 0 || i === totalOrders - 1) {
      const progress = (processed / totalOrders) * 100;
      self.postMessage({
        type: 'progress',
        data: { progress, processed, total: totalOrders }
      });
    }
  }
  
  const endTime = performance.now();
  const processingTime = Math.round(endTime - startTime);
  
  // Calculate summary metrics
  const totalCost = allocations.reduce((sum, alloc) => sum + alloc.cost, 0);
  const averageFillRate = allocations.length > 0 
    ? allocations.reduce((sum, alloc) => sum + alloc.fillRate, 0) / allocations.length 
    : 0;
  
  // Calculate distributions
  const { packageDistribution, fillRateDistribution } = calculateDistributions(allocations);
  
  return {
    allocations,
    summary: {
      totalOrders,
      processedOrders: allocations.length,
      averageFillRate,
      totalCost,
      processingTime
    },
    packageDistribution,
    fillRateDistribution
  };
}

// Worker message handler
self.onmessage = function(e) {
  const { orders, packages } = e.data;
  
  try {
    const results = processOrders(orders, packages);
    
    self.postMessage({
      type: 'complete',
      data: results
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: error instanceof Error ? error.message : 'Processing failed'
    });
  }
};

export {}; // Make this a module