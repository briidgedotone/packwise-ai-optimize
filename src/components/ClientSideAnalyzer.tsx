import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileSpreadsheet, 
  Package, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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

export const ClientSideAnalyzer = () => {
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);

  // Manual package input state
  const [useManualPackages, setUseManualPackages] = useState(false);
  const [manualPackages, setManualPackages] = useState([
    { name: 'Small Box', id: 'SM', length: '6', width: '4', height: '2', cost: '2.50', maxWeight: '5' },
    { name: 'Medium Box', id: 'MD', length: '12', width: '9', height: '6', cost: '4.00', maxWeight: '15' },
    { name: 'Large Box', id: 'LG', length: '18', width: '12', height: '8', cost: '6.50', maxWeight: '25' }
  ]);

  const handleFileUpload = (type: 'order' | 'package', file: File | null) => {
    if (type === 'order') {
      setOrderFile(file);
    } else {
      setPackageFile(file);
    }
    setError(null);
    setResults(null);
  };

  const addPackageRow = () => {
    setManualPackages([...manualPackages, { 
      name: '', id: '', length: '', width: '', height: '', cost: '', maxWeight: '' 
    }]);
  };

  const removePackageRow = (index: number) => {
    setManualPackages(manualPackages.filter((_, i) => i !== index));
  };

  const updatePackageRow = (index: number, field: string, value: string) => {
    const updated = [...manualPackages];
    updated[index] = { ...updated[index], [field]: value };
    setManualPackages(updated);
  };

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const parseOrderCSV = (csvText: string): ParsedOrder[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have header and data rows');
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, ''));
    console.log('Order CSV Headers:', headers);
    const orders: ParsedOrder[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      console.log('Row data:', row);
      
      // Extract order data with flexible field matching
      const orderId = row.order_id || row.orderid || row.id || row.order || row['order_id'] || `ORDER-${i}`;
      const volume = parseFloat(
        row.volume || 
        row.total_volume || 
        row.product_cuin || 
        row.cuin || 
        row['total_order_volumes_cuin'] ||
        row['total_order_volumes'] ||
        row['0'] || // Sometimes columns get indexed as numbers
        '0'
      );
      
      console.log('Parsed orderId:', orderId, 'volume:', volume);
      const weight = parseFloat(row.weight || row.total_weight || '1');
      const length = parseFloat(row.length || row.product_length || '0') || undefined;
      const width = parseFloat(row.width || row.product_width || '0') || undefined;
      const height = parseFloat(row.height || row.product_height || '0') || undefined;
      
      // Calculate volume from dimensions if not provided
      let finalVolume = volume;
      if (!finalVolume && length && width && height) {
        finalVolume = length * width * height;
      }
      
      if (finalVolume > 0) {
        orders.push({
          orderId,
          volume: finalVolume,
          weight,
          length,
          width,
          height
        });
      }
    }
    
    return orders;
  };

  const parsePackageCSV = (csvText: string): ParsedPackage[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('Package CSV must have header and data rows');
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const packages: ParsedPackage[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      const name = row.package_name || row.name || `Package-${i}`;
      const id = row.package_id || row.id || `PKG-${i}`;
      const length = parseFloat(row.length || '12');
      const width = parseFloat(row.width || '9');
      const height = parseFloat(row.height || '3');
      const cost = parseFloat(row.cost || row.price || row.cost_per_unit || '1');
      const weight = parseFloat(row.weight || row.package_weight || '0.1');
      const maxWeight = parseFloat(row.max_weight || row.maxweight || '50');
      
      packages.push({
        id,
        name,
        length,
        width,
        height,
        cost,
        weight,
        maxWeight
      });
    }
    
    return packages;
  };

  const createManualPackages = (): ParsedPackage[] => {
    return manualPackages
      .filter(pkg => pkg.name && pkg.length && pkg.width && pkg.height)
      .map(pkg => ({
        id: pkg.id || pkg.name.replace(/\s+/g, ''),
        name: pkg.name,
        length: parseFloat(pkg.length),
        width: parseFloat(pkg.width),
        height: parseFloat(pkg.height),
        cost: parseFloat(pkg.cost) || 1,
        weight: 0.1,
        maxWeight: parseFloat(pkg.maxWeight) || 50
      }));
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const processAnalysis = async () => {
    if (!orderFile) {
      setError('Please upload an order history file');
      return;
    }

    if (!useManualPackages && !packageFile) {
      setError('Please upload a package file or use manual entry');
      return;
    }

    if (useManualPackages) {
      const validPackages = manualPackages.filter(pkg => 
        pkg.name && pkg.length && pkg.width && pkg.height
      );
      if (validPackages.length === 0) {
        setError('Please add at least one valid package');
        return;
      }
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      // Read and parse files
      setProgress(10);
      const orderText = await readFileAsText(orderFile);
      const orders = parseOrderCSV(orderText);
      
      setProgress(20);
      let packages: ParsedPackage[];
      if (useManualPackages) {
        packages = createManualPackages();
      } else {
        const packageText = await readFileAsText(packageFile!);
        packages = parsePackageCSV(packageText);
      }

      if (orders.length === 0) {
        throw new Error('No valid orders found in CSV');
      }
      if (packages.length === 0) {
        throw new Error('No valid packages found');
      }

      setProgress(30);

      // Use Web Worker for heavy processing
      workerRef.current = new Worker(
        new URL('../workers/analysisWorker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (e) => {
        const { type, data } = e.data;
        
        if (type === 'progress') {
          setProgress(30 + (data.progress * 0.6)); // 30-90%
        } else if (type === 'complete') {
          setResults(data);
          setProgress(100);
          setProcessing(false);
          workerRef.current?.terminate();
        } else if (type === 'error') {
          setError(data);
          setProcessing(false);
          workerRef.current?.terminate();
        }
      };

      workerRef.current.postMessage({
        orders,
        packages
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setProcessing(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvContent = [
      ['Order ID', 'Recommended Package', 'Fill Rate (%)', 'Efficiency', 'Cost ($)', 'Order Volume (cu in)', 'Package Volume (cu in)'],
      ...results.allocations.map(a => [
        a.orderId,
        a.recommendedPackage,
        a.fillRate.toFixed(1),
        a.efficiency.toFixed(1),
        a.cost.toFixed(2),
        a.orderVolume.toFixed(2),
        a.packageVolume.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client-Side Suite Analyzer</h1>
          <p className="text-gray-600">Pure math calculations - no backend storage required</p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order History Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Order History
              </CardTitle>
              <CardDescription>Upload CSV with Order ID and Volume data</CardDescription>
            </CardHeader>
            <CardContent>
              {!orderFile ? (
                <label className="block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload('order', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click to upload order CSV</p>
                    <p className="text-sm text-gray-500 mt-1">Supports up to 1M+ orders</p>
                  </div>
                </label>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{orderFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileUpload('order', null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Packaging Suite
              </CardTitle>
              <CardDescription>Upload CSV or enter packages manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={!useManualPackages ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseManualPackages(false)}
                  className="flex-1"
                >
                  Upload CSV
                </Button>
                <Button
                  variant={useManualPackages ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseManualPackages(true)}
                  className="flex-1"
                >
                  Manual Entry
                </Button>
              </div>

              {!useManualPackages ? (
                !packageFile ? (
                  <label className="block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload('package', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Upload package CSV</p>
                    </div>
                  </label>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">{packageFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileUpload('package', null)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {manualPackages.map((pkg, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Package {index + 1}</Label>
                        {manualPackages.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePackageRow(index)}
                            className="text-red-600 h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Name"
                          value={pkg.name}
                          onChange={(e) => updatePackageRow(index, 'name', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          placeholder="ID"
                          value={pkg.id}
                          onChange={(e) => updatePackageRow(index, 'id', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          placeholder="L"
                          value={pkg.length}
                          onChange={(e) => updatePackageRow(index, 'length', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="W"
                          value={pkg.width}
                          onChange={(e) => updatePackageRow(index, 'width', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="H"
                          value={pkg.height}
                          onChange={(e) => updatePackageRow(index, 'height', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Cost $"
                          value={pkg.cost}
                          onChange={(e) => updatePackageRow(index, 'cost', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="Max Weight"
                          value={pkg.maxWeight}
                          onChange={(e) => updatePackageRow(index, 'maxWeight', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPackageRow}
                    className="w-full"
                  >
                    + Add Package
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Button */}
        <div className="text-center">
          <Button
            onClick={processAnalysis}
            disabled={processing || !orderFile || (!useManualPackages && !packageFile)}
            size="lg"
            className="px-8"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing... {progress.toFixed(0)}%
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Orders
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{results.summary.totalOrders.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{results.summary.averageFillRate.toFixed(1)}%</div>
                  <p className="text-sm text-gray-600">Avg Fill Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">${results.summary.totalCost.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{results.summary.processingTime}ms</div>
                  <p className="text-sm text-gray-600">Processing Time</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Package Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Package Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={results.packageDistribution}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      >
                        {results.packageDistribution.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Fill Rate Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Fill Rate Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={results.fillRateDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Export Button */}
            <div className="text-center">
              <Button onClick={exportResults} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Results as CSV
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};