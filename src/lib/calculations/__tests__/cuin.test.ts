/**
 * CUIN Calculation Module Tests
 * 
 * Comprehensive test suite for all CUIN calculation functions
 */

import {
  calculateCUIN,
  calculateCUINWithValidation,
  validateDimension,
  validateDimensions,
  convertDimension,
  convertToInches,
  convertFromInches,
  calculateVolumeInUnits,
  calculateFillRate,
  findOptimalContainer,
  calculateDimensionalWeight,
  formatCUIN,
  formatDimensions,
  parseDimensionString,
  calculateBulkCUIN,
  calculateTotalVolume,
  sortByVolume,
  UNIT_TO_INCHES,
  type Dimensions,
} from '../cuin';

// ==========================================
// UNIT CONVERSION TESTS
// ==========================================

describe('Unit Conversion Functions', () => {
  test('UNIT_TO_INCHES constants are correct', () => {
    expect(UNIT_TO_INCHES.in).toBe(1);
    expect(UNIT_TO_INCHES.ft).toBe(12);
    expect(UNIT_TO_INCHES.cm).toBeCloseTo(0.393701, 5);
    expect(UNIT_TO_INCHES.mm).toBeCloseTo(0.0393701, 6);
    expect(UNIT_TO_INCHES.m).toBeCloseTo(39.3701, 4);
  });

  test('convertDimension works correctly', () => {
    // Same unit conversion
    expect(convertDimension(10, 'in', 'in')).toBe(10);
    
    // Inches to feet
    expect(convertDimension(12, 'in', 'ft')).toBe(1);
    
    // Centimeters to inches
    expect(convertDimension(2.54, 'cm', 'in')).toBeCloseTo(1, 5);
    
    // Feet to inches
    expect(convertDimension(2, 'ft', 'in')).toBe(24);
  });

  test('convertToInches works correctly', () => {
    const dimensions: Dimensions = { length: 1, width: 1, height: 1, unit: 'ft' };
    const result = convertToInches(dimensions);
    
    expect(result.length).toBe(12);
    expect(result.width).toBe(12);
    expect(result.height).toBe(12);
  });

  test('convertFromInches works correctly', () => {
    const result = convertFromInches(12, 12, 12, 'ft');
    
    expect(result.length).toBe(1);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.unit).toBe('ft');
  });
});

// ==========================================
// VALIDATION TESTS
// ==========================================

describe('Validation Functions', () => {
  test('validateDimension accepts valid values', () => {
    expect(validateDimension(10, 'in').isValid).toBe(true);
    expect(validateDimension(0.5, 'in').isValid).toBe(true);
    expect(validateDimension(100, 'cm').isValid).toBe(true);
  });

  test('validateDimension rejects invalid values', () => {
    expect(validateDimension(-1, 'in').isValid).toBe(false);
    expect(validateDimension(0, 'in').isValid).toBe(false);
    expect(validateDimension(NaN, 'in').isValid).toBe(false);
    expect(validateDimension(1000, 'in').isValid).toBe(false); // Too large
  });

  test('validateDimensions works for complete dimension sets', () => {
    const validDimensions: Dimensions = {
      length: 10,
      width: 8,
      height: 6,
      unit: 'in'
    };
    
    const result = validateDimensions(validDimensions);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validateDimensions detects invalid dimension sets', () => {
    const invalidDimensions: Dimensions = {
      length: -10,
      width: 0,
      height: 6,
      unit: 'in'
    };
    
    const result = validateDimensions(invalidDimensions);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('validateDimensions warns about unusual aspect ratios', () => {
    const unusualDimensions: Dimensions = {
      length: 100,
      width: 0.5,
      height: 1,
      unit: 'in'
    };
    
    const result = validateDimensions(unusualDimensions);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

// ==========================================
// CORE CALCULATION TESTS
// ==========================================

describe('Core CUIN Calculations', () => {
  test('calculateCUIN computes volume correctly', () => {
    const dimensions: Dimensions = {
      length: 10,
      width: 8,
      height: 6,
      unit: 'in'
    };
    
    expect(calculateCUIN(dimensions)).toBe(480);
  });

  test('calculateCUIN handles different units', () => {
    const dimensionsInFeet: Dimensions = {
      length: 1,
      width: 1,
      height: 1,
      unit: 'ft'
    };
    
    expect(calculateCUIN(dimensionsInFeet)).toBe(1728); // 1 cubic foot = 1728 cubic inches
  });

  test('calculateCUINWithValidation returns proper result structure', () => {
    const dimensions: Dimensions = {
      length: 10,
      width: 8,
      height: 6,
      unit: 'in'
    };
    
    const result = calculateCUINWithValidation(dimensions);
    
    expect(result.isValid).toBe(true);
    expect(result.cuin).toBe(480);
    expect(result.originalUnit).toBe('in');
    expect(result.dimensions).toEqual(dimensions);
  });

  test('calculateCUINWithValidation handles invalid dimensions', () => {
    const invalidDimensions: Dimensions = {
      length: -10,
      width: 8,
      height: 6,
      unit: 'in'
    };
    
    const result = calculateCUINWithValidation(invalidDimensions);
    
    expect(result.isValid).toBe(false);
    expect(result.cuin).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('calculateVolumeInUnits provides multiple unit conversions', () => {
    const dimensions: Dimensions = {
      length: 12,
      width: 12,
      height: 12,
      unit: 'in'
    };
    
    const volumes = calculateVolumeInUnits(dimensions);
    
    expect(volumes.cuin).toBe(1728);
    expect(volumes.cuft).toBe(1);
    expect(volumes.liters).toBeCloseTo(28.32, 1);
  });
});

// ==========================================
// PACKAGING OPTIMIZATION TESTS
// ==========================================

describe('Packaging Optimization Functions', () => {
  test('calculateFillRate computes percentage correctly', () => {
    expect(calculateFillRate(100, 200)).toBe(50);
    expect(calculateFillRate(200, 100)).toBe(100); // Capped at 100%
    expect(calculateFillRate(100, 0)).toBe(0); // Handle division by zero
  });

  test('findOptimalContainer finds best fit', () => {
    const item: Dimensions = {
      length: 8,
      width: 6,
      height: 4,
      unit: 'in'
    };
    
    const containers: Dimensions[] = [
      { length: 10, width: 8, height: 6, unit: 'in' }, // Good fit
      { length: 20, width: 20, height: 20, unit: 'in' }, // Too big
      { length: 9, width: 7, height: 5, unit: 'in' }, // Better fit
    ];
    
    const result = findOptimalContainer(item, containers);
    
    expect(result).not.toBeNull();
    expect(result!.index).toBe(2); // Should pick the better fit (index 2)
    expect(result!.fillRate).toBeGreaterThan(50);
  });

  test('findOptimalContainer returns null when no container fits', () => {
    const item: Dimensions = {
      length: 20,
      width: 20,
      height: 20,
      unit: 'in'
    };
    
    const containers: Dimensions[] = [
      { length: 10, width: 8, height: 6, unit: 'in' },
      { length: 12, width: 10, height: 8, unit: 'in' },
    ];
    
    const result = findOptimalContainer(item, containers);
    expect(result).toBeNull();
  });

  test('calculateDimensionalWeight uses standard formula', () => {
    const dimensions: Dimensions = {
      length: 12,
      width: 12,
      height: 12,
      unit: 'in'
    };
    
    const dimWeight = calculateDimensionalWeight(dimensions, 139);
    expect(dimWeight).toBeCloseTo(1728 / 139, 2);
  });
});

// ==========================================
// UTILITY FUNCTION TESTS
// ==========================================

describe('Utility Functions', () => {
  test('formatCUIN displays appropriate units', () => {
    expect(formatCUIN(0.5)).toContain('cu in');
    expect(formatCUIN(100)).toContain('cu in');
    expect(formatCUIN(2000)).toContain('cu ft');
  });

  test('formatDimensions creates readable string', () => {
    const dimensions: Dimensions = {
      length: 10.5,
      width: 8.25,
      height: 6,
      unit: 'in'
    };
    
    const formatted = formatDimensions(dimensions);
    expect(formatted).toContain('10.50');
    expect(formatted).toContain('8.25');
    expect(formatted).toContain('6.00');
    expect(formatted).toContain('in');
  });

  test('parseDimensionString handles various formats', () => {
    expect(parseDimensionString('12x8x6')).toEqual({
      length: 12,
      width: 8,
      height: 6,
      unit: 'in'
    });
    
    expect(parseDimensionString('12 x 8 x 6 inches')).toEqual({
      length: 12,
      width: 8,
      height: 6,
      unit: 'in'
    });
    
    expect(parseDimensionString('10.5x8.25x6.75 cm')).toEqual({
      length: 10.5,
      width: 8.25,
      height: 6.75,
      unit: 'cm'
    });
    
    expect(parseDimensionString('invalid')).toBeNull();
  });
});

// ==========================================
// BULK CALCULATION TESTS
// ==========================================

describe('Bulk Calculation Functions', () => {
  test('calculateBulkCUIN processes multiple items', () => {
    const dimensionsList: Dimensions[] = [
      { length: 10, width: 8, height: 6, unit: 'in' },
      { length: 12, width: 10, height: 8, unit: 'in' },
      { length: 6, width: 4, height: 3, unit: 'in' },
    ];
    
    const results = calculateBulkCUIN(dimensionsList);
    
    expect(results).toHaveLength(3);
    expect(results[0].cuin).toBe(480);
    expect(results[1].cuin).toBe(960);
    expect(results[2].cuin).toBe(72);
    expect(results.every(r => r.isValid)).toBe(true);
  });

  test('calculateTotalVolume sums all volumes', () => {
    const dimensionsList: Dimensions[] = [
      { length: 10, width: 8, height: 6, unit: 'in' },
      { length: 5, width: 4, height: 3, unit: 'in' },
    ];
    
    const total = calculateTotalVolume(dimensionsList);
    expect(total).toBe(480 + 60); // 540
  });

  test('sortByVolume orders items correctly', () => {
    const dimensionsList: Dimensions[] = [
      { length: 5, width: 4, height: 3, unit: 'in' }, // 60 cu in
      { length: 10, width: 8, height: 6, unit: 'in' }, // 480 cu in
      { length: 2, width: 2, height: 2, unit: 'in' }, // 8 cu in
    ];
    
    const sortedDesc = sortByVolume(dimensionsList, 'desc');
    expect(sortedDesc[0].volume).toBe(480);
    expect(sortedDesc[1].volume).toBe(60);
    expect(sortedDesc[2].volume).toBe(8);
    
    const sortedAsc = sortByVolume(dimensionsList, 'asc');
    expect(sortedAsc[0].volume).toBe(8);
    expect(sortedAsc[1].volume).toBe(60);
    expect(sortedAsc[2].volume).toBe(480);
  });
});

// ==========================================
// EDGE CASE TESTS
// ==========================================

describe('Edge Cases and Error Handling', () => {
  test('handles very small dimensions', () => {
    const tinyDimensions: Dimensions = {
      length: 0.1,
      width: 0.1,
      height: 0.1,
      unit: 'in'
    };
    
    const result = calculateCUINWithValidation(tinyDimensions);
    expect(result.isValid).toBe(true);
    expect(result.cuin).toBeCloseTo(0.001, 6);
  });

  test('handles mixed units in container optimization', () => {
    const item: Dimensions = { length: 2.54, width: 2.54, height: 2.54, unit: 'cm' };
    const containers: Dimensions[] = [
      { length: 2, width: 2, height: 2, unit: 'in' }, // Should fit (slightly larger)
    ];
    
    const result = findOptimalContainer(item, containers);
    expect(result).not.toBeNull();
  });

  test('handles zero volume containers in fill rate calculation', () => {
    expect(calculateFillRate(100, 0)).toBe(0);
  });
});

// ==========================================
// REAL-WORLD SCENARIO TESTS
// ==========================================

describe('Real-World Packaging Scenarios', () => {
  test('Amazon small box scenario', () => {
    const item: Dimensions = { length: 6, width: 4, height: 2, unit: 'in' };
    const amazonBoxes: Dimensions[] = [
      { length: 8.7, width: 5.4, height: 3.1, unit: 'in' }, // Small box
      { length: 11, width: 8.5, height: 6, unit: 'in' },    // Medium box
    ];
    
    const result = findOptimalContainer(item, amazonBoxes);
    expect(result).not.toBeNull();
    expect(result!.index).toBe(0); // Should prefer smaller box
  });

  test('Shipping cost optimization scenario', () => {
    const packageDims: Dimensions = { length: 12, width: 10, height: 8, unit: 'in' };
    
    // Standard UPS/FedEx domestic DIM factor is 139
    const dimWeight = calculateDimensionalWeight(packageDims, 139);
    expect(dimWeight).toBeCloseTo(6.9, 1); // 960 / 139
    
    // International DIM factor is typically 166
    const intlDimWeight = calculateDimensionalWeight(packageDims, 166);
    expect(intlDimWeight).toBeCloseTo(5.8, 1); // 960 / 166
  });

  test('Multi-item packing scenario', () => {
    const items: Dimensions[] = [
      { length: 4, width: 3, height: 2, unit: 'in' },
      { length: 6, width: 4, height: 3, unit: 'in' },
      { length: 5, width: 5, height: 1, unit: 'in' },
    ];
    
    const totalVolume = calculateTotalVolume(items);
    const sortedItems = sortByVolume(items, 'desc');
    
    expect(totalVolume).toBe(24 + 72 + 25); // 121 cu in
    expect(sortedItems[0].volume).toBe(72); // Largest item first
  });

  test('Metric to imperial conversion scenario', () => {
    const metricItem: Dimensions = { length: 30, width: 20, height: 15, unit: 'cm' };
    const imperialContainer: Dimensions = { length: 14, width: 10, height: 8, unit: 'in' };
    
    const itemVolume = calculateCUIN(metricItem);
    const containerVolume = calculateCUIN(imperialContainer);
    
    expect(itemVolume).toBeCloseTo(691, 0); // ~691 cu in
    expect(containerVolume).toBe(1120); // 14*10*8
    
    const fillRate = calculateFillRate(itemVolume, containerVolume);
    expect(fillRate).toBeCloseTo(61.7, 1);
  });
});