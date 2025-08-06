/**
 * CUIN (Cubic Inches) Calculation Module
 * 
 * This module provides comprehensive functionality for:
 * - Converting dimensions to CUIN (cubic inches)
 * - Unit conversions between different measurement systems
 * - Volume calculations with validation
 * - Packaging optimization calculations
 */

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export type LengthUnit = 'in' | 'ft' | 'cm' | 'mm' | 'm';

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: LengthUnit;
}

export interface VolumeResult {
  cuin: number;
  dimensions: Dimensions;
  originalUnit: LengthUnit;
  isValid: boolean;
  warnings: string[];
}

export interface ConversionFactors {
  [key: string]: number;
}

// ==========================================
// CONSTANTS
// ==========================================

// Conversion factors to inches
export const UNIT_TO_INCHES: ConversionFactors = {
  'in': 1,           // inches to inches
  'ft': 12,          // feet to inches
  'cm': 0.393701,    // centimeters to inches
  'mm': 0.0393701,   // millimeters to inches
  'm': 39.3701,      // meters to inches
};

// Common packaging size ranges (in inches) for validation
export const PACKAGING_LIMITS = {
  MIN_DIMENSION: 0.1,      // 0.1 inch minimum
  MAX_DIMENSION: 120,      // 10 feet maximum
  MIN_VOLUME: 0.001,       // Very small items
  MAX_VOLUME: 1728000,     // 10ft x 10ft x 10ft
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Validates if a dimension value is reasonable for packaging
 */
export function validateDimension(value: number, unit: LengthUnit): { isValid: boolean; message?: string } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, message: 'Dimension must be a valid number' };
  }

  if (value <= 0) {
    return { isValid: false, message: 'Dimension must be positive' };
  }

  // Convert to inches for validation
  const valueInInches = value * UNIT_TO_INCHES[unit];

  if (valueInInches < PACKAGING_LIMITS.MIN_DIMENSION) {
    return { isValid: false, message: `Dimension too small (minimum ${PACKAGING_LIMITS.MIN_DIMENSION}" when converted to inches)` };
  }

  if (valueInInches > PACKAGING_LIMITS.MAX_DIMENSION) {
    return { isValid: false, message: `Dimension too large (maximum ${PACKAGING_LIMITS.MAX_DIMENSION}" when converted to inches)` };
  }

  return { isValid: true };
}

/**
 * Validates a complete set of dimensions
 */
export function validateDimensions(dimensions: Dimensions): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate each dimension
  const lengthValidation = validateDimension(dimensions.length, dimensions.unit);
  const widthValidation = validateDimension(dimensions.width, dimensions.unit);
  const heightValidation = validateDimension(dimensions.height, dimensions.unit);

  if (!lengthValidation.isValid) errors.push(`Length: ${lengthValidation.message}`);
  if (!widthValidation.isValid) errors.push(`Width: ${widthValidation.message}`);
  if (!heightValidation.isValid) errors.push(`Height: ${heightValidation.message}`);

  // If basic validation failed, return early
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Calculate volume for additional validation
  const volume = calculateCUIN(dimensions);
  
  if (volume < PACKAGING_LIMITS.MIN_VOLUME) {
    warnings.push('Very small volume - please verify dimensions');
  }

  if (volume > PACKAGING_LIMITS.MAX_VOLUME) {
    errors.push('Volume exceeds maximum packaging size limits');
  }

  // Check for unrealistic aspect ratios
  const dims = [dimensions.length, dimensions.width, dimensions.height];
  const maxDim = Math.max(...dims);
  const minDim = Math.min(...dims);
  
  if (maxDim / minDim > 100) {
    warnings.push('Unusual aspect ratio detected - please verify dimensions');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==========================================
// UNIT CONVERSION FUNCTIONS
// ==========================================

/**
 * Converts a single dimension from one unit to another
 */
export function convertDimension(value: number, fromUnit: LengthUnit, toUnit: LengthUnit): number {
  if (fromUnit === toUnit) return value;
  
  // Convert to inches first, then to target unit
  const inInches = value * UNIT_TO_INCHES[fromUnit];
  return inInches / UNIT_TO_INCHES[toUnit];
}

/**
 * Converts dimensions to inches
 */
export function convertToInches(dimensions: Dimensions): { length: number; width: number; height: number } {
  return {
    length: dimensions.length * UNIT_TO_INCHES[dimensions.unit],
    width: dimensions.width * UNIT_TO_INCHES[dimensions.unit],
    height: dimensions.height * UNIT_TO_INCHES[dimensions.unit],
  };
}

/**
 * Converts dimensions from inches to specified unit
 */
export function convertFromInches(length: number, width: number, height: number, toUnit: LengthUnit): Dimensions {
  const factor = UNIT_TO_INCHES[toUnit];
  return {
    length: length / factor,
    width: width / factor,
    height: height / factor,
    unit: toUnit,
  };
}

// ==========================================
// CORE CALCULATION FUNCTIONS
// ==========================================

/**
 * Calculates CUIN (cubic inches) from dimensions
 * This is the core function for volume calculation
 */
export function calculateCUIN(dimensions: Dimensions): number {
  const inInches = convertToInches(dimensions);
  return inInches.length * inInches.width * inInches.height;
}

/**
 * Advanced CUIN calculation with validation and detailed results
 */
export function calculateCUINWithValidation(dimensions: Dimensions): VolumeResult {
  const validation = validateDimensions(dimensions);
  
  if (!validation.isValid) {
    return {
      cuin: 0,
      dimensions,
      originalUnit: dimensions.unit,
      isValid: false,
      warnings: [...validation.errors, ...validation.warnings],
    };
  }

  const cuin = calculateCUIN(dimensions);

  return {
    cuin,
    dimensions,
    originalUnit: dimensions.unit,
    isValid: true,
    warnings: validation.warnings,
  };
}

/**
 * Calculate volume in different units
 */
export function calculateVolumeInUnits(dimensions: Dimensions): Record<string, number> {
  const cuin = calculateCUIN(dimensions);
  
  return {
    cuin: cuin,
    cuft: cuin / 1728,           // cubic feet
    liters: cuin * 0.0163871,    // liters
    ml: cuin * 16.3871,          // milliliters
    cm3: cuin * 16.3871,         // cubic centimeters
  };
}

// ==========================================
// PACKAGING OPTIMIZATION FUNCTIONS
// ==========================================

/**
 * Calculate fill rate (how much of a container is used)
 */
export function calculateFillRate(itemVolume: number, containerVolume: number): number {
  if (containerVolume <= 0) return 0;
  return Math.min((itemVolume / containerVolume) * 100, 100);
}

/**
 * Find the most efficient container from a list
 */
export function findOptimalContainer(
  itemDimensions: Dimensions,
  availableContainers: Dimensions[]
): { container: Dimensions; fillRate: number; index: number } | null {
  const itemVolume = calculateCUIN(itemDimensions);
  let bestContainer: Dimensions | null = null;
  let bestFillRate = 0;
  let bestIndex = -1;

  for (let i = 0; i < availableContainers.length; i++) {
    const container = availableContainers[i];
    const containerVolume = calculateCUIN(container);
    
    // Check if item fits in container
    const itemInInches = convertToInches(itemDimensions);
    const containerInInches = convertToInches(container);
    
    const fits = itemInInches.length <= containerInInches.length &&
                 itemInInches.width <= containerInInches.width &&
                 itemInInches.height <= containerInInches.height;
    
    if (fits && containerVolume >= itemVolume) {
      const fillRate = calculateFillRate(itemVolume, containerVolume);
      
      // Prefer higher fill rates (more efficient)
      if (fillRate > bestFillRate) {
        bestContainer = container;
        bestFillRate = fillRate;
        bestIndex = i;
      }
    }
  }

  if (bestContainer) {
    return {
      container: bestContainer,
      fillRate: bestFillRate,
      index: bestIndex,
    };
  }

  return null;
}

/**
 * Calculate dimensional weight (DIM weight) for shipping
 */
export function calculateDimensionalWeight(
  dimensions: Dimensions,
  dimFactor: number = 139 // Standard UPS/FedEx domestic factor
): number {
  const cuin = calculateCUIN(dimensions);
  return cuin / dimFactor;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format CUIN value for display
 */
export function formatCUIN(cuin: number, decimals: number = 2): string {
  if (cuin < 1) {
    return cuin.toFixed(3) + ' cu in';
  } else if (cuin < 1728) {
    return cuin.toFixed(decimals) + ' cu in';
  } else {
    return (cuin / 1728).toFixed(decimals) + ' cu ft';
  }
}

/**
 * Format dimensions for display
 */
export function formatDimensions(dimensions: Dimensions, decimals: number = 2): string {
  const { length, width, height, unit } = dimensions;
  return `${length.toFixed(decimals)}" × ${width.toFixed(decimals)}" × ${height.toFixed(decimals)}" ${unit}`;
}

/**
 * Parse dimension string (e.g., "12x8x6" or "12 x 8 x 6 inches")
 */
export function parseDimensionString(input: string, defaultUnit: LengthUnit = 'in'): Dimensions | null {
  // Remove extra whitespace and normalize
  const cleaned = input.trim().toLowerCase();
  
  // Extract unit if present
  let unit: LengthUnit = defaultUnit;
  const unitMatches = cleaned.match(/(in|ft|cm|mm|m)(?:ch|ches|eet|et)?$/);
  if (unitMatches) {
    const unitStr = unitMatches[1];
    if (unitStr === 'in') unit = 'in';
    else if (unitStr === 'ft') unit = 'ft';
    else if (unitStr === 'cm') unit = 'cm';
    else if (unitStr === 'mm') unit = 'mm';
    else if (unitStr === 'm') unit = 'm';
  }
  
  // Extract numbers
  const numbers = cleaned.match(/(\d+(?:\.\d+)?)/g);
  
  if (numbers && numbers.length >= 3) {
    return {
      length: parseFloat(numbers[0]),
      width: parseFloat(numbers[1]),
      height: parseFloat(numbers[2]),
      unit,
    };
  }
  
  return null;
}

// ==========================================
// BULK CALCULATION FUNCTIONS
// ==========================================

/**
 * Calculate CUIN for multiple items
 */
export function calculateBulkCUIN(dimensionsList: Dimensions[]): VolumeResult[] {
  return dimensionsList.map(dimensions => calculateCUINWithValidation(dimensions));
}

/**
 * Calculate total volume for multiple items
 */
export function calculateTotalVolume(dimensionsList: Dimensions[]): number {
  return dimensionsList.reduce((total, dimensions) => {
    return total + calculateCUIN(dimensions);
  }, 0);
}

/**
 * Sort items by volume (ascending or descending)
 */
export function sortByVolume(
  dimensionsList: Dimensions[],
  order: 'asc' | 'desc' = 'desc'
): Array<{ dimensions: Dimensions; volume: number }> {
  const itemsWithVolume = dimensionsList.map(dimensions => ({
    dimensions,
    volume: calculateCUIN(dimensions)
  }));
  
  return itemsWithVolume.sort((a, b) => {
    return order === 'asc' ? a.volume - b.volume : b.volume - a.volume;
  });
}