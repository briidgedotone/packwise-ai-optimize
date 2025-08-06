/**
 * Phase 2 Core Calculation Engines Demo
 * 
 * Comprehensive demonstration of:
 * - CSV Parser and Data Processing
 * - Packaging Optimization Algorithm
 * - Cost Analysis Engine with ROI
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/ui/file-upload';
import { CSVValidator } from '@/components/ui/csv-validator';
import { ContainerConfigurator } from '@/components/ui/container-configurator';
import { 
  Upload,
  FileText,
  Package,
  DollarSign,
  TrendingUp,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';

// Import our Phase 2 modules
import {
  parseOrderData,
  parseUsageLogData,
  type ParsedOrderData,
  type OrderItem as CSVOrderItem
} from '@/lib/data/csvParser';

import {
  bestFitDecreasing,
  convertOrderItemsToPacking,
  convertPackageTypesToContainers,
  type MultiOrderPackingResult
} from '@/lib/algorithms/packingOptimizer';

import {
  performCostAnalysis,
  calculateROI,
  generateCostSummary,
  calculateShippingCosts,
  type CostAnalysisResult
} from '@/lib/calculations/costAnalysis';

import { STANDARD_PACKAGES } from '@/lib/calculations/packaging';

const Phase2Demo: React.FC = () => {
  // State for CSV parsing
  const [csvContent, setCsvContent] = useState('');
  const [parseResult, setParseResult] = useState<any>(null);
  const [csvType, setCsvType] = useState<'orders' | 'usage_log' | 'catalog'>('orders');
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // State for optimization
  const [optimizationResult, setOptimizationResult] = useState<MultiOrderPackingResult | null>(null);
  const [availableContainers, setAvailableContainers] = useState(STANDARD_PACKAGES);
  
  // State for cost analysis
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysisResult | null>(null);
  const [roiInput, setRoiInput] = useState({ implementationCost: 5000, monthlyVolume: 100 });

  // Sample CSV data
  const sampleCSV = {
    orders: `order_id,date,sku,product_name,quantity,length,width,height,weight,value,category,shipping_zone,priority
ORD-001,2024-01-15,SKU-123,Premium Widget,2,12,8,6,2.5,29.99,Electronics,domestic,standard
ORD-001,2024-01-15,SKU-456,Compact Device,1,6,4,3,1.0,19.99,Electronics,domestic,express
ORD-002,2024-01-16,SKU-789,Home Gadget,3,10,10,4,3.2,39.99,Home,international,standard
ORD-003,2024-01-17,SKU-101,Small Tool,5,4,3,2,0.8,12.99,Tools,domestic,standard
ORD-004,2024-01-18,SKU-202,Large Item,1,20,16,12,8.5,199.99,Furniture,zone_3,express`,
    
    usage_log: `date,package_type,quantity,total_orders,percentage
2024-01-01,Small Box,45,100,45.0
2024-01-01,Medium Box,30,100,30.0
2024-01-01,Large Box,15,100,15.0
2024-01-01,Envelope,10,100,10.0`,
    
    catalog: `sku,name,description,category,length,width,height,weight
SKU-123,Premium Widget,High-end electronic widget,Electronics,12,8,6,2.5
SKU-456,Compact Device,Portable electronic device,Electronics,6,4,3,1.0
SKU-789,Home Gadget,Useful home gadget,Home,10,10,4,3.2`
  };

  // Parse CSV data
  const handleParseCSV = useCallback(() => {
    if (!csvContent.trim()) {
      setParseResult({ error: 'Please enter CSV data' });
      return;
    }

    try {
      if (csvType === 'orders') {
        const result = parseOrderData(csvContent);
        setParseResult(result);
        
        // If successful, run optimization
        if (result.success && result.data.length > 0) {
          runOptimization(result.data);
        }
      } else if (csvType === 'usage_log') {
        const result = parseUsageLogData(csvContent);
        setParseResult(result);
      }
    } catch (error) {
      setParseResult({ error: `Parse error: ${error}` });
    }
  }, [csvContent, csvType]);

  // Run packaging optimization
  const runOptimization = useCallback((orders: ParsedOrderData[]) => {
    try {
      // Convert orders to packing items
      const allItems: CSVOrderItem[] = orders.flatMap(order => order.items);
      const packingItems = convertOrderItemsToPacking(allItems);
      const containers = convertPackageTypesToContainers(availableContainers);

      // Run best fit decreasing algorithm
      const result = bestFitDecreasing(packingItems, containers, {
        allowRotation: true,
        allowStacking: true,
        minimumFillRate: 30
      });

      setOptimizationResult(result);

      // Run cost analysis
      if (result.solutions.length > 0) {
        runCostAnalysis(orders, result);
      }
    } catch (error) {
      console.error('Optimization error:', error);
    }
  }, []);

  // Run cost analysis
  const runCostAnalysis = useCallback((
    orders: ParsedOrderData[], 
    optimization: MultiOrderPackingResult
  ) => {
    try {
      // Convert CSV order items to the format expected by cost analysis
      const orderItems = orders.map(order => 
        order.items.map(item => ({
          id: item.sku,
          name: item.productName,
          sku: item.sku,
          productName: item.productName,
          quantity: item.quantity,
          dimensions: item.dimensions,
          weight: item.weight,
          category: item.category,
          value: item.value,
          fragile: item.fragile
        }))
      );
      
      // Create current packaging baseline with realistic shipping costs
      const currentPackaging = orders.flatMap(order => 
        order.items.map(item => {
          const packageType = STANDARD_PACKAGES[3]; // Assume medium box
          const shippingCost = calculateShippingCosts(
            packageType.dimensions,
            item.weight * item.quantity,
            item.shippingZone || 'domestic',
            item.priority || 'standard'
          );
          
          return {
            packageType,
            fillRate: 40, // Assume poor utilization
            efficiency: 45,
            cost: packageType.cost + shippingCost.totalCost, // Include shipping!
            dimensionalWeight: shippingCost.dimensionalWeight,
            actualWeight: item.weight * item.quantity,
            shippingCost: shippingCost.totalCost,
            recommendations: [
              shippingCost.dimensionalWeight > item.weight * item.quantity ? 
                'Consider smaller packaging to reduce dimensional weight charges' : ''
            ].filter(Boolean)
          }
        })
      );

      const analysis = performCostAnalysis(
        orderItems,
        currentPackaging,
        optimization,
        roiInput.monthlyVolume
      );

      setCostAnalysis(analysis);
    } catch (error) {
      console.error('Cost analysis error:', error);
    }
  }, [roiInput.monthlyVolume]);

  // Load sample data
  const loadSampleData = (type: 'orders' | 'usage_log' | 'catalog') => {
    setCsvType(type);
    setCsvContent(sampleCSV[type]);
    setUploadedFileName('');
    setParseResult(null);
  };

  // Handle file upload
  const handleFileUpload = useCallback((content: string, filename: string) => {
    setCsvContent(content);
    setUploadedFileName(filename);
    setParseResult(null);
  }, []);

  // Download template
  const handleTemplateDownload = (type: 'orders' | 'usage_log' | 'catalog') => {
    console.log(`Downloaded ${type} template`);
  };

  // Handle container configuration
  const handleContainersChange = (containers: typeof STANDARD_PACKAGES) => {
    setAvailableContainers(containers);
    // Re-run optimization if we have data
    if (parseResult?.success && parseResult.data.length > 0) {
      runOptimization(parseResult.data);
    }
  };

  const handlePresetLoad = (preset: 'standard' | 'express' | 'economy') => {
    let presetContainers = [...STANDARD_PACKAGES];
    
    if (preset === 'express') {
      // Focus on faster, slightly more expensive options
      presetContainers = STANDARD_PACKAGES.map(pkg => ({
        ...pkg,
        cost: pkg.cost * 1.2, // 20% premium for express
        name: pkg.name + ' (Express)'
      }));
    } else if (preset === 'economy') {
      // Focus on cheapest options, remove premium containers
      presetContainers = STANDARD_PACKAGES.filter(pkg => pkg.cost < 2.0);
    }
    
    setAvailableContainers(presetContainers);
    if (parseResult?.success && parseResult.data.length > 0) {
      runOptimization(parseResult.data);
    }
  };

  // Generate PDF Report
  const generatePDFReport = (analysis: CostAnalysisResult, inputs: { implementationCost: number; monthlyVolume: number }) => {
    const roi = calculateROI(inputs.implementationCost, analysis.savings.monthly, 24);
    
    const reportContent = `
QuantiPackAI Cost Analysis Report
Generated: ${new Date().toLocaleDateString()}

=== EXECUTIVE SUMMARY ===
Current Cost per Shipment: $${analysis.currentCosts.total.toFixed(2)}
Optimized Cost per Shipment: $${analysis.optimizedCosts.total.toFixed(2)}
Savings per Shipment: $${analysis.savings.perShipment.toFixed(2)}
Monthly Savings: $${analysis.savings.monthly.toFixed(0)}
Annual Savings: $${analysis.savings.annual.toFixed(0)}

=== ROI ANALYSIS ===
Implementation Cost: $${inputs.implementationCost.toLocaleString()}
Payback Period: ${roi.paybackPeriod.toFixed(1)} months
ROI: ${roi.roi.toFixed(1)}%
NPV (24 months): $${roi.npv.toFixed(0)}

=== SAVINGS BREAKDOWN ===
Packaging Materials: $${analysis.savings.breakdown.packaging.toFixed(2)} per shipment
Shipping Costs: $${analysis.savings.breakdown.shipping.toFixed(2)} per shipment
Handling & Labor: $${analysis.savings.breakdown.handling.toFixed(2)} per shipment

=== RECOMMENDATIONS ===
${analysis.recommendations.map((rec, i) => `${i + 1}. ${rec.description} (Est. savings: $${rec.estimatedSavings.toLocaleString()}/year)`).join('\n')}

Generated by QuantiPackAI Suite Analyzer
`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QuantiPackAI_Cost_Analysis_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Phase 2: Core Calculation Engines</h1>
        <p className="text-gray-600">CSV Parser • Packaging Optimization • Cost Analysis & ROI</p>
      </div>

      <Tabs defaultValue="csv-parser" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="csv-parser">CSV Parser</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
          <TabsTrigger value="containers">Containers</TabsTrigger>
        </TabsList>

        {/* CSV Parser Tab */}
        <TabsContent value="csv-parser" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CSV Data Processing Pipeline
              </CardTitle>
              <CardDescription>
                Upload and parse CSV files for order data, usage logs, or product catalogs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Type Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Data Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={csvType === 'orders' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCsvType('orders')}
                  >
                    Order Data
                  </Button>
                  <Button
                    variant={csvType === 'usage_log' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCsvType('usage_log')}
                  >
                    Usage Log
                  </Button>
                  <Button
                    variant={csvType === 'catalog' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCsvType('catalog')}
                  >
                    Product Catalog
                  </Button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Upload CSV File</Label>
                <FileUpload
                  onFileContent={handleFileUpload}
                  placeholder={`Drop your ${csvType.replace('_', ' ')} CSV file here or click to browse`}
                />
              </div>

              {/* Sample Data */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Or Use Sample Data</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleData('orders')}
                  >
                    Sample Orders
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleData('usage_log')}
                  >
                    Sample Usage Log
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleData('catalog')}
                  >
                    Sample Catalog
                  </Button>
                </div>
              </div>

              {/* CSV Input */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="csv-content">CSV Data</Label>
                  {uploadedFileName && (
                    <Badge variant="secondary" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {uploadedFileName}
                    </Badge>
                  )}
                </div>
                <Textarea
                  id="csv-content"
                  placeholder="Paste CSV data here, upload a file above, or use sample data..."
                  value={csvContent}
                  onChange={(e) => {
                    setCsvContent(e.target.value);
                    setUploadedFileName('');
                    setParseResult(null);
                  }}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              {/* Real-time Validation */}
              <CSVValidator
                csvContent={csvContent}
                expectedType={csvType}
                onTemplateDownload={handleTemplateDownload}
              />

              {/* Parse Button */}
              <Button onClick={handleParseCSV} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Parse CSV Data
              </Button>

              {/* Parse Results */}
              {parseResult && (
                <div className="space-y-4">
                  {parseResult.error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{parseResult.error}</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Successfully parsed {parseResult.data?.length || 0} records
                      </AlertDescription>
                    </Alert>
                  )}

                  {parseResult.metadata && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {parseResult.metadata.totalRows}
                        </div>
                        <div className="text-sm text-blue-700">Total Rows</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {parseResult.metadata.validRows}
                        </div>
                        <div className="text-sm text-green-700">Valid Records</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {parseResult.errors?.length || 0}
                        </div>
                        <div className="text-sm text-orange-700">Errors</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {parseResult.metadata.processingTime}ms
                        </div>
                        <div className="text-sm text-purple-700">Process Time</div>
                      </div>
                    </div>
                  )}

                  {/* Sample Parsed Data */}
                  {parseResult.data && parseResult.data.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Sample Parsed Data</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto">
                        <pre className="text-xs">
                          {JSON.stringify(parseResult.data.slice(0, 2), null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Packaging Optimization Algorithm
              </CardTitle>
              <CardDescription>
                Best-fit container selection and 3D bin packing optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationResult ? (
                <div className="space-y-6">
                  {/* Optimization Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {optimizationResult.totalContainers}
                      </div>
                      <div className="text-sm text-blue-700">Containers Used</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {optimizationResult.averageFillRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-700">Avg Fill Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        ${optimizationResult.totalCost.toFixed(2)}
                      </div>
                      <div className="text-sm text-purple-700">Total Cost</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {optimizationResult.unpackedItems.length}
                      </div>
                      <div className="text-sm text-orange-700">Unpacked Items</div>
                    </div>
                  </div>

                  {/* Solutions Detail with Visual Enhancement */}
                  <div>
                    <Label className="text-lg font-medium">Optimization Solutions</Label>
                    <div className="mt-4 space-y-4">
                      {optimizationResult.solutions.slice(0, 3).map((solution, index) => (
                        <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Container {index + 1}: {solution.container.name}</h4>
                            <div className="flex gap-2">
                              <Badge 
                                variant={solution.fillRate > 80 ? "default" : solution.fillRate > 60 ? "secondary" : "destructive"}
                                className={solution.fillRate > 80 ? "bg-green-500" : solution.fillRate > 60 ? "bg-yellow-500" : ""}
                              >
                                {solution.fillRate.toFixed(1)}% fill
                              </Badge>
                              <Badge variant="outline">${solution.totalCost.toFixed(2)}</Badge>
                            </div>
                          </div>
                          
                          {/* Visual Fill Rate Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Space Utilization</span>
                              <span>{solution.fillRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  solution.fillRate > 80 ? 'bg-green-500' :
                                  solution.fillRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(solution.fillRate, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="font-semibold text-blue-600">{solution.packedItems.length}</div>
                              <div className="text-blue-700 text-xs">Items Packed</div>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded">
                              <div className="font-semibold text-purple-600">{solution.efficiency.toFixed(1)}%</div>
                              <div className="text-purple-700 text-xs">Efficiency</div>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded">
                              <div className="font-semibold text-orange-600">
                                {solution.packedItems.reduce((sum, p) => sum + p.item.weight, 0).toFixed(1)}lb
                              </div>
                              <div className="text-orange-700 text-xs">Total Weight</div>
                            </div>
                          </div>
                          
                          {solution.recommendations.length > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-700 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">💡</span>
                                {solution.recommendations[0]}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Savings Summary */}
                  {optimizationResult.savings.cost_reduction > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-900">Optimization Impact</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-green-600">
                            {optimizationResult.savings.cost_reduction.toFixed(1)}%
                          </div>
                          <div className="text-sm text-green-700">Cost Reduction</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-blue-600">
                            {optimizationResult.savings.container_reduction}
                          </div>
                          <div className="text-sm text-blue-700">Fewer Containers</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-purple-600">
                            {optimizationResult.averageFillRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-purple-700">Avg Fill Rate</div>
                        </div>
                      </div>
                      <p className="text-sm text-green-700 mt-3 text-center">
                        Significant improvement compared to individual packaging approach
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Optimization Data</h3>
                  <p className="text-gray-500 mb-4">
                    Parse CSV order data first to see packaging optimization results
                  </p>
                  <div className="text-sm text-gray-400">
                    💡 The optimization algorithm will analyze your orders and recommend the most efficient packaging solutions
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="cost-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Analysis & ROI Calculator
              </CardTitle>
              <CardDescription>
                Comprehensive cost analysis with ROI and business impact metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced ROI Input Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="implementation-cost" className="text-sm font-medium">Implementation Cost ($)</Label>
                  <Input
                    id="implementation-cost"
                    type="number"
                    value={roiInput.implementationCost}
                    onChange={(e) => setRoiInput(prev => ({
                      ...prev,
                      implementationCost: parseFloat(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Software, training, setup costs</p>
                </div>
                <div>
                  <Label htmlFor="monthly-volume" className="text-sm font-medium">Monthly Volume (orders)</Label>
                  <Input
                    id="monthly-volume"
                    type="number"
                    value={roiInput.monthlyVolume}
                    onChange={(e) => setRoiInput(prev => ({
                      ...prev,
                      monthlyVolume: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average orders per month</p>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      if (costAnalysis) {
                        generatePDFReport(costAnalysis, roiInput);
                      }
                    }}
                    disabled={!costAnalysis}
                    className="w-full"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF Report
                  </Button>
                </div>
              </div>

              {/* Cost Analysis Results */}
              {costAnalysis ? (
                <div className="space-y-6">
                  {/* Enhanced Cost Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-red-600">
                        ${costAnalysis.currentCosts.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-red-700">Current Cost</div>
                      <div className="text-xs text-red-600 mt-1">per shipment</div>
                      <div className="absolute top-2 right-2">
                        <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
                      </div>
                    </div>
                    <div className="relative p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-green-600">
                        ${costAnalysis.optimizedCosts.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-700">Optimized Cost</div>
                      <div className="text-xs text-green-600 mt-1">per shipment</div>
                      <div className="absolute top-2 right-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="relative p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-blue-600">
                        ${costAnalysis.savings.monthly.toFixed(0)}
                      </div>
                      <div className="text-sm text-blue-700">Monthly Savings</div>
                      <div className="text-xs text-blue-600 mt-1">estimated impact</div>
                      <div className="absolute top-2 right-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="relative p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-purple-600">
                        ${costAnalysis.savings.annual.toFixed(0)}
                      </div>
                      <div className="text-sm text-purple-700">Annual Savings</div>
                      <div className="text-xs text-purple-600 mt-1">projected ROI</div>
                      <div className="absolute top-2 right-2">
                        <Target className="h-4 w-4 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  {/* ROI Calculation */}
                  {(() => {
                    const roi = calculateROI(
                      roiInput.implementationCost,
                      costAnalysis.savings.monthly,
                      24
                    );
                    
                    return (
                      <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          ROI Analysis (24 months)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {roi.roi.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">ROI</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {roi.paybackPeriod.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">Payback (months)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              ${roi.npv.toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-600">NPV</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {roi.irr.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">IRR</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Enhanced Cost Breakdown */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Detailed Savings Breakdown
                    </h4>
                    <div className="space-y-4">
                      {/* Packaging Savings */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Packaging Materials</span>
                          <span className="font-bold text-green-600">
                            ${costAnalysis.savings.breakdown.packaging.toFixed(2)} per shipment
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(costAnalysis.savings.breakdown.packaging / costAnalysis.savings.breakdown.total) * 100}%` 
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          {((costAnalysis.savings.breakdown.packaging / costAnalysis.savings.breakdown.total) * 100).toFixed(1)}% of total savings
                        </div>
                      </div>
                      
                      {/* Shipping Savings */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Shipping Costs</span>
                          <span className="font-bold text-blue-600">
                            ${costAnalysis.savings.breakdown.shipping.toFixed(2)} per shipment
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(costAnalysis.savings.breakdown.shipping / costAnalysis.savings.breakdown.total) * 100}%` 
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          {((costAnalysis.savings.breakdown.shipping / costAnalysis.savings.breakdown.total) * 100).toFixed(1)}% of total savings
                        </div>
                      </div>
                      
                      {/* Handling Savings */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Handling & Labor</span>
                          <span className="font-bold text-purple-600">
                            ${costAnalysis.savings.breakdown.handling.toFixed(2)} per shipment
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(costAnalysis.savings.breakdown.handling / costAnalysis.savings.breakdown.total) * 100}%` 
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          {((costAnalysis.savings.breakdown.handling / costAnalysis.savings.breakdown.total) * 100).toFixed(1)}% of total savings
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {costAnalysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Top Recommendations</h4>
                      <div className="space-y-3">
                        {costAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                                {rec.priority.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-green-600 font-medium">
                                ${rec.estimatedSavings.toLocaleString()}/year
                              </span>
                            </div>
                            <p className="text-sm text-gray-900">{rec.description}</p>
                            <p className="text-xs text-gray-600 mt-1">{rec.implementation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Executive Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Executive Summary
                    </h4>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {generateCostSummary(costAnalysis)}
                    </pre>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Parse CSV order data and run optimization to see cost analysis
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Container Configuration Tab */}
        <TabsContent value="containers" className="space-y-6">
          <ContainerConfigurator
            containers={availableContainers}
            onContainersChange={handleContainersChange}
            onPresetLoad={handlePresetLoad}
          />
          
          {/* Container Usage in Optimization */}
          {optimizationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Container Usage Analysis
                </CardTitle>
                <CardDescription>
                  How your configured containers performed in the latest optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableContainers.map((container, index) => {
                    const usageCount = optimizationResult.solutions.filter(
                      s => s.container.id === container.id
                    ).length;
                    const usagePercentage = (usageCount / optimizationResult.totalContainers) * 100;
                    
                    return (
                      <div key={container.id} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{container.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{usageCount} used</span>
                            <Badge variant={usageCount > 0 ? "default" : "secondary"}>
                              {usagePercentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              usageCount > 0 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {container.dimensions.length}" × {container.dimensions.width}" × {container.dimensions.height}" •{' '}
                          ${container.cost.toFixed(2)} •{' '}
                          {usageCount > 0 ? 
                            `Avg fill rate: ${(
                              optimizationResult.solutions
                                .filter(s => s.container.id === container.id)
                                .reduce((sum, s) => sum + s.fillRate, 0) / usageCount
                            ).toFixed(1)}%` : 
                            'Not used in optimization'
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Phase2Demo;