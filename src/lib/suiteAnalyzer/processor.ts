// Suite Analyzer - Order History Processor

import { parseCSVContent } from '../data/csvParser';
import { calculateCUIN, convertToInches } from '../calculations/cuin';
import type { 
  OrderHistoryItem, 
  PackagingOption, 
  FallbackDimensions,
  ProcessingProgress 
} from './types';

export interface OrderProcessingResult {
  validOrders: OrderHistoryItem[];
  invalidOrders: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
  statistics: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    completionRate: number;
  };
}

export class OrderHistoryProcessor {
  private fallbackDimensions?: FallbackDimensions;
  private progressCallback?: (progress: ProcessingProgress) => void;

  constructor(
    fallbackDimensions?: FallbackDimensions,
    progressCallback?: (progress: ProcessingProgress) => void
  ) {
    this.fallbackDimensions = fallbackDimensions;
    this.progressCallback = progressCallback;
  }

  /**
   * Process order history CSV data
   */
  async processOrderHistory(csvContent: string): Promise<OrderProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Parse CSV content
      this.updateProgress('parsing', 0, 0, 0, 'Parsing CSV data...');
      console.log('CSV Content length:', csvContent.length);
      console.log('First 200 chars:', csvContent.substring(0, 200));
      
      const rows = parseCSVContent(csvContent);
      
      console.log('Parsed rows:', rows.length);
      if (rows.length > 0) {
        console.log('First row (headers):', rows[0]);
        if (rows.length > 1) {
          console.log('Second row (data):', rows[1]);
        }
      }
      
      if (rows.length === 0) {
        throw new Error('No data found in CSV file');
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      // Detect column mappings
      this.updateProgress('parsing', 20, 0, dataRows.length, 'Detecting column mappings...');
      const mappings = this.detectOrderColumnMappings(headers);
      
      console.log('CSV Headers:', headers);
      console.log('Detected mappings:', mappings);

      // Validate required columns
      this.validateRequiredColumns(mappings);

      // Process each row
      const validOrders: OrderHistoryItem[] = [];
      const invalidOrders: Array<{ row: number; data: any; errors: string[] }> = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const progress = ((i + 1) / dataRows.length) * 60 + 20; // 20-80%
        
        this.updateProgress(
          'validation', 
          progress, 
          i + 1, 
          dataRows.length, 
          `Processing order ${i + 1} of ${dataRows.length}...`
        );

        try {
          const order = this.parseOrderRow(row, mappings, i + 2); // +2 for header and 1-based indexing
          if (order) {
            validOrders.push(order);
          }
        } catch (error) {
          invalidOrders.push({
            row: i + 2,
            data: this.createRowObject(row, headers),
            errors: [error instanceof Error ? error.message : 'Unknown error']
          });
        }
      }

      // Apply fallback dimensions to orders missing dimension data
      this.updateProgress('validation', 85, dataRows.length, dataRows.length, 'Applying fallback dimensions...');
      this.applyFallbackDimensions(validOrders);

      this.updateProgress('complete', 100, dataRows.length, dataRows.length, 'Processing complete');

      const statistics = {
        totalRows: dataRows.length,
        validRows: validOrders.length,
        invalidRows: invalidOrders.length,
        completionRate: (validOrders.length / dataRows.length) * 100
      };

      return {
        validOrders,
        invalidOrders,
        statistics
      };

    } catch (error) {
      throw new Error(`Failed to process order history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect column mappings for order data
   */
  private detectOrderColumnMappings(headers: string[]): Record<string, number> {
    const columnDefinitions = {
      orderId: [
        'order_id', 'orderid', 'order_number', 'order', 'id', 'order id',
        'order_no', 'orderno', 'order no', 'po', 'po_number', 'purchase_order',
        'transaction_id', 'trans_id', 'reference', 'ref', 'order_ref'
      ],
      productName: [
        'product_name', 'product', 'item_name', 'name', 'description', 'product name',
        'item', 'sku_name', 'article', 'product_description', 'item_description',
        'title', 'product_title'
      ],
      totalOrderVolume: [
        'total_order_volume', 'total_volume', 'order_volume', 'volume', 'total order volume',
        'total_cuin', 'cuin', 'total cuin', 'cubic_inches', 'total_cubic_inches',
        'cu_in', 'total_cu_in', 'size', 'total_size', 'capacity', 'total_capacity',
        'cubic', 'total cubic', 'volume_cubic_inches', 'order_size', 'total_order_size'
      ],
      length: [
        'length', 'l', 'len', 'dimension_l', 'dim_l', 'product_length',
        'item_length', 'depth', 'd', 'long', 'longest'
      ],
      width: [
        'width', 'w', 'wid', 'dimension_w', 'dim_w', 'product_width',
        'item_width', 'breadth', 'b', 'wide', 'widest'
      ],
      height: [
        'height', 'h', 'hgt', 'dimension_h', 'dim_h', 'product_height',
        'item_height', 'tall', 'thickness', 't', 'high', 'highest'
      ],
      unit: [
        'unit', 'dimension_unit', 'dim_unit', 'measurement_unit', 'units',
        'measure', 'measurement', 'uom', 'unit_of_measure', 'size_unit'
      ],
      quantity: [
        'quantity', 'qty', 'count', 'amount', 'pieces', 'pcs',
        'units', 'number', 'num', 'quantity_ordered', 'order_qty',
        'items', 'no_of_items', 'total_items'
      ],
      weight: [
        'weight', 'wt', 'mass', 'pounds', 'lbs', 'kg', 'kilograms',
        'product_weight', 'item_weight', 'total_weight', 'gross_weight',
        'net_weight', 'grams', 'g', 'oz', 'ounces'
      ],
      category: [
        'category', 'type', 'product_type', 'class', 'product_category',
        'item_category', 'classification', 'group', 'product_group',
        'dept', 'department', 'section'
      ],
      priority: [
        'priority', 'service', 'shipping_priority', 'speed', 'shipping_speed',
        'delivery_type', 'service_level', 'ship_method', 'shipping_method',
        'urgency', 'shipping_service'
      ],
      zone: [
        'zone', 'shipping_zone', 'delivery_zone', 'region', 'area',
        'location', 'destination', 'ship_to', 'delivery_region',
        'geo', 'geography', 'territory'
      ]
    };

    const mappings: Record<string, number> = {};

    for (const [fieldName, possibleColumns] of Object.entries(columnDefinitions)) {
      let bestMatch = -1;
      let bestScore = 0;

      for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        
        for (const possibleColumn of possibleColumns) {
          const score = this.calculateSimilarityScore(header, possibleColumn);
          if (score > bestScore && score >= 0.7) {
            bestScore = score;
            bestMatch = i;
          }
        }
      }

      if (bestMatch !== -1) {
        mappings[fieldName] = bestMatch;
      }
    }

    return mappings;
  }

  /**
   * Calculate similarity score between two strings
   */
  private calculateSimilarityScore(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.includes(str2) || str2.includes(str1)) return 0.9;
    
    // Levenshtein distance calculation
    const matrix: number[][] = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    return 1 - (distance / Math.max(str1.length, str2.length));
  }

  /**
   * Validate that required columns are present
   */
  private validateRequiredColumns(mappings: Record<string, number>): void {
    const required = ['orderId'];
    const missing = required.filter(field => mappings[field] === undefined);
    
    // Either quantity or totalOrderVolume must be present
    if (mappings['quantity'] === undefined && mappings['totalOrderVolume'] === undefined) {
      missing.push('quantity or totalOrderVolume');
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }
  }

  /**
   * Parse a single order row
   */
  private parseOrderRow(
    row: string[], 
    mappings: Record<string, number>, 
    rowNumber: number
  ): OrderHistoryItem | null {
    const orderId = this.getFieldValue(row, mappings, 'orderId');
    if (!orderId?.trim()) {
      throw new Error(`Row ${rowNumber}: Order ID is required`);
    }

    // Parse quantity (default to 1 if not provided)
    const quantityStr = this.getFieldValue(row, mappings, 'quantity');
    const quantity = quantityStr ? parseInt(quantityStr) : 1;
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error(`Row ${rowNumber}: Invalid quantity`);
    }

    // Parse total order volume if available
    const totalOrderVolumeStr = this.getFieldValue(row, mappings, 'totalOrderVolume');
    const totalOrderVolume = totalOrderVolumeStr ? parseFloat(totalOrderVolumeStr) : undefined;

    // Parse dimensions (may be missing - will use fallback)
    const dimensions = this.parseDimensions(row, mappings, rowNumber, totalOrderVolume);
    
    const order: OrderHistoryItem = {
      orderId: orderId.trim(),
      quantity,
      ...dimensions,
      productName: this.getFieldValue(row, mappings, 'productName')?.trim(),
      weight: this.parseNumericField(this.getFieldValue(row, mappings, 'weight')),
      category: this.getFieldValue(row, mappings, 'category')?.trim(),
      priority: this.parseShippingPriority(this.getFieldValue(row, mappings, 'priority')),
      zone: this.getFieldValue(row, mappings, 'zone')?.trim()
    };

    return order;
  }

  /**
   * Parse dimensions from row data
   */
  private parseDimensions(
    row: string[], 
    mappings: Record<string, number>, 
    rowNumber: number,
    totalOrderVolume?: number
  ): { length: number; width: number; height: number; unit: 'in' | 'cm' | 'ft' | 'mm' | 'm'; totalVolume?: number } {
    const lengthStr = this.getFieldValue(row, mappings, 'length');
    const widthStr = this.getFieldValue(row, mappings, 'width');
    const heightStr = this.getFieldValue(row, mappings, 'height');
    const unitStr = this.getFieldValue(row, mappings, 'unit') || 'in';

    // If we have totalOrderVolume, we can work with that even without individual dimensions
    if (totalOrderVolume && (!lengthStr || !widthStr || !heightStr)) {
      return { length: 0, width: 0, height: 0, unit: 'in', totalVolume: totalOrderVolume };
    }

    // If any dimension is missing and no total volume, return zero dimensions (will be filled by fallback)
    if (!lengthStr || !widthStr || !heightStr) {
      return { length: 0, width: 0, height: 0, unit: 'in' };
    }

    const length = parseFloat(lengthStr);
    const width = parseFloat(widthStr);
    const height = parseFloat(heightStr);

    if (isNaN(length) || isNaN(width) || isNaN(height)) {
      throw new Error(`Row ${rowNumber}: Invalid dimensions`);
    }

    if (length <= 0 || width <= 0 || height <= 0) {
      throw new Error(`Row ${rowNumber}: Dimensions must be positive`);
    }

    const unit = this.parseUnit(unitStr);
    
    // Include totalVolume if available
    if (totalOrderVolume) {
      return { length, width, height, unit, totalVolume: totalOrderVolume };
    }
    
    return { length, width, height, unit };
  }

  /**
   * Parse unit string to valid unit type
   */
  private parseUnit(unitStr: string): 'in' | 'cm' | 'ft' | 'mm' | 'm' {
    const normalized = unitStr.toLowerCase().trim();
    const unitMap: Record<string, 'in' | 'cm' | 'ft' | 'mm' | 'm'> = {
      'in': 'in', 'inch': 'in', 'inches': 'in', '"': 'in',
      'cm': 'cm', 'centimeter': 'cm', 'centimeters': 'cm',
      'ft': 'ft', 'foot': 'ft', 'feet': 'ft', "'": 'ft',
      'mm': 'mm', 'millimeter': 'mm', 'millimeters': 'mm',
      'm': 'm', 'meter': 'm', 'meters': 'm'
    };
    
    return unitMap[normalized] || 'in';
  }

  /**
   * Parse shipping priority
   */
  private parseShippingPriority(priorityStr?: string): 'standard' | 'express' | 'overnight' {
    if (!priorityStr) return 'standard';
    
    const normalized = priorityStr.toLowerCase().trim();
    if (normalized.includes('overnight') || normalized.includes('next')) return 'overnight';
    if (normalized.includes('express') || normalized.includes('fast')) return 'express';
    return 'standard';
  }

  /**
   * Parse numeric field
   */
  private parseNumericField(value?: string): number | undefined {
    if (!value?.trim()) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * Get field value from row using mappings
   */
  private getFieldValue(row: string[], mappings: Record<string, number>, field: string): string | undefined {
    const index = mappings[field];
    return index !== undefined && index < row.length ? row[index] : undefined;
  }

  /**
   * Create object from row data for error reporting
   */
  private createRowObject(row: string[], headers: string[]): Record<string, string> {
    const obj: Record<string, string> = {};
    for (let i = 0; i < Math.min(row.length, headers.length); i++) {
      obj[headers[i]] = row[i];
    }
    return obj;
  }

  /**
   * Apply fallback dimensions to orders with missing dimensions
   */
  private applyFallbackDimensions(orders: OrderHistoryItem[]): void {
    // Skip if no fallback dimensions provided
    if (!this.fallbackDimensions) {
      return;
    }

    for (const order of orders) {
      if (order.length === 0 || order.width === 0 || order.height === 0) {
        // Determine which fallback to use based on context
        const fallback = this.selectFallbackDimensions(order);
        order.length = fallback.length;
        order.width = fallback.width;
        order.height = fallback.height;
        order.unit = 'in'; // Fallback dimensions are always in inches
      }
    }
  }

  /**
   * Select appropriate fallback dimensions
   */
  private selectFallbackDimensions(order: OrderHistoryItem): { length: number; width: number; height: number } {
    // Return default dimensions if no fallback dimensions provided
    if (!this.fallbackDimensions) {
      return { length: 1, width: 1, height: 1 };
    }

    // Use category or product name to determine size
    const productInfo = (order.productName || '').toLowerCase();
    const category = (order.category || '').toLowerCase();
    
    if (productInfo.includes('small') || category.includes('small')) {
      return this.fallbackDimensions.smallest;
    } else if (productInfo.includes('large') || category.includes('large')) {
      return this.fallbackDimensions.largest;
    } else {
      return this.fallbackDimensions.average;
    }
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
        estimatedTimeRemaining: 0 // Will be calculated by caller
      });
    }
  }
}