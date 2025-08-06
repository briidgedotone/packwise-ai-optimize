// Suite Analyzer - Main Analysis Engine

import { OrderHistoryProcessor } from './processor';
import { PackagingAllocationEngine } from './allocation';
import { BaselineComparisonEngine } from './baseline';
import { RecommendationsEngine } from './recommendations';

import type { 
  OrderHistoryItem,
  PackagingOption,
  BaselineMixItem,
  FallbackDimensions,
  SuiteAnalysisResult,
  SuiteAnalyzerConfig,
  ProcessingProgress 
} from './types';

export interface SuiteAnalyzerInput {
  orderHistoryCSV: string;
  packagingSuiteCSV: string;
  baselineMixCSV?: string;
  fallbackDimensions?: FallbackDimensions;
  config?: Partial<SuiteAnalyzerConfig>;
}

export class SuiteAnalyzer {
  private config: SuiteAnalyzerConfig;
  private progressCallback?: (progress: ProcessingProgress) => void;

  constructor(
    config?: Partial<SuiteAnalyzerConfig>,
    progressCallback?: (progress: ProcessingProgress) => void
  ) {
    this.config = {
      // Default configuration
      allowRotation: true,
      allowStacking: true,
      maxStackHeight: 48,
      minimumFillRate: 30,
      targetEfficiency: 75,
      includeShippingCosts: true,
      dimFactor: 139,
      fragileHandling: 'padded',
      prioritizeHighValue: true,
      maxProcessingTime: 300000, // 5 minutes
      batchSize: 100,
      parallelProcessing: true,
      ...config
    };
    
    this.progressCallback = progressCallback;
  }

  /**
   * Perform comprehensive suite analysis
   */
  async analyzeSuite(input: SuiteAnalyzerInput): Promise<SuiteAnalysisResult> {
    const analysisId = this.generateAnalysisId();
    const startTime = Date.now();
    
    try {
      this.updateProgress('parsing', 0, 0, 0, 'Starting suite analysis...');

      // Step 1: Process order history
      this.updateProgress('parsing', 5, 0, 0, 'Processing order history...');
      const orderProcessor = new OrderHistoryProcessor(
        input.fallbackDimensions,
        (progress) => this.updateProgress(progress.stage, 5 + progress.progress * 0.2, progress.currentItem, progress.totalItems, progress.message)
      );
      
      const orderProcessingResult = await orderProcessor.processOrderHistory(input.orderHistoryCSV);
      
      console.log('Order processing result:', {
        totalRows: orderProcessingResult.statistics.totalRows,
        validRows: orderProcessingResult.statistics.validRows,
        invalidRows: orderProcessingResult.statistics.invalidRows
      });
      
      if (orderProcessingResult.validOrders.length === 0) {
        console.error('Invalid orders:', orderProcessingResult.invalidOrders);
        throw new Error(`No valid orders found in order history. ${orderProcessingResult.statistics.invalidRows} orders had errors.`);
      }

      // Step 2: Process packaging suite
      this.updateProgress('parsing', 25, 0, 0, 'Processing packaging suite...');
      const packagingOptions = await this.processPackagingSuite(input.packagingSuiteCSV);
      
      console.log('Packaging options parsed:', packagingOptions.length);
      if (packagingOptions.length > 0) {
        console.log('First packaging option:', packagingOptions[0]);
      }
      
      if (packagingOptions.length === 0) {
        throw new Error('No valid packaging options found');
      }

      // Step 3: Process baseline mix (optional)
      let baselineMix: BaselineMixItem[] = [];
      if (input.baselineMixCSV) {
        this.updateProgress('parsing', 35, 0, 0, 'Processing baseline mix...');
        baselineMix = await this.processBaselineMix(input.baselineMixCSV);
      }

      // Step 4: Allocate optimal packaging
      this.updateProgress('optimization', 40, 0, orderProcessingResult.validOrders.length, 'Optimizing packaging allocation...');
      const allocationEngine = new PackagingAllocationEngine(
        packagingOptions,
        (progress) => this.updateProgress(progress.stage, 40 + progress.progress * 0.4, progress.currentItem, progress.totalItems, progress.message)
      );
      
      const allocationResult = await allocationEngine.allocateOptimalPackaging(orderProcessingResult.validOrders);

      // Step 5: Perform baseline comparison
      this.updateProgress('analysis', 80, 0, 0, 'Comparing against baseline...');
      const baselineAnalysis = BaselineComparisonEngine.compareAgainstBaseline(
        allocationResult.allocations,
        baselineMix,
        packagingOptions
      );

      // Step 6: Generate recommendations
      this.updateProgress('analysis', 90, 0, 0, 'Generating recommendations...');
      
      // Add debugging
      console.log('Allocation Result Summary:', allocationResult.summary);
      console.log('Number of allocations:', allocationResult.allocations.length);
      
      const recommendations = allocationResult.allocations.length > 0 
        ? RecommendationsEngine.generateRecommendations({
            allocations: allocationResult.allocations,
            baseline: baselineAnalysis.comparison,
            metrics: {
              processing: {
                totalTime: allocationResult.metrics.processingTime,
                ordersPerSecond: allocationResult.metrics.averageTimePerOrder > 0 
                  ? 1000 / allocationResult.metrics.averageTimePerOrder 
                  : 0,
                memoryUsage: 0 // Not tracked in current implementation
              },
              optimization: {
                successRate: allocationResult.summary.totalOrders > 0 
                  ? (allocationResult.summary.successfulAllocations / allocationResult.summary.totalOrders) * 100 
                  : 0,
                averageIterations: 1, // Single-pass algorithm
                convergenceRate: 100
              },
              quality: {
                fillRateDistribution: allocationResult.metrics.fillRateDistribution,
                costDistribution: {}, // Could be calculated if needed
                efficiencyScores: allocationResult.allocations.map(a => a.efficiency)
              }
            }
          })
        : [];

      // Step 7: Compile final results
      this.updateProgress('complete', 100, orderProcessingResult.validOrders.length, orderProcessingResult.validOrders.length, 'Analysis complete');
      
      const result: SuiteAnalysisResult = {
        analysisId,
        timestamp: new Date(),
        summary: {
          totalOrders: orderProcessingResult.statistics.totalRows,
          processedOrders: allocationResult.summary.successfulAllocations,
          failedOrders: allocationResult.summary.failedAllocations,
          totalSavings: baselineAnalysis.comparison.savings.totalSavings,
          averageFillRateImprovement: baselineAnalysis.comparison.savings.fillRateImprovement
        },
        allocations: allocationResult.allocations,
        baseline: baselineAnalysis.comparison,
        recommendations,
        metrics: {
          processing: {
            totalTime: Date.now() - startTime,
            ordersPerSecond: (allocationResult.summary.successfulAllocations / ((Date.now() - startTime) / 1000)),
            memoryUsage: 0
          },
          optimization: {
            successRate: (allocationResult.summary.successfulAllocations / allocationResult.summary.totalOrders) * 100,
            averageIterations: 1,
            convergenceRate: 100
          },
          quality: {
            fillRateDistribution: allocationResult.metrics.fillRateDistribution,
            costDistribution: {},
            efficiencyScores: allocationResult.allocations.map(a => a.efficiency)
          }
        }
      };

      return result;

    } catch (error) {
      throw new Error(`Suite analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process packaging suite CSV
   */
  private async processPackagingSuite(csvContent: string): Promise<PackagingOption[]> {
    // Parse CSV content
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Packaging suite file must contain header and data rows');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = lines.slice(1);

    // Detect column mappings
    const mappings = this.detectPackagingColumnMappings(headers);
    this.validatePackagingColumns(mappings);

    const packagingOptions: PackagingOption[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(',').map(cell => cell.trim());
      
      try {
        const option = this.parsePackagingRow(row, mappings, i + 2);
        if (option) {
          packagingOptions.push(option);
        }
      } catch (error) {
        console.warn(`Skipping packaging row ${i + 2}:`, error);
      }
    }

    return packagingOptions;
  }

  /**
   * Process baseline mix CSV
   */
  private async processBaselineMix(csvContent: string): Promise<BaselineMixItem[]> {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      return []; // Optional file, return empty if invalid
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = lines.slice(1);

    const mappings = this.detectBaselineColumnMappings(headers);
    const baselineMix: BaselineMixItem[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(',').map(cell => cell.trim());
      
      try {
        const item = this.parseBaselineRow(row, mappings, i + 2);
        if (item) {
          baselineMix.push(item);
        }
      } catch (error) {
        console.warn(`Skipping baseline row ${i + 2}:`, error);
      }
    }

    return baselineMix;
  }

  /**
   * Detect packaging column mappings
   */
  private detectPackagingColumnMappings(headers: string[]): Record<string, number> {
    const columnDefinitions = {
      packageName: ['package_name', 'name', 'package', 'container_name'],
      packageId: ['package_id', 'id', 'sku', 'code'],
      length: ['length', 'l', 'len', 'dimension_l'],
      width: ['width', 'w', 'wid', 'dimension_w'],
      height: ['height', 'h', 'hgt', 'dimension_h'],
      unit: ['unit', 'dimension_unit', 'measurement_unit'],
      costPerUnit: ['cost_per_unit', 'cost', 'price', 'unit_cost'],
      packageWeight: ['package_weight', 'weight', 'container_weight', 'wt'],
      maxWeight: ['max_weight', 'weight_limit', 'capacity'],
      material: ['material', 'type', 'material_type'],
      type: ['package_type', 'container_type', 'category']
    };

    return this.detectColumnMappings(headers, columnDefinitions);
  }

  /**
   * Detect baseline column mappings
   */
  private detectBaselineColumnMappings(headers: string[]): Record<string, number> {
    const columnDefinitions = {
      packageName: ['package_name', 'name', 'package'],
      packageId: ['package_id', 'id', 'sku'],
      currentUsagePercent: ['usage_percent', 'percent', 'percentage', 'current_usage'],
      monthlyVolume: ['monthly_volume', 'volume', 'count', 'quantity'],
      averageCost: ['average_cost', 'cost', 'avg_cost']
    };

    return this.detectColumnMappings(headers, columnDefinitions);
  }

  /**
   * Generic column mapping detection
   */
  private detectColumnMappings(headers: string[], columnDefinitions: Record<string, string[]>): Record<string, number> {
    const mappings: Record<string, number> = {};

    for (const [fieldName, possibleColumns] of Object.entries(columnDefinitions)) {
      let bestMatch = -1;
      let bestScore = 0;

      for (let i = 0; i < headers.length; i++) {
        const header = headers[i].replace(/[^a-z0-9]/g, '_');
        
        for (const possibleColumn of possibleColumns) {
          if (header.includes(possibleColumn) || possibleColumn.includes(header)) {
            const score = header === possibleColumn ? 1.0 : 0.8;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = i;
            }
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
   * Validate required packaging columns
   */
  private validatePackagingColumns(mappings: Record<string, number>): void {
    const required = ['packageName', 'length', 'width', 'height'];
    const missing = required.filter(field => mappings[field] === undefined);
    
    if (missing.length > 0) {
      throw new Error(`Missing required packaging columns: ${missing.join(', ')}`);
    }
  }

  /**
   * Parse packaging row
   */
  private parsePackagingRow(row: string[], mappings: Record<string, number>, rowNumber: number): PackagingOption | null {
    const packageName = this.getFieldValue(row, mappings, 'packageName');
    if (!packageName?.trim()) {
      throw new Error(`Row ${rowNumber}: Package name is required`);
    }

    const length = this.parseNumericField(this.getFieldValue(row, mappings, 'length'));
    const width = this.parseNumericField(this.getFieldValue(row, mappings, 'width'));
    const height = this.parseNumericField(this.getFieldValue(row, mappings, 'height'));
    const costPerUnit = this.parseNumericField(this.getFieldValue(row, mappings, 'costPerUnit'));

    if (!length || !width || !height) {
      throw new Error(`Row ${rowNumber}: Invalid dimensions`);
    }

    return {
      packageName: packageName.trim(),
      packageId: this.getFieldValue(row, mappings, 'packageId') || packageName.toLowerCase().replace(/\s+/g, '_'),
      length,
      width,
      height,
      unit: this.parseUnit(this.getFieldValue(row, mappings, 'unit') || 'in'),
      costPerUnit: costPerUnit || 0,
      packageWeight: this.parseNumericField(this.getFieldValue(row, mappings, 'packageWeight')) || 0.1,
      maxWeight: this.parseNumericField(this.getFieldValue(row, mappings, 'maxWeight')),
      material: this.getFieldValue(row, mappings, 'material') || 'cardboard',
      type: this.parsePackageType(this.getFieldValue(row, mappings, 'type'))
    };
  }

  /**
   * Parse baseline row
   */
  private parseBaselineRow(row: string[], mappings: Record<string, number>, rowNumber: number): BaselineMixItem | null {
    const packageName = this.getFieldValue(row, mappings, 'packageName');
    if (!packageName?.trim()) {
      throw new Error(`Row ${rowNumber}: Package name is required`);
    }

    const currentUsagePercent = this.parseNumericField(this.getFieldValue(row, mappings, 'currentUsagePercent'));
    const monthlyVolume = this.parseNumericField(this.getFieldValue(row, mappings, 'monthlyVolume'));
    const averageCost = this.parseNumericField(this.getFieldValue(row, mappings, 'averageCost'));

    if (!currentUsagePercent || !monthlyVolume || !averageCost) {
      throw new Error(`Row ${rowNumber}: Invalid usage data`);
    }

    return {
      packageName: packageName.trim(),
      packageId: this.getFieldValue(row, mappings, 'packageId') || packageName.toLowerCase().replace(/\s+/g, '_'),
      currentUsagePercent,
      monthlyVolume,
      averageCost
    };
  }

  /**
   * Parse package type
   */
  private parsePackageType(typeStr?: string): 'box' | 'envelope' | 'tube' | 'bag' {
    if (!typeStr) return 'box';
    
    const normalized = typeStr.toLowerCase();
    if (normalized.includes('envelope') || normalized.includes('mailer')) return 'envelope';
    if (normalized.includes('tube') || normalized.includes('cylinder')) return 'tube';
    if (normalized.includes('bag') || normalized.includes('poly')) return 'bag';
    return 'box';
  }

  /**
   * Parse unit string
   */
  private parseUnit(unitStr: string): 'in' | 'cm' | 'ft' | 'mm' | 'm' {
    const normalized = unitStr.toLowerCase().trim();
    const unitMap: Record<string, 'in' | 'cm' | 'ft' | 'mm' | 'm'> = {
      'in': 'in', 'inch': 'in', 'inches': 'in',
      'cm': 'cm', 'centimeter': 'cm', 'centimeters': 'cm',
      'ft': 'ft', 'foot': 'ft', 'feet': 'ft',
      'mm': 'mm', 'millimeter': 'mm', 'millimeters': 'mm',
      'm': 'm', 'meter': 'm', 'meters': 'm'
    };
    
    return unitMap[normalized] || 'in';
  }

  /**
   * Parse numeric field
   */
  private parseNumericField(value?: string): number | undefined {
    if (!value?.trim()) return undefined;
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? undefined : num;
  }

  /**
   * Get field value from row
   */
  private getFieldValue(row: string[], mappings: Record<string, number>, field: string): string | undefined {
    const index = mappings[field];
    return index !== undefined && index < row.length ? row[index] : undefined;
  }

  /**
   * Generate unique analysis ID
   */
  private generateAnalysisId(): string {
    return `suite_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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