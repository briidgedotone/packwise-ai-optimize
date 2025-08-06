/**
 * Packaging Optimization Algorithm
 * 
 * Advanced algorithms for:
 * - Best-fit container selection
 * - Multi-item packing optimization
 * - 3D bin packing solutions
 * - Fill rate maximization
 * - Cost-effective packaging decisions
 */

import { 
  calculateCUIN, 
  convertToInches, 
  type Dimensions 
} from '../calculations/cuin';

import {
  findBestPackageForItem,
  type PackageType,
  type OrderItem,
  STANDARD_PACKAGES
} from '../calculations/packaging';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface PackingItem {
  id: string;
  dimensions: Dimensions;
  weight: number;
  quantity: number;
  value?: number;
  fragile?: boolean;
  category?: string;
  stackable?: boolean;
  rotatable?: boolean;
}

export interface PackingContainer {
  id: string;
  name: string;
  dimensions: Dimensions;
  maxWeight: number;
  cost: number;
  category: string;
  volume?: number;
}

export interface PackedItem {
  item: PackingItem;
  position: Position3D;
  orientation: 'original' | 'rotated_x' | 'rotated_y' | 'rotated_z';
  level: number;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface PackingResult {
  container: PackingContainer;
  packedItems: PackedItem[];
  unpackedItems: PackingItem[];
  fillRate: number;
  weightUtilization: number;
  totalCost: number;
  efficiency: number;
  recommendations: string[];
  metadata: {
    algorithm: string;
    processingTime: number;
    iterations: number;
  };
}

export interface MultiOrderPackingResult {
  solutions: PackingResult[];
  totalCost: number;
  totalContainers: number;
  averageFillRate: number;
  unpackedItems: PackingItem[];
  savings: {
    compared_to_individual: number;
    container_reduction: number;
    cost_reduction: number;
  };
}

export interface PackingConstraints {
  maxWeight?: number;
  maxDimensions?: Dimensions;
  allowRotation?: boolean;
  allowStacking?: boolean;
  fragileHandling?: 'bottom_only' | 'separate' | 'padded';
  categorySegregation?: boolean;
  minimumFillRate?: number;
  preferredContainers?: string[];
}

// ==========================================
// CORE ALGORITHMS
// ==========================================

/**
 * Best Fit Decreasing (BFD) Algorithm
 * Optimized for packaging - sorts by volume and tries best containers first
 */
export function bestFitDecreasing(
  items: PackingItem[],
  containers: PackingContainer[],
  constraints: PackingConstraints = {}
): MultiOrderPackingResult {
  const startTime = Date.now();
  
  console.log('bestFitDecreasing called with:', {
    itemsCount: items.length,
    containersCount: containers.length,
    firstItem: items[0],
    firstContainer: containers[0]
  });
  
  // Sort items by volume (largest first)
  const sortedItems = [...items].sort((a, b) => {
    const volumeA = calculateCUIN(a.dimensions) * a.quantity;
    const volumeB = calculateCUIN(b.dimensions) * b.quantity;
    return volumeB - volumeA;
  });
  
  // Sort containers by efficiency (volume/cost ratio)
  const sortedContainers = [...containers].sort((a, b) => {
    const efficiencyA = calculateCUIN(a.dimensions) / a.cost;
    const efficiencyB = calculateCUIN(b.dimensions) / b.cost;
    return efficiencyB - efficiencyA;
  });
  
  const solutions: PackingResult[] = [];
  const unpackedItems: PackingItem[] = [];
  let remainingItems = [...sortedItems];
  
  while (remainingItems.length > 0) {
    let bestSolution: PackingResult | null = null;
    let bestScore = 0;
    
    // Try each container type
    for (const container of sortedContainers) {
      const solution = packItemsInContainer(remainingItems, container, constraints);
      
      if (solution.packedItems.length > 0) {
        // Score = fill rate + weight utilization + packed items count
        const score = solution.fillRate + solution.weightUtilization + 
                     (solution.packedItems.length * 10);
        
        if (score > bestScore) {
          bestScore = score;
          bestSolution = solution;
        }
      }
    }
    
    if (bestSolution && bestSolution.packedItems.length > 0) {
      solutions.push(bestSolution);
      
      // Remove packed items from remaining items
      const packedItemIds = new Set(bestSolution.packedItems.map(p => p.item.id));
      remainingItems = remainingItems.filter(item => !packedItemIds.has(item.id));
    } else {
      // Can't pack any more items
      unpackedItems.push(...remainingItems);
      break;
    }
  }
  
  // Calculate savings compared to individual packing
  const individualCost = calculateIndividualPackingCost(items, containers);
  const totalCost = solutions.reduce((sum, sol) => sum + sol.totalCost, 0);
  const costReduction = ((individualCost - totalCost) / individualCost) * 100;
  
  return {
    solutions,
    totalCost,
    totalContainers: solutions.length,
    averageFillRate: solutions.reduce((sum, sol) => sum + sol.fillRate, 0) / solutions.length,
    unpackedItems,
    savings: {
      compared_to_individual: costReduction,
      container_reduction: items.length - solutions.length,
      cost_reduction: costReduction
    }
  };
}

/**
 * Pack items into a single container using 3D bin packing
 */
function packItemsInContainer(
  items: PackingItem[],
  container: PackingContainer,
  constraints: PackingConstraints
): PackingResult {
  const startTime = Date.now();
  const packedItems: PackedItem[] = [];
  const containerInches = convertToInches(container.dimensions);
  
  console.log('packItemsInContainer called:', {
    itemsCount: items.length,
    containerName: container.name,
    containerDimensions: containerInches,
    firstItem: items[0] ? {
      id: items[0].id,
      dimensions: convertToInches(items[0].dimensions),
      weight: items[0].weight,
      quantity: items[0].quantity
    } : null,
    constraints
  });
  
  // Debug: Check if any item can theoretically fit
  if (items.length > 0) {
    const firstItemInches = convertToInches(items[0].dimensions);
    console.log('First item vs container:', {
      item: firstItemInches,
      container: containerInches,
      canFit: canItemFitInContainer(firstItemInches, containerInches),
      maxItemDim: Math.max(firstItemInches.length, firstItemInches.width, firstItemInches.height),
      maxContainerDim: Math.max(containerInches.length, containerInches.width, containerInches.height)
    });
  }
  
  // Available space tracking
  const availableSpaces: AvailableSpace[] = [{
    x: 0,
    y: 0,
    z: 0,
    width: containerInches.length,  // Fixed: container length maps to space width
    height: containerInches.height,
    depth: containerInches.width    // Fixed: container width maps to space depth
  }];
  
  let totalWeight = 0;
  let currentLevel = 0;
  
  // Try to pack each item with enhanced constraint checking
  for (const item of items) {
    // Enhanced weight constraint checking
    const itemTotalWeight = item.weight * item.quantity;
    if (totalWeight + itemTotalWeight > container.maxWeight) {
      continue; // Skip if weight limit exceeded
    }
    
    const itemInches = convertToInches(item.dimensions);
    
    // Pre-check if item can physically fit in container (any orientation)
    const maxItemDim = Math.max(itemInches.length, itemInches.width, itemInches.height);
    const maxContainerDim = Math.max(containerInches.length, containerInches.width, containerInches.height);
    
    if (maxItemDim > maxContainerDim) {
      continue; // Item is fundamentally too large for this container
    }
    
    let packed = false;
    
    // Try different orientations if rotation allowed
    const orientations = getItemOrientations(itemInches, constraints.allowRotation);
    
    for (const orientation of orientations) {
      // Enhanced dimensional fit checking
      if (!canItemFitInContainer(orientation.dimensions, containerInches)) {
        continue; // Skip orientation that doesn't fit
      }
      
      const position = findBestPosition(orientation.dimensions, availableSpaces, constraints);
      
      if (position) {
        // Pack the item
        const packedItem: PackedItem = {
          item,
          position: position.position,
          orientation: orientation.name,
          level: currentLevel
        };
        
        packedItems.push(packedItem);
        totalWeight += itemTotalWeight;
        
        // Update available spaces
        updateAvailableSpaces(availableSpaces, position.position, orientation.dimensions);
        
        packed = true;
        break;
      }
    }
    
    if (!packed && constraints.allowStacking !== false) {
      // Try next level
      currentLevel++;
      // Implementation for stacking logic would go here
    }
  }
  
  // Calculate metrics
  const containerVolume = calculateCUIN(container.dimensions);
  const packedVolume = packedItems.reduce((sum, packed) => {
    return sum + (calculateCUIN(packed.item.dimensions) * packed.item.quantity);
  }, 0);
  
  const fillRate = (packedVolume / containerVolume) * 100;
  const weightUtilization = (totalWeight / container.maxWeight) * 100;
  const efficiency = (fillRate + weightUtilization) / 2;
  
  // Generate recommendations
  const recommendations = generatePackingRecommendations(
    packedItems, 
    items.length - packedItems.length, 
    fillRate, 
    weightUtilization
  );
  
  return {
    container,
    packedItems,
    unpackedItems: items.filter(item => 
      !packedItems.some(packed => packed.item.id === item.id)
    ),
    fillRate,
    weightUtilization,
    totalCost: container.cost,
    efficiency,
    recommendations,
    metadata: {
      algorithm: 'best-fit-decreasing',
      processingTime: Date.now() - startTime,
      iterations: items.length
    }
  };
}

// ==========================================
// 3D SPACE MANAGEMENT
// ==========================================

interface AvailableSpace {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

interface ItemOrientation {
  name: 'original' | 'rotated_x' | 'rotated_y' | 'rotated_z';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

interface PositionResult {
  position: Position3D;
  space: AvailableSpace;
}

/**
 * Get all possible orientations for an item
 */
function getItemOrientations(
  itemDimensions: { length: number; width: number; height: number },
  allowRotation: boolean = true
): ItemOrientation[] {
  const orientations: ItemOrientation[] = [
    {
      name: 'original',
      dimensions: itemDimensions
    }
  ];
  
  if (allowRotation) {
    // Rotate around different axes
    orientations.push(
      {
        name: 'rotated_x',
        dimensions: {
          length: itemDimensions.length,
          width: itemDimensions.height,
          height: itemDimensions.width
        }
      },
      {
        name: 'rotated_y',
        dimensions: {
          length: itemDimensions.height,
          width: itemDimensions.width,
          height: itemDimensions.length
        }
      },
      {
        name: 'rotated_z',
        dimensions: {
          length: itemDimensions.width,
          width: itemDimensions.length,
          height: itemDimensions.height
        }
      }
    );
  }
  
  return orientations;
}

/**
 * Find the best position for an item in available spaces
 */
/**
 * Enhanced item fit checking for container
 */
function canItemFitInContainer(
  itemDimensions: { length: number; width: number; height: number },
  containerDimensions: { length: number; width: number; height: number }
): boolean {
  // Check if item can fit in any orientation (allowing rotation)
  const itemDims = [itemDimensions.length, itemDimensions.width, itemDimensions.height];
  const containerDims = [containerDimensions.length, containerDimensions.width, containerDimensions.height];
  
  // Sort dimensions to check if largest item dimension fits in largest container dimension
  itemDims.sort((a, b) => b - a);
  containerDims.sort((a, b) => b - a);
  
  const canFit = itemDims[0] <= containerDims[0] &&
                 itemDims[1] <= containerDims[1] &&
                 itemDims[2] <= containerDims[2];
  
  if (!canFit) {
    console.log('Item cannot fit:', {
      itemDims: itemDims,
      containerDims: containerDims,
      itemOriginal: itemDimensions,
      containerOriginal: containerDimensions
    });
  }
  
  return canFit;
}

/**
 * Enhanced best position finding with better scoring
 */
function findBestPosition(
  itemDimensions: { length: number; width: number; height: number },
  availableSpaces: AvailableSpace[],
  constraints: PackingConstraints
): PositionResult | null {
  let bestPosition: PositionResult | null = null;
  let bestScore = -1;
  
  for (const space of availableSpaces) {
    // Enhanced fit checking with stricter dimensional validation
    if (itemDimensions.length <= space.width &&
        itemDimensions.width <= space.depth &&
        itemDimensions.height <= space.height) {
      
      const position: Position3D = {
        x: space.x,
        y: space.y,
        z: space.z
      };
      
      // Enhanced scoring algorithm
      // 1. Prefer bottom-left-front positioning (stability)
      const stabilityScore = (1000 - position.z) * 3 + (1000 - position.x) + (1000 - position.y);
      
      // 2. Prefer tighter fits (less wasted space)
      const wastedVolume = (space.width - itemDimensions.length) * 
                          (space.depth - itemDimensions.width) * 
                          (space.height - itemDimensions.height);
      const wasteScore = Math.max(0, 10000 - wastedVolume);
      
      // 3. Combine scores
      const totalScore = stabilityScore + wasteScore;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestPosition = { position, space };
      }
    }
  }
  
  return bestPosition;
}

/**
 * Update available spaces after placing an item
 */
function updateAvailableSpaces(
  availableSpaces: AvailableSpace[],
  position: Position3D,
  itemDimensions: { length: number; width: number; height: number }
): void {
  // Find the space that was used
  const usedSpaceIndex = availableSpaces.findIndex(space =>
    space.x === position.x && space.y === position.y && space.z === position.z
  );
  
  if (usedSpaceIndex === -1) return;
  
  const usedSpace = availableSpaces[usedSpaceIndex];
  availableSpaces.splice(usedSpaceIndex, 1);
  
  // Create new available spaces around the placed item
  const newSpaces: AvailableSpace[] = [];
  
  // Right space
  if (position.x + itemDimensions.length < usedSpace.x + usedSpace.width) {
    newSpaces.push({
      x: position.x + itemDimensions.length,
      y: position.y,
      z: position.z,
      width: usedSpace.width - itemDimensions.length,
      height: usedSpace.height,
      depth: usedSpace.depth
    });
  }
  
  // Top space
  if (position.z + itemDimensions.height < usedSpace.z + usedSpace.height) {
    newSpaces.push({
      x: position.x,
      y: position.y,
      z: position.z + itemDimensions.height,
      width: itemDimensions.length,
      height: usedSpace.height - itemDimensions.height,
      depth: itemDimensions.width
    });
  }
  
  // Back space
  if (position.y + itemDimensions.width < usedSpace.y + usedSpace.depth) {
    newSpaces.push({
      x: position.x,
      y: position.y + itemDimensions.width,
      z: position.z,
      width: itemDimensions.length,
      height: itemDimensions.height,
      depth: usedSpace.depth - itemDimensions.width
    });
  }
  
  availableSpaces.push(...newSpaces);
}

// ==========================================
// OPTIMIZATION ALGORITHMS
// ==========================================

/**
 * First Fit Decreasing Algorithm
 */
export function firstFitDecreasing(
  items: PackingItem[],
  containers: PackingContainer[],
  constraints: PackingConstraints = {}
): MultiOrderPackingResult {
  const sortedItems = [...items].sort((a, b) => {
    const volumeA = calculateCUIN(a.dimensions);
    const volumeB = calculateCUIN(b.dimensions);
    return volumeB - volumeA;
  });
  
  const solutions: PackingResult[] = [];
  const remainingItems = [...sortedItems];
  
  while (remainingItems.length > 0) {
    let packed = false;
    
    // Try to add to existing containers first
    for (const solution of solutions) {
      const additionalItems = tryAddItemsToContainer(
        remainingItems, 
        solution, 
        constraints
      );
      
      if (additionalItems.length > 0) {
        // Remove packed items
        additionalItems.forEach(item => {
          const index = remainingItems.findIndex(r => r.id === item.id);
          if (index !== -1) remainingItems.splice(index, 1);
        });
        packed = true;
        break;
      }
    }
    
    // If no existing container can fit more items, create new one
    if (!packed) {
      const bestContainer = findBestContainerForItems(remainingItems, containers);
      if (bestContainer) {
        const solution = packItemsInContainer([remainingItems[0]], bestContainer, constraints);
        solutions.push(solution);
        remainingItems.shift();
      } else {
        break; // No suitable container found
      }
    }
  }
  
  return {
    solutions,
    totalCost: solutions.reduce((sum, sol) => sum + sol.totalCost, 0),
    totalContainers: solutions.length,
    averageFillRate: solutions.reduce((sum, sol) => sum + sol.fillRate, 0) / solutions.length,
    unpackedItems: remainingItems,
    savings: {
      compared_to_individual: 0,
      container_reduction: 0,
      cost_reduction: 0
    }
  };
}

/**
 * Genetic Algorithm for complex multi-item optimization
 */
export function geneticAlgorithmPacking(
  items: PackingItem[],
  containers: PackingContainer[],
  constraints: PackingConstraints = {},
  options: {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
  } = {}
): MultiOrderPackingResult {
  const { populationSize = 50, generations = 100, mutationRate = 0.1 } = options;
  
  // For now, fallback to best fit decreasing
  // Full genetic algorithm implementation would require more complex chromosome encoding
  return bestFitDecreasing(items, containers, constraints);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Try to add items to an existing container solution
 */
function tryAddItemsToContainer(
  items: PackingItem[],
  existingSolution: PackingResult,
  constraints: PackingConstraints
): PackingItem[] {
  // Simplified implementation - would need to track available space
  const addedItems: PackingItem[] = [];
  const currentWeight = existingSolution.packedItems.reduce(
    (sum, packed) => sum + (packed.item.weight * packed.item.quantity), 0
  );
  
  for (const item of items) {
    if (currentWeight + (item.weight * item.quantity) <= existingSolution.container.maxWeight) {
      // Check if there's space (simplified check)
      const currentVolume = existingSolution.packedItems.reduce(
        (sum, packed) => sum + (calculateCUIN(packed.item.dimensions) * packed.item.quantity), 0
      );
      const containerVolume = calculateCUIN(existingSolution.container.dimensions);
      const itemVolume = calculateCUIN(item.dimensions) * item.quantity;
      
      if (currentVolume + itemVolume <= containerVolume * 0.9) { // 90% fill limit
        addedItems.push(item);
        break; // Only add one item at a time for simplicity
      }
    }
  }
  
  return addedItems;
}

/**
 * Find the best container for a set of items
 */
function findBestContainerForItems(
  items: PackingItem[],
  containers: PackingContainer[]
): PackingContainer | null {
  if (items.length === 0) return null;
  
  const totalVolume = items.reduce(
    (sum, item) => sum + (calculateCUIN(item.dimensions) * item.quantity), 0
  );
  const totalWeight = items.reduce(
    (sum, item) => sum + (item.weight * item.quantity), 0
  );
  
  let bestContainer: PackingContainer | null = null;
  let bestScore = 0;
  
  for (const container of containers) {
    const containerVolume = calculateCUIN(container.dimensions);
    
    if (containerVolume >= totalVolume && container.maxWeight >= totalWeight) {
      const fillRate = (totalVolume / containerVolume) * 100;
      const weightUtilization = (totalWeight / container.maxWeight) * 100;
      const score = fillRate + weightUtilization - (container.cost * 10); // Prefer cheaper containers
      
      if (score > bestScore) {
        bestScore = score;
        bestContainer = container;
      }
    }
  }
  
  return bestContainer;
}

/**
 * Calculate cost of packing each item individually
 */
function calculateIndividualPackingCost(
  items: PackingItem[],
  containers: PackingContainer[]
): number {
  let totalCost = 0;
  
  for (const item of items) {
    const bestContainer = findBestContainerForItems([item], containers);
    if (bestContainer) {
      totalCost += bestContainer.cost * item.quantity;
    }
  }
  
  return totalCost;
}

/**
 * Generate packing recommendations
 */
function generatePackingRecommendations(
  packedItems: PackedItem[],
  unpackedCount: number,
  fillRate: number,
  weightUtilization: number
): string[] {
  const recommendations: string[] = [];
  
  if (fillRate < 30) {
    recommendations.push('⚠️ Low space utilization - consider smaller container');
  }
  
  if (weightUtilization < 20) {
    recommendations.push('💡 Low weight utilization - could add more items');
  }
  
  if (unpackedCount > 0) {
    recommendations.push(`📦 ${unpackedCount} items couldn't fit - consider larger container or separate shipment`);
  }
  
  if (fillRate > 90) {
    recommendations.push('✅ Excellent space utilization!');
  }
  
  const fragileItems = packedItems.filter(p => p.item.fragile);
  if (fragileItems.length > 0) {
    recommendations.push('🔒 Fragile items detected - ensure proper padding and protection');
  }
  
  return recommendations;
}

/**
 * Convert packing items from order items
 */
export function convertOrderItemsToPacking(orderItems: OrderItem[]): PackingItem[] {
  return orderItems.map(item => ({
    id: item.sku,
    dimensions: item.dimensions,
    weight: item.weight,
    quantity: item.quantity,
    value: item.value,
    fragile: item.fragile,
    category: item.category,
    stackable: !item.fragile, // Assume non-fragile items are stackable
    rotatable: true // Assume most items can be rotated
  }));
}

/**
 * Convert package types to packing containers
 */
export function convertPackageTypesToContainers(packages: PackageType[]): PackingContainer[] {
  return packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    dimensions: pkg.dimensions,
    maxWeight: pkg.maxWeight,
    cost: pkg.cost,
    category: pkg.category,
    volume: calculateCUIN(pkg.dimensions)
  }));
}