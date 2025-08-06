/**
 * CSV Parser and Data Processing Pipeline
 * 
 * Handles parsing and processing of various CSV formats for:
 * - Order history data (Suite Analyzer)
 * - Usage logs (Demand Planner)
 * - Product catalogs (Spec Generator)
 * - Package specifications
 */

import { calculateCUIN, type Dimensions, type LengthUnit } from '../calculations/cuin';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface ParsedOrderData {
  orderId: string;
  date: Date;
  items: OrderItem[];
  totalValue: number;
  customerInfo?: CustomerInfo;
  shippingInfo?: ShippingInfo;
  rawData: Record<string, any>;
}

export interface OrderItem {
  sku: string;
  productName: string;
  quantity: number;
  dimensions: Dimensions;
  weight: number;
  category?: string;
  value?: number;
  fragile?: boolean;
  shippingZone?: string;
  priority?: string;
}

export interface CustomerInfo {
  customerId?: string;
  name?: string;
  address?: Address;
  tier?: 'standard' | 'premium' | 'enterprise';
}

export interface ShippingInfo {
  method?: string;
  carrier?: string;
  cost?: number;
  zone?: string;
  priority?: string;
  deliveryDays?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UsageLogEntry {
  date: Date;
  packageType: string;
  quantity: number;
  totalOrders: number;
  percentage: number;
  costPerUnit?: number;
  notes?: string;
}

export interface ProductCatalogEntry {
  sku: string;
  name: string;
  description?: string;
  category: string;
  dimensions?: Dimensions;
  weight?: number;
  estimatedDimensions?: boolean;
  tags?: string[];
}

export interface ParseResult<T> {
  success: boolean;
  data: T[];
  errors: ParseError[];
  warnings: string[];
  metadata: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    columns: string[];
    processingTime: number;
  };
}

export interface ParseError {
  row: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning';
  suggestedFix?: string;
}

export interface CSVParseOptions {
  delimiter?: string;
  skipHeader?: boolean;
  maxRows?: number;
  strictMode?: boolean;
  autoDetectTypes?: boolean;
  dateFormats?: string[];
  dimensionUnit?: LengthUnit;
  requiredColumns?: string[];
}

// ==========================================
// COLUMN MAPPING CONFIGURATIONS
// ==========================================

export const ORDER_DATA_COLUMNS = {
  // Order identification
  orderId: ['order_id', 'orderid', 'order-id', 'order_number', 'ordernumber'],
  date: ['date', 'order_date', 'orderdate', 'created_at', 'timestamp'],
  
  // Item details
  sku: ['sku', 'product_id', 'productid', 'item_code', 'part_number'],
  productName: ['product_name', 'productname', 'name', 'description', 'title'],
  quantity: ['quantity', 'qty', 'count', 'amount'],
  
  // Dimensions
  length: ['length', 'l', 'len', 'length_in', 'length_cm'],
  width: ['width', 'w', 'wid', 'width_in', 'width_cm'],
  height: ['height', 'h', 'hgt', 'height_in', 'height_cm', 'depth'],
  
  // Physical properties
  weight: ['weight', 'wgt', 'weight_lb', 'weight_kg', 'weight_oz'],
  
  // Value and category
  value: ['value', 'price', 'cost', 'amount', 'total'],
  category: ['category', 'cat', 'type', 'class', 'group'],
  
  // Special flags
  fragile: ['fragile', 'breakable', 'delicate', 'handle_with_care'],
  
  // Customer info
  customerId: ['customer_id', 'customerid', 'customer'],
  customerName: ['customer_name', 'customername', 'client_name'],
  
  // Shipping info
  shippingMethod: ['shipping_method', 'ship_method', 'carrier', 'service'],
  shippingCost: ['shipping_cost', 'ship_cost', 'freight'],
  shippingZone: ['zone', 'shipping_zone', 'region'],
  priority: ['priority', 'urgency', 'service_level', 'speed']
};

export const USAGE_LOG_COLUMNS = {
  date: ['date', 'period', 'month', 'week'],
  packageType: ['package_type', 'package', 'container', 'box_type'],
  quantity: ['quantity', 'qty', 'count', 'used'],
  totalOrders: ['total_orders', 'orders', 'shipments', 'total'],
  percentage: ['percentage', 'percent', 'pct', 'ratio'],
  cost: ['cost', 'price', 'unit_cost', 'cost_per_unit']
};

export const PRODUCT_CATALOG_COLUMNS = {
  sku: ['sku', 'product_id', 'item_code'],
  name: ['name', 'product_name', 'title'],
  description: ['description', 'desc', 'details'],
  category: ['category', 'type', 'class'],
  length: ['length', 'l', 'len'],
  width: ['width', 'w', 'wid'], 
  height: ['height', 'h', 'hgt'],
  weight: ['weight', 'wgt'],
  tags: ['tags', 'keywords', 'attributes']
};

// ==========================================
// CORE PARSING FUNCTIONS
// ==========================================

/**
 * Parse CSV text content into structured data
 */
export function parseCSVContent(
  csvContent: string,
  options: CSVParseOptions = {}
): string[][] {
  const {
    delimiter = ',',
    maxRows = 10000
  } = options;

  const lines = csvContent.trim().split('\n');
  const rows: string[][] = [];

  for (let i = 0; i < Math.min(lines.length, maxRows); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles basic quoted fields)
    const row = parseCSVLine(line, delimiter);
    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line handling quotes and escapes
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add final field
  result.push(current.trim());
  
  return result;
}

/**
 * Auto-detect column mappings from headers
 */
function detectColumnMappings(
  headers: string[],
  columnDefinitions: Record<string, string[]>
): Record<string, number> {
  const mappings: Record<string, number> = {};
  
  for (const [fieldName, possibleColumns] of Object.entries(columnDefinitions)) {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase().trim();
      if (possibleColumns.includes(header)) {
        mappings[fieldName] = i;
        break;
      }
    }
  }
  
  return mappings;
}

/**
 * Parse and validate dimension data from row
 */
function parseDimensions(
  row: string[],
  mappings: Record<string, number>,
  unit: LengthUnit = 'in'
): Dimensions | null {
  const lengthIdx = mappings.length;
  const widthIdx = mappings.width;
  const heightIdx = mappings.height;
  
  if (lengthIdx === undefined || widthIdx === undefined || heightIdx === undefined) {
    return null;
  }
  
  const length = parseFloat(row[lengthIdx]);
  const width = parseFloat(row[widthIdx]);
  const height = parseFloat(row[heightIdx]);
  
  if (isNaN(length) || isNaN(width) || isNaN(height)) {
    return null;
  }
  
  return { length, width, height, unit };
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string, formats: string[] = []): Date | null {
  if (!dateStr) return null;
  
  // Try standard parsing first
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try common formats
  const commonFormats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
  ];
  
  for (const format of commonFormats) {
    if (format.test(dateStr)) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  
  return null;
}

// ==========================================
// ORDER DATA PARSER
// ==========================================

/**
 * Parse order history CSV data
 */
export function parseOrderData(
  csvContent: string,
  options: CSVParseOptions = {}
): ParseResult<ParsedOrderData> {
  const startTime = Date.now();
  const errors: ParseError[] = [];
  const warnings: string[] = [];
  const parsedOrders: ParsedOrderData[] = [];
  
  try {
    const rows = parseCSVContent(csvContent, options);
    if (rows.length === 0) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, message: 'No data found in CSV', severity: 'error' }],
        warnings: [],
        metadata: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          columns: [],
          processingTime: Date.now() - startTime
        }
      };
    }
    
    const headers = rows[0];
    const dataRows = options.skipHeader !== false ? rows.slice(1) : rows;
    const mappings = detectColumnMappings(headers, ORDER_DATA_COLUMNS);
    
    // Validate required columns
    const requiredFields = ['orderId', 'sku', 'quantity'];
    for (const field of requiredFields) {
      if (mappings[field] === undefined) {
        warnings.push(`Missing recommended column for ${field}`);
      }
    }
    
    // Group rows by order ID
    const orderGroups: Record<string, string[][]> = {};
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + (options.skipHeader !== false ? 2 : 1);
      
      try {
        const orderId = mappings.orderId !== undefined ? 
          row[mappings.orderId] || `order_${i + 1}` : 
          `order_${i + 1}`;
        
        if (!orderGroups[orderId]) {
          orderGroups[orderId] = [];
        }
        orderGroups[orderId].push(row);
        
      } catch (error) {
        errors.push({
          row: rowNum,
          message: `Error processing row: ${error}`,
          severity: 'error'
        });
      }
    }
    
    // Process each order group
    for (const [orderId, orderRows] of Object.entries(orderGroups)) {
      try {
        const order = processOrderGroup(orderId, orderRows, mappings, options);
        if (order) {
          parsedOrders.push(order);
        }
      } catch (error) {
        errors.push({
          row: 0,
          message: `Error processing order ${orderId}: ${error}`,
          severity: 'error'
        });
      }
    }
    
    return {
      success: errors.filter(e => e.severity === 'error').length === 0,
      data: parsedOrders,
      errors,
      warnings,
      metadata: {
        totalRows: rows.length,
        validRows: parsedOrders.length,
        invalidRows: rows.length - parsedOrders.length,
        columns: headers,
        processingTime: Date.now() - startTime
      }
    };
    
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [{ row: 0, message: `Parse error: ${error}`, severity: 'error' }],
      warnings,
      metadata: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        columns: [],
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * Process a group of rows for a single order
 */
function processOrderGroup(
  orderId: string,
  rows: string[][],
  mappings: Record<string, number>,
  options: CSVParseOptions
): ParsedOrderData | null {
  if (rows.length === 0) return null;
  
  const firstRow = rows[0];
  const items: OrderItem[] = [];
  
  // Parse order-level data from first row
  const date = mappings.date !== undefined ? 
    parseDate(firstRow[mappings.date]) : 
    new Date();
  
  let totalValue = 0;
  
  // Process each item in the order
  for (const row of rows) {
    const item = processOrderItem(row, mappings, options);
    if (item) {
      items.push(item);
      totalValue += (item.value || 0) * item.quantity;
    }
  }
  
  if (items.length === 0) return null;
  
  // Build customer info if available
  const customerInfo: CustomerInfo | undefined = mappings.customerId !== undefined ? {
    customerId: firstRow[mappings.customerId],
    name: mappings.customerName !== undefined ? firstRow[mappings.customerName] : undefined
  } : undefined;
  
  // Build shipping info if available
  const shippingInfo: ShippingInfo | undefined = mappings.shippingMethod !== undefined ? {
    method: firstRow[mappings.shippingMethod],
    cost: mappings.shippingCost !== undefined ? 
      parseFloat(firstRow[mappings.shippingCost]) || undefined : undefined
  } : undefined;
  
  return {
    orderId,
    date: date || new Date(),
    items,
    totalValue,
    customerInfo,
    shippingInfo,
    rawData: Object.fromEntries(firstRow.map((val, idx) => [`col_${idx}`, val]))
  };
}

/**
 * Process a single order item row
 */
function processOrderItem(
  row: string[],
  mappings: Record<string, number>,
  options: CSVParseOptions
): OrderItem | null {
  const sku = mappings.sku !== undefined ? row[mappings.sku] : '';
  const productName = mappings.productName !== undefined ? row[mappings.productName] : '';
  const quantity = mappings.quantity !== undefined ? 
    parseInt(row[mappings.quantity]) || 1 : 1;
  
  if (!sku && !productName) return null;
  
  // Parse dimensions
  const dimensions = parseDimensions(row, mappings, options.dimensionUnit);
  
  // Parse weight
  const weight = mappings.weight !== undefined ? 
    parseFloat(row[mappings.weight]) || 0 : 0;
  
  // Parse other fields
  const value = mappings.value !== undefined ? 
    parseFloat(row[mappings.value]) || 0 : 0;
  
  const category = mappings.category !== undefined ? 
    row[mappings.category] : undefined;
  
  const fragile = mappings.fragile !== undefined ? 
    ['true', '1', 'yes', 'fragile'].includes(row[mappings.fragile]?.toLowerCase() || '') : 
    false;
  
  // Parse shipping info
  const shippingZone = mappings.shippingZone !== undefined ? 
    row[mappings.shippingZone] : undefined;
  
  const priority = mappings.priority !== undefined ? 
    row[mappings.priority] : undefined;
  
  return {
    sku: sku || `item_${Math.random().toString(36).substr(2, 9)}`,
    productName: productName || sku || 'Unknown Product',
    quantity,
    dimensions: dimensions || { length: 0, width: 0, height: 0, unit: 'in' },
    weight,
    category,
    value,
    fragile,
    shippingZone,
    priority
  };
}

// ==========================================
// USAGE LOG PARSER
// ==========================================

/**
 * Parse usage log data for Demand Planner
 */
export function parseUsageLogData(
  csvContent: string,
  options: CSVParseOptions = {}
): ParseResult<UsageLogEntry> {
  const startTime = Date.now();
  const errors: ParseError[] = [];
  const warnings: string[] = [];
  const entries: UsageLogEntry[] = [];
  
  try {
    const rows = parseCSVContent(csvContent, options);
    if (rows.length === 0) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, message: 'No data found in CSV', severity: 'error' }],
        warnings: [],
        metadata: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          columns: [],
          processingTime: Date.now() - startTime
        }
      };
    }
    
    const headers = rows[0];
    const dataRows = options.skipHeader !== false ? rows.slice(1) : rows;
    const mappings = detectColumnMappings(headers, USAGE_LOG_COLUMNS);
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + (options.skipHeader !== false ? 2 : 1);
      
      try {
        const entry = processUsageLogRow(row, mappings);
        if (entry) {
          entries.push(entry);
        } else {
          warnings.push(`Row ${rowNum}: Could not parse usage log entry`);
        }
      } catch (error) {
        errors.push({
          row: rowNum,
          message: `Error processing row: ${error}`,
          severity: 'error'
        });
      }
    }
    
    return {
      success: errors.filter(e => e.severity === 'error').length === 0,
      data: entries,
      errors,
      warnings,
      metadata: {
        totalRows: rows.length,
        validRows: entries.length,
        invalidRows: dataRows.length - entries.length,
        columns: headers,
        processingTime: Date.now() - startTime
      }
    };
    
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [{ row: 0, message: `Parse error: ${error}`, severity: 'error' }],
      warnings,
      metadata: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        columns: [],
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * Process a single usage log row
 */
function processUsageLogRow(
  row: string[],
  mappings: Record<string, number>
): UsageLogEntry | null {
  const date = mappings.date !== undefined ? 
    parseDate(row[mappings.date]) : null;
  
  const packageType = mappings.packageType !== undefined ? 
    row[mappings.packageType] : '';
  
  const quantity = mappings.quantity !== undefined ? 
    parseInt(row[mappings.quantity]) || 0 : 0;
  
  const totalOrders = mappings.totalOrders !== undefined ? 
    parseInt(row[mappings.totalOrders]) || 0 : 0;
  
  if (!date || !packageType || quantity <= 0) return null;
  
  // Calculate percentage if not provided
  let percentage = mappings.percentage !== undefined ? 
    parseFloat(row[mappings.percentage]) || 0 : 0;
  
  if (percentage === 0 && totalOrders > 0) {
    percentage = (quantity / totalOrders) * 100;
  }
  
  const costPerUnit = mappings.cost !== undefined ? 
    parseFloat(row[mappings.cost]) || undefined : undefined;
  
  return {
    date,
    packageType,
    quantity,
    totalOrders,
    percentage,
    costPerUnit
  };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Validate CSV structure and suggest improvements
 */
export function validateCSVStructure(
  csvContent: string,
  expectedType: 'orders' | 'usage_log' | 'catalog'
): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  detectedColumns: string[];
  missingColumns: string[];
} {
  const rows = parseCSVContent(csvContent, { maxRows: 10 });
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (rows.length === 0) {
    return {
      isValid: false,
      issues: ['No data found in CSV'],
      suggestions: ['Ensure file contains data'],
      detectedColumns: [],
      missingColumns: []
    };
  }
  
  const headers = rows[0];
  const columnDefs = expectedType === 'orders' ? ORDER_DATA_COLUMNS :
                    expectedType === 'usage_log' ? USAGE_LOG_COLUMNS :
                    PRODUCT_CATALOG_COLUMNS;
  
  const mappings = detectColumnMappings(headers, columnDefs);
  const detectedColumns = Object.keys(mappings);
  const requiredColumns = expectedType === 'orders' ? ['orderId', 'sku'] :
                         expectedType === 'usage_log' ? ['date', 'packageType'] :
                         ['sku', 'name'];
  
  const missingColumns = requiredColumns.filter(col => !detectedColumns.includes(col));
  
  if (missingColumns.length > 0) {
    issues.push(`Missing required columns: ${missingColumns.join(', ')}`);
    suggestions.push('Add columns or rename existing columns to match expected format');
  }
  
  if (rows.length < 2) {
    issues.push('CSV appears to only contain headers');
    suggestions.push('Ensure CSV contains data rows below the header');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    detectedColumns,
    missingColumns
  };
}

/**
 * Generate sample CSV template for a given type
 */
export function generateCSVTemplate(type: 'orders' | 'usage_log' | 'catalog'): string {
  const templates = {
    orders: `order_id,date,sku,product_name,quantity,length,width,height,weight,value,category,customer_id,shipping_zone,priority
ORD-001,2024-01-15,SKU-123,Widget A,2,12,8,6,2.5,19.99,Electronics,CUST-001,domestic,standard
ORD-001,2024-01-15,SKU-456,Widget B,1,6,4,3,1.0,9.99,Electronics,CUST-001,domestic,express
ORD-002,2024-01-16,SKU-789,Gadget C,3,10,10,4,3.2,29.99,Home,CUST-002,international,standard`,
    
    usage_log: `date,package_type,quantity,total_orders,percentage,cost_per_unit
2024-01-01,Small Box,45,100,45.0,0.35
2024-01-01,Medium Box,30,100,30.0,0.55
2024-01-01,Large Box,15,100,15.0,0.85
2024-01-01,Envelope,10,100,10.0,0.25`,
    
    catalog: `sku,name,description,category,length,width,height,weight
SKU-123,Widget A,Electronic widget,Electronics,12,8,6,2.5
SKU-456,Widget B,Compact widget,Electronics,6,4,3,1.0
SKU-789,Gadget C,Home gadget,Home,10,10,4,3.2`
  };
  
  return templates[type];
}