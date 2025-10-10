import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  Package,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Search,
  Filter,
  DollarSign,
  Clock,
  Target,
  ChevronDown,
} from 'lucide-react';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

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
  baselineMaterial: number;
  optimizedMaterial: number;
  materialSavings: number;
  materialSavingsPercentage: number;
  packageWeight: number;
}

interface AnalysisResults {
  allocations: AllocationResult[];
  summary: {
    totalOrders: number;
    processedOrders: number;
    averageFillRate: number;
    totalCost: number;
    baselineCost: number;
    savings: number;
    savingsPercentage: number;
    totalMaterial: number;
    baselineMaterial: number;
    materialSavings: number;
    materialSavingsPercentage: number;
    processingTime: number;
    memoryUsed?: number;
    throughput: number;
  };
  packageDistribution: { name: string; count: number; percentage: number; baselinePercentage?: number }[];
  packageCostBreakdown: PackageCostBreakdown[];
  packageMaterialBreakdown: PackageMaterialBreakdown[];
  fillRateDistribution: { range: string; count: number }[];
  volumeDistribution: { range: string; count: number; percentage: number }[];
  efficiency: {
    optimalAllocations: number;
    subOptimalAllocations: number;
    unallocatedOrders: number;
  };
}

interface RouterState {
  analysisResults: AnalysisResults;
  analysisId: string;
  timestamp: string;
}

export default function ClientSideAnalysisResults() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [analysisData, setAnalysisData] = useState<RouterState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [targetFillRate, setTargetFillRate] = useState(75);
  const [showMeetingTarget, setShowMeetingTarget] = useState(false);
  const [showNeedingImprovement, setShowNeedingImprovement] = useState(false);

  // Sort packages in logical order: X-small → Small → Medium → Large → X-large → XX-large
  const sortPackagesBySize = (packages: any[]) => {
    const sizeOrder: { [key: string]: number } = {
      'x-small': 1,
      'xsmall': 1,
      'small': 2,
      'medium': 3,
      'large': 4,
      'x-large': 5,
      'xlarge': 5,
      'xx-large': 6,
      'xxlarge': 6,
      '2xl': 6,
      '2x-large': 6
    };
    return [...packages].sort((a, b) => {
      // Handle different property names for package identification
      const aName = (a.name || a.packageName || '').toLowerCase().trim();
      const bName = (b.name || b.packageName || '').toLowerCase().trim();
      const aSize = sizeOrder[aName] || 999;
      const bSize = sizeOrder[bName] || 999;
      return aSize - bSize;
    });
  };

  useEffect(() => {
    // Load analysis results from React Router state
    const state = location.state as RouterState;
    if (state && state.analysisResults) {
      setAnalysisData(state);
    } else {
      console.error('No analysis data found in navigation state');
    }
    setLoading(false);
  }, [location.state]);

  // Reset to first page when filters change - must be before any conditional returns
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPackage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Results...</h2>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-4">The analysis results could not be found or have expired.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { analysisResults: results } = analysisData;


  // Get unique package types for filter
  const packageTypes = Array.from(new Set(results.allocations.map(a => a.recommendedPackage)));

  // Filter allocations for display
  const filteredAllocations = results.allocations.filter(allocation => {
    const matchesSearch = allocation.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allocation.recommendedPackage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackage = selectedPackage === 'all' || allocation.recommendedPackage === selectedPackage;
    return matchesSearch && matchesPackage;
  });

  // Pagination calculations
  const totalItems = filteredAllocations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAllocations = filteredAllocations.slice(startIndex, endIndex);

  // Export to CSV with comprehensive analysis data
  const exportToCSV = () => {
    // Build comprehensive CSV with multiple sections
    const csvSections: string[] = [];

    // Section 1: Analysis Summary
    csvSections.push('=== ANALYSIS SUMMARY ===');
    csvSections.push('Metric,Value');
    csvSections.push(`Analysis ID,${analysisId}`);
    csvSections.push(`Analysis Date,"${new Date(analysisData.timestamp).toLocaleString()}"`);
    csvSections.push(`Total Orders,${results.summary.totalOrders}`);
    csvSections.push(`Processed Orders,${results.summary.processedOrders}`);
    csvSections.push(`Optimized Average Fill Rate,${results.summary.averageFillRate.toFixed(1)}%`);
    csvSections.push(`Baseline Cost,$${(results.summary.baselineCost || results.summary.totalCost).toFixed(2)}`);
    csvSections.push(`Optimized Cost,$${results.summary.totalCost.toFixed(2)}`);
    csvSections.push(`Total Savings,$${(results.summary.savings || 0).toFixed(2)}`);
    csvSections.push(`Savings Percentage,${(results.summary.savingsPercentage || 0).toFixed(1)}%`);
    csvSections.push(`Processing Speed,${results.summary.throughput} orders/sec`);
    csvSections.push(`Processing Time,${results.summary.processingTime}ms`);
    if (results.summary.memoryUsed) {
      csvSections.push(`Memory Used,${results.summary.memoryUsed}MB`);
    }
    csvSections.push('');

    // Section 2: Package Distribution
    csvSections.push('=== PACKAGE DISTRIBUTION ===');
    csvSections.push('Package Name,Baseline Count,Baseline %,Optimized Count,Optimized %');
    results.packageDistribution.forEach(pkg => {
      const baselineCount = Math.round(results.summary.processedOrders * (pkg.baselinePercentage || 0) / 100);
      csvSections.push(`${pkg.name},${baselineCount},${(pkg.baselinePercentage || 0).toFixed(1)}%,${pkg.count},${pkg.percentage.toFixed(1)}%`);
    });
    csvSections.push('');

    // Section 3: Efficiency Analysis
    csvSections.push('=== EFFICIENCY ANALYSIS ===');
    csvSections.push('Category,Count,Percentage of Processed');
    csvSections.push(
      `Optimal Allocations (Fill Rate ≥75%),${results.efficiency.optimalAllocations},${
        ((results.efficiency.optimalAllocations / results.summary.processedOrders) * 100).toFixed(1)
      }%`
    );
    csvSections.push(
      `Sub-Optimal Allocations (Fill Rate 25-75%),${results.efficiency.subOptimalAllocations},${
        ((results.efficiency.subOptimalAllocations / results.summary.processedOrders) * 100).toFixed(1)
      }%`
    );
    csvSections.push(
      `Unallocated Orders,${results.efficiency.unallocatedOrders},${
        ((results.efficiency.unallocatedOrders / results.summary.totalOrders) * 100).toFixed(1)
      }%`
    );
    csvSections.push('');

    // Section 4: Fill Rate Distribution
    csvSections.push('=== FILL RATE DISTRIBUTION ===');
    csvSections.push('Fill Rate Range,Count');
    results.fillRateDistribution.forEach(dist => {
      csvSections.push(`${dist.range},${dist.count}`);
    });
    csvSections.push('');

    // Section 5: Order Profile Distribution
    if (results.volumeDistribution && results.volumeDistribution.length > 0) {
      csvSections.push('=== ORDER PROFILE DISTRIBUTION ===');
      csvSections.push('Volume Range (cu in),Count,Percentage');
      results.volumeDistribution.forEach(dist => {
        csvSections.push(`${dist.range},${dist.count},${dist.percentage.toFixed(2)}%`);
      });
      csvSections.push('');
    }

    // Section 6: Order Details (use all allocations, not just filtered)
    csvSections.push('=== ORDER ALLOCATION DETAILS ===');
    csvSections.push(`Total Records,${results.allocations.length}`);
    csvSections.push('');

    const headers = [
      'Order ID', 'Recommended Package', 'Order Volume (in³)', 'Package Volume (in³)',
      'Fill Rate (%)', 'Cost ($)'
    ];
    csvSections.push(headers.join(','));

    // Use all allocations for export, not just filtered ones
    results.allocations.forEach(allocation => {
      const row = [
        allocation.orderId,
        allocation.recommendedPackage,
        allocation.orderVolume.toFixed(2),
        allocation.packageVolume.toFixed(2),
        allocation.fillRate.toFixed(1),
        allocation.cost.toFixed(2)
      ];
      csvSections.push(row.join(','));
    });

    // Create and download the CSV file
    const csv = csvSections.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suite-analysis-${analysisId}-${new Date().toISOString().split('T')[0]}-complete.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  Suite Analysis Results
                </h1>
                <p className="text-gray-600 mt-1">
                  Completed on {new Date(analysisData.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Analysis Complete
              </Badge>

              <Button onClick={exportToCSV} disabled={results.allocations.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orders Processed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {results.summary.processedOrders.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of {results.summary.totalOrders.toLocaleString()} total
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Optimized Average Fill Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {results.summary.averageFillRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Package utilization</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Optimized Cost</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    ${results.summary.totalCost.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Package allocation</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing Speed</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {results.summary.throughput.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">orders per second</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Distribution Comparison */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Package Distribution Comparison</CardTitle>
              <CardDescription>Baseline vs AI-optimized package usage</CardDescription>
            </CardHeader>
            <CardContent>
              {results.packageDistribution.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sortPackagesBySize(results.packageDistribution).map(pkg => ({
                          name: pkg.name,
                          Baseline: pkg.baselinePercentage || 0,
                          Optimized: pkg.percentage,
                          baselineCount: Math.round(results.summary.processedOrders * (pkg.baselinePercentage || 0) / 100),
                          optimizedCount: pkg.count
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                          formatter={(value: number, name: string, props: any) => [
                            `${value.toFixed(1)}% (${name === 'Baseline' ? props.payload.baselineCount : props.payload.optimizedCount} orders)`,
                            name
                          ]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Baseline" fill="#94a3b8" />
                        <Bar dataKey="Optimized" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Order Count Summary */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sortPackagesBySize(results.packageDistribution).map((pkg) => {
                      const baselineCount = Math.round(results.summary.processedOrders * (pkg.baselinePercentage || 0) / 100);
                      const optimizedCount = pkg.count;

                      return (
                        <div key={pkg.name} className="bg-gray-50 rounded-lg p-4 border">
                          <h5 className="font-semibold text-gray-900 mb-2">{pkg.name}</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Baseline:</span>
                              <span className="font-medium text-gray-800">
                                {baselineCount} orders ({(pkg.baselinePercentage || 0).toFixed(1)}%)
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Optimized:</span>
                              <span className="font-medium text-blue-600">
                                {optimizedCount} orders ({pkg.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No distribution data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Profile Distribution */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Volume Analysis</CardTitle>
              <CardDescription>Understanding your order size distribution patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {results.volumeDistribution && results.volumeDistribution.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {(() => {
                      const totalOrders = results.volumeDistribution.reduce((sum, d) => sum + d.count, 0);
                      const volumeData = results.volumeDistribution.map(d => ({
                        midpoint: parseFloat(d.range.split('-')[0]) + (parseFloat(d.range.split('-')[1] || d.range.split('-')[0]) - parseFloat(d.range.split('-')[0])) / 2,
                        count: d.count
                      }));
                      const totalVolume = volumeData.reduce((sum, d) => sum + (d.midpoint * d.count), 0);
                      const avgVolume = totalVolume / totalOrders;

                      const sortedByCount = [...results.volumeDistribution].sort((a, b) => b.count - a.count);
                      const topRange = sortedByCount[0];

                      const smallOrders = results.volumeDistribution.filter(d => {
                        const max = parseFloat(d.range.split('-')[1] || d.range.split('-')[0]);
                        return max <= 100;
                      }).reduce((sum, d) => sum + d.count, 0);

                      return (
                        <>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-1">Average Volume</p>
                            <p className="text-2xl font-bold text-blue-700">{avgVolume.toFixed(1)}</p>
                            <p className="text-xs text-blue-600 mt-1">cubic inches</p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <p className="text-sm font-medium text-purple-900 mb-1">Most Common Range</p>
                            <p className="text-2xl font-bold text-purple-700">{topRange.range}</p>
                            <p className="text-xs text-purple-600 mt-1">{topRange.percentage.toFixed(1)}% of orders</p>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <p className="text-sm font-medium text-green-900 mb-1">Small Orders</p>
                            <p className="text-2xl font-bold text-green-700">{((smallOrders / totalOrders) * 100).toFixed(1)}%</p>
                            <p className="text-xs text-green-600 mt-1">≤100 cu in</p>
                          </div>

                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                            <p className="text-sm font-medium text-orange-900 mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-orange-700">{totalOrders.toLocaleString()}</p>
                            <p className="text-xs text-orange-600 mt-1">in dataset</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Simplified Chart - Show top 15 ranges only */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">Volume Distribution</h4>
                      <p className="text-xs text-gray-500">Top volume ranges by order count</p>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[...results.volumeDistribution]
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 15)}
                          margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                        >
                          <defs>
                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis
                            dataKey="range"
                            tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                            height={60}
                            stroke="#6b7280"
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="#6b7280"
                            label={{
                              value: 'Orders',
                              angle: -90,
                              position: 'insideLeft',
                              style: { fontSize: 12, fill: '#6b7280' }
                            }}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-900 mb-2">
                                      {payload[0].payload.range} cu in
                                    </p>
                                    <div className="space-y-1">
                                      <p className="text-sm text-gray-700">
                                        <span className="font-medium">{payload[0].value}</span> orders
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {payload[0].payload.percentage.toFixed(2)}% of total
                                      </p>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="url(#colorVolume)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={60}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Showing top 15 volume ranges by order count
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No order profile distribution data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cost Savings Analysis */}
        {(results.summary.baselineCost > 0 || results.packageCostBreakdown?.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Cost Savings Analysis
              </CardTitle>
              <CardDescription>
                Comparison between baseline distribution and AI-optimized allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600">Baseline Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">
                    ${(results.summary.baselineCost || results.summary.totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Using historical package distribution</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm font-medium text-purple-600">Optimized Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    ${results.summary.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-purple-500 mt-1">With AI optimization</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-600">Total Savings</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ${(results.summary.savings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-700">
                    {(results.summary.savingsPercentage || 0).toFixed(1)}% reduction
                  </Badge>
                </div>
              </div>

              {/* Visual Bar Comparison */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">Cost Comparison Visualization</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Baseline</span>
                      <span className="font-medium">${(results.summary.baselineCost || results.summary.totalCost).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div className="bg-gray-500 h-6 rounded-full flex items-center justify-end pr-2" style={{ width: '100%' }}>
                        <span className="text-xs text-white">100%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-purple-600">Optimized</span>
                      <span className="font-medium">${results.summary.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(((results.summary.totalCost / (results.summary.baselineCost || results.summary.totalCost)) * 100), 100).toFixed(0)}%` }}
                      >
                        <span className="text-xs text-white">
                          {((results.summary.totalCost / (results.summary.baselineCost || results.summary.totalCost)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-Package Cost Breakdown Table */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">Per-Package Cost Breakdown</p>
                {results.packageCostBreakdown && results.packageCostBreakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Package Type</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Unit Cost</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Baseline Orders</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Optimized Orders</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Baseline Cost</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Optimized Cost</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Savings</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Savings %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortPackagesBySize(results.packageCostBreakdown).map((pkg, index) => {
                          const isPositiveSavings = pkg.savings > 0;
                          const isZeroSavings = pkg.savings === 0;

                          return (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium text-gray-900">{pkg.packageName}</td>
                              <td className="text-center py-3 px-2 text-gray-600">${pkg.packageCost.toFixed(2)}</td>
                              <td className="text-center py-3 px-2 text-gray-600">{pkg.baselineOrders.toLocaleString()}</td>
                              <td className="text-center py-3 px-2 text-purple-600 font-medium">{pkg.optimizedOrders.toLocaleString()}</td>
                              <td className="text-right py-3 px-2 text-gray-600">${pkg.baselineCost.toFixed(2)}</td>
                              <td className="text-right py-3 px-2 text-purple-600 font-medium">${pkg.optimizedCost.toFixed(2)}</td>
                              <td className={`text-right py-3 px-2 font-medium ${
                                isPositiveSavings ? 'text-green-600' :
                                isZeroSavings ? 'text-gray-600' : 'text-red-600'
                              }`}>
                                {isPositiveSavings ? '+' : ''}${pkg.savings.toFixed(2)}
                              </td>
                              <td className="text-center py-3 px-2">
                                <Badge
                                  className={`text-xs ${
                                    isPositiveSavings ? 'bg-green-100 text-green-700' :
                                    isZeroSavings ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {isPositiveSavings ? '+' : ''}{pkg.savingsPercentage.toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 bg-gray-50 font-medium">
                          <td className="py-3 px-2 text-gray-900">TOTAL</td>
                          <td className="text-center py-3 px-2">-</td>
                          <td className="text-center py-3 px-2 text-gray-700">
                            {results.packageCostBreakdown.reduce((sum, pkg) => sum + pkg.baselineOrders, 0).toLocaleString()}
                          </td>
                          <td className="text-center py-3 px-2 text-purple-600">
                            {results.packageCostBreakdown.reduce((sum, pkg) => sum + pkg.optimizedOrders, 0).toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-2 text-gray-700">
                            ${results.packageCostBreakdown.reduce((sum, pkg) => sum + pkg.baselineCost, 0).toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-2 text-purple-600">
                            ${results.packageCostBreakdown.reduce((sum, pkg) => sum + pkg.optimizedCost, 0).toFixed(2)}
                          </td>
                          <td className={`text-right py-3 px-2 font-bold ${
                            results.summary.savings > 0 ? 'text-green-600' :
                            results.summary.savings === 0 ? 'text-gray-600' : 'text-red-600'
                          }`}>
                            {results.summary.savings > 0 ? '+' : ''}${results.summary.savings.toFixed(2)}
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge className={`text-xs font-bold ${
                              results.summary.savings > 0 ? 'bg-green-100 text-green-700' :
                              results.summary.savings === 0 ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                            }`}>
                              {results.summary.savings > 0 ? '+' : ''}{(results.summary.savingsPercentage || 0).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">Per-package breakdown not available</p>
                    <p className="text-sm">Run a new analysis to see detailed cost breakdown by package type</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Material Usage Analysis */}
        {(results.summary.baselineMaterial > 0 || results.packageMaterialBreakdown?.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Material Usage Analysis
              </CardTitle>
              <CardDescription>
                Comparison of packaging material consumption between baseline and optimized allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600">Baseline Material</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">
                    {(results.summary.baselineMaterial || results.summary.totalMaterial || 0).toFixed(3)} lbs
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Using historical package distribution</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-medium text-blue-600">Optimized Material</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {(results.summary.totalMaterial || 0).toFixed(3)} lbs
                  </p>
                  <p className="text-xs text-blue-500 mt-1">With AI optimization</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-600">Material Savings</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {(results.summary.materialSavings || 0).toFixed(3)} lbs
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-700">
                    {(results.summary.materialSavingsPercentage || 0).toFixed(1)}% reduction
                  </Badge>
                </div>
              </div>

              {/* Visual Bar Comparison for Material */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">Material Usage Comparison</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Baseline Material</span>
                      <span className="font-medium">{(results.summary.baselineMaterial || results.summary.totalMaterial || 0).toFixed(3)} lbs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div className="bg-gray-500 h-6 rounded-full flex items-center justify-end pr-2" style={{ width: '100%' }}>
                        <span className="text-xs text-white">100%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-600">Optimized Material</span>
                      <span className="font-medium">{(results.summary.totalMaterial || 0).toFixed(3)} lbs</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(((results.summary.totalMaterial || 0) / (results.summary.baselineMaterial || results.summary.totalMaterial || 1) * 100), 100).toFixed(0)}%` }}
                      >
                        <span className="text-xs text-white">
                          {((results.summary.totalMaterial || 0) / (results.summary.baselineMaterial || results.summary.totalMaterial || 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-Package Material Breakdown Table */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">Per-Package Material Breakdown</p>
                {results.packageMaterialBreakdown && results.packageMaterialBreakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Package Type</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Unit Weight (lbs)</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Baseline Orders</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Optimized Orders</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Baseline Material</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Optimized Material</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Material Savings</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Savings %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortPackagesBySize(results.packageMaterialBreakdown).map((pkg, index) => {
                          const isPositiveSavings = pkg.materialSavings > 0;
                          const isZeroSavings = pkg.materialSavings === 0;

                          return (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium text-gray-900">{pkg.packageName}</td>
                              <td className="text-center py-3 px-2 text-gray-600">{pkg.packageWeight.toFixed(3)}</td>
                              <td className="text-center py-3 px-2 text-gray-600">{pkg.baselineOrders.toLocaleString()}</td>
                              <td className="text-center py-3 px-2 text-blue-600 font-medium">{pkg.optimizedOrders.toLocaleString()}</td>
                              <td className="text-right py-3 px-2 text-gray-600">{pkg.baselineMaterial.toFixed(3)} lbs</td>
                              <td className="text-right py-3 px-2 text-blue-600 font-medium">{pkg.optimizedMaterial.toFixed(3)} lbs</td>
                              <td className={`text-right py-3 px-2 font-medium ${
                                isPositiveSavings ? 'text-green-600' :
                                isZeroSavings ? 'text-gray-600' : 'text-red-600'
                              }`}>
                                {isPositiveSavings ? '+' : ''}{pkg.materialSavings.toFixed(3)} lbs
                              </td>
                              <td className="text-center py-3 px-2">
                                <Badge
                                  className={`text-xs ${
                                    isPositiveSavings ? 'bg-green-100 text-green-700' :
                                    isZeroSavings ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {isPositiveSavings ? '+' : ''}{pkg.materialSavingsPercentage.toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 bg-gray-50 font-medium">
                          <td className="py-3 px-2 text-gray-900">TOTAL</td>
                          <td className="text-center py-3 px-2">-</td>
                          <td className="text-center py-3 px-2 text-gray-700">
                            {(results.packageMaterialBreakdown?.reduce((sum, pkg) => sum + pkg.baselineOrders, 0) || 0).toLocaleString()}
                          </td>
                          <td className="text-center py-3 px-2 text-blue-600">
                            {(results.packageMaterialBreakdown?.reduce((sum, pkg) => sum + pkg.optimizedOrders, 0) || 0).toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-2 text-gray-700">
                            {(results.packageMaterialBreakdown?.reduce((sum, pkg) => sum + pkg.baselineMaterial, 0) || 0).toFixed(3)} lbs
                          </td>
                          <td className="text-right py-3 px-2 text-blue-600">
                            {(results.packageMaterialBreakdown?.reduce((sum, pkg) => sum + pkg.optimizedMaterial, 0) || 0).toFixed(3)} lbs
                          </td>
                          <td className={`text-right py-3 px-2 font-bold ${
                            (results.summary.materialSavings || 0) > 0 ? 'text-green-600' :
                            (results.summary.materialSavings || 0) === 0 ? 'text-gray-600' : 'text-red-600'
                          }`}>
                            {(results.summary.materialSavings || 0) > 0 ? '+' : ''}{(results.summary.materialSavings || 0).toFixed(3)} lbs
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge className={`text-xs font-bold ${
                              (results.summary.materialSavings || 0) > 0 ? 'bg-green-100 text-green-700' :
                              (results.summary.materialSavings || 0) === 0 ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                            }`}>
                              {(results.summary.materialSavings || 0) > 0 ? '+' : ''}{(results.summary.materialSavingsPercentage || 0).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">Per-package material breakdown not available</p>
                    <p className="text-sm">Run a new analysis to see detailed material usage by package type</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fill Rate Target Analyzer */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Fill Rate Target Analyzer
            </CardTitle>
            <CardDescription>
              Adjust your target fill rate to get specific package optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fill Rate Slider */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-900">Target Fill Rate</label>
                <Badge className="bg-purple-600 text-white text-lg px-4 py-2 font-bold">
                  {targetFillRate}%
                </Badge>
              </div>

              <div className="space-y-4">
                <Slider
                  value={[targetFillRate]}
                  onValueChange={(value) => setTargetFillRate(value[0])}
                  max={90}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>50% - Conservative</span>
                  <span>65% - Balanced</span>
                  <span>75% - Efficient</span>
                  <span>90% - Maximum</span>
                </div>
              </div>
            </div>

            {/* Analysis & Recommendations */}
            {(() => {
              // Calculate current performance against target and collect order details
              const currentPerformance = results.allocations.reduce((acc, allocation) => {
                const packageName = allocation.recommendedPackage;
                const meetsTarget = allocation.fillRate >= targetFillRate;

                if (!acc.packages[packageName]) {
                  acc.packages[packageName] = {
                    orders: 0,
                    meetingTarget: 0,
                    fillRates: [],
                    volumes: [],
                    costs: []
                  };
                }

                acc.packages[packageName].orders++;
                acc.packages[packageName].fillRates.push(allocation.fillRate);
                acc.packages[packageName].volumes.push(allocation.orderVolume);
                acc.packages[packageName].costs.push(allocation.cost);

                if (meetsTarget) {
                  acc.packages[packageName].meetingTarget++;
                  acc.totalMeetingTarget++;
                  acc.ordersMeetingTarget.push(allocation);
                } else {
                  acc.ordersNeedingImprovement.push(allocation);
                }

                acc.totalOrders++;
                return acc;
              }, {
                totalOrders: 0,
                totalMeetingTarget: 0,
                ordersMeetingTarget: [] as AllocationResult[],
                ordersNeedingImprovement: [] as AllocationResult[],
                packages: {} as Record<string, {
                  orders: number;
                  meetingTarget: number;
                  fillRates: number[];
                  volumes: number[];
                  costs: number[];
                }>
              });

              // Analyze each package and generate recommendations
              const packageRecommendations = Object.entries(currentPerformance.packages).map(([packageName, data]) => {
                const avgFillRate = data.fillRates.reduce((sum, rate) => sum + rate, 0) / data.fillRates.length;
                const successRate = (data.meetingTarget / data.orders) * 100;
                const avgVolume = data.volumes.reduce((sum, vol) => sum + vol, 0) / data.volumes.length;
                const avgCost = data.costs.reduce((sum, cost) => sum + cost, 0) / data.costs.length;

                // Calculate optimal dimensions for this package's orders
                const optimalVolume = avgVolume / (targetFillRate / 100); // Volume needed for target fill rate
                const cubicRoot = Math.cbrt(optimalVolume);

                // Generate recommendations based on performance
                let recommendation: {
                  type: string;
                  priority: string;
                  action: string;
                  reason: string;
                  suggestion: string;
                  impact: string;
                  expectedFillRate: string;
                };

                if (successRate < 30) {
                  // Poor performance - major changes needed
                  recommendation = {
                    type: 'optimize',
                    priority: 'high',
                    action: `Redesign ${packageName} package`,
                    reason: `Only ${successRate.toFixed(0)}% of orders meet your ${targetFillRate}% target`,
                    suggestion: `Reduce dimensions to approximately ${Math.ceil(cubicRoot * 1.1)}" × ${Math.ceil(cubicRoot * 0.95)}" × ${Math.ceil(cubicRoot * 0.95)}"`,
                    impact: `Could improve fill rate for ${data.orders} orders`,
                    expectedFillRate: `${avgFillRate.toFixed(0)}% → ${Math.min(targetFillRate + 5, 95)}%`
                  };
                } else if (successRate < 60) {
                  // Moderate performance - minor adjustments
                  const reductionPercent = ((100 - avgFillRate) * 0.6).toFixed(0);
                  recommendation = {
                    type: 'adjust',
                    priority: 'medium',
                    action: `Optimize ${packageName} dimensions`,
                    reason: `${successRate.toFixed(0)}% success rate - room for improvement`,
                    suggestion: `Reduce package size by ~${reductionPercent}% to better fit orders`,
                    impact: `Affects ${data.orders} orders (${((data.orders / results.allocations.length) * 100).toFixed(0)}% of total)`,
                    expectedFillRate: `${avgFillRate.toFixed(0)}% → ${Math.min(avgFillRate + 10, targetFillRate + 5)}%`
                  };
                } else if (successRate >= 80) {
                  // Good performance - keep as is
                  recommendation = {
                    type: 'keep',
                    priority: 'low',
                    action: `Keep ${packageName} as-is`,
                    reason: `${successRate.toFixed(0)}% success rate - performing well`,
                    suggestion: `Current dimensions are optimal for your target`,
                    impact: `Successfully handles ${data.meetingTarget} orders`,
                    expectedFillRate: `${avgFillRate.toFixed(0)}% (target achieved)`
                  };
                } else {
                  // Decent performance - minor tweaks
                  recommendation = {
                    type: 'tweak',
                    priority: 'low',
                    action: `Fine-tune ${packageName}`,
                    reason: `${successRate.toFixed(0)}% success rate - close to target`,
                    suggestion: `Small dimension adjustments could push you over the target`,
                    impact: `Minor improvements for ${data.orders} orders`,
                    expectedFillRate: `${avgFillRate.toFixed(0)}% → ${targetFillRate}%`
                  };
                }

                return {
                  packageName,
                  orders: data.orders,
                  avgFillRate,
                  successRate,
                  avgCost,
                  type: recommendation.type,
                  priority: recommendation.priority,
                  action: recommendation.action,
                  reason: recommendation.reason,
                  suggestion: recommendation.suggestion,
                  impact: recommendation.impact,
                  expectedFillRate: recommendation.expectedFillRate
                };
              }).sort((a, b) => {
                // Sort by priority: high > medium > low
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              });

              const overallSuccessRate = (currentPerformance.totalMeetingTarget / currentPerformance.totalOrders) * 100;

              return (
                <div className="space-y-6">
                  {/* Current Performance Summary */}
                  <div className="bg-white border rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-3">Performance at {targetFillRate}% Target</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowMeetingTarget(!showMeetingTarget)}
                        className="text-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 hover:border-blue-300"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {currentPerformance.totalMeetingTarget}
                          </div>
                          <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${showMeetingTarget ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="text-sm text-blue-800">Orders Meeting Target</div>
                        <div className="text-xs text-blue-600">{overallSuccessRate.toFixed(1)}% success rate</div>
                      </button>
                      <button
                        onClick={() => setShowNeedingImprovement(!showNeedingImprovement)}
                        className="text-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200 hover:border-orange-300"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="text-2xl font-bold text-orange-600">
                            {currentPerformance.totalOrders - currentPerformance.totalMeetingTarget}
                          </div>
                          <ChevronDown className={`h-4 w-4 text-orange-600 transition-transform ${showNeedingImprovement ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="text-sm text-orange-800">Orders Need Improvement</div>
                        <div className="text-xs text-orange-600">{(100 - overallSuccessRate).toFixed(1)}% need optimization</div>
                      </button>
                    </div>

                    {/* Expandable Order Details */}
                    {showMeetingTarget && (
                      <div className="mt-4 p-4 bg-blue-25 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-3">Orders Meeting {targetFillRate}% Target</h5>
                        <div className="max-h-48 overflow-y-auto">
                          <div className="grid gap-2">
                            {currentPerformance.ordersMeetingTarget.slice(0, 20).map((order, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                                <span className="font-medium text-gray-900">{order.orderId}</span>
                                <div className="flex gap-3 text-xs text-gray-600">
                                  <span>{order.recommendedPackage}</span>
                                  <span className="font-medium text-green-600">{order.fillRate.toFixed(1)}%</span>
                                </div>
                              </div>
                            ))}
                            {currentPerformance.ordersMeetingTarget.length > 20 && (
                              <div className="text-xs text-blue-600 text-center py-2">
                                Showing first 20 of {currentPerformance.ordersMeetingTarget.length} orders
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {showNeedingImprovement && (
                      <div className="mt-4 p-4 bg-orange-25 border border-orange-200 rounded-lg">
                        <h5 className="font-medium text-orange-900 mb-3">Orders Needing Improvement</h5>
                        <div className="max-h-48 overflow-y-auto">
                          <div className="grid gap-2">
                            {currentPerformance.ordersNeedingImprovement.slice(0, 20).map((order, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                                <span className="font-medium text-gray-900">{order.orderId}</span>
                                <div className="flex gap-3 text-xs text-gray-600">
                                  <span>{order.recommendedPackage}</span>
                                  <span className="font-medium text-red-600">{order.fillRate.toFixed(1)}%</span>
                                  <span className="text-gray-500">Gap: {(targetFillRate - order.fillRate).toFixed(1)}%</span>
                                </div>
                              </div>
                            ))}
                            {currentPerformance.ordersNeedingImprovement.length > 20 && (
                              <div className="text-xs text-orange-600 text-center py-2">
                                Showing first 20 of {currentPerformance.ordersNeedingImprovement.length} orders
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Package Recommendations */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Package Optimization Recommendations</h4>
                    <div className="space-y-4">
                      {sortPackagesBySize(packageRecommendations).map((rec) => {
                        const getStyle = () => {
                          switch (rec.type) {
                            case 'optimize':
                              return {
                                bgColor: 'bg-red-50 border-red-200',
                                iconColor: 'bg-red-600',
                                badgeColor: 'bg-red-100 text-red-800'
                              };
                            case 'adjust':
                              return {
                                bgColor: 'bg-yellow-50 border-yellow-200',
                                iconColor: 'bg-yellow-600',
                                badgeColor: 'bg-yellow-100 text-yellow-800'
                              };
                            case 'keep':
                              return {
                                bgColor: 'bg-green-50 border-green-200',
                                iconColor: 'bg-green-600',
                                badgeColor: 'bg-green-100 text-green-800'
                              };
                            default:
                              return {
                                bgColor: 'bg-blue-50 border-blue-200',
                                iconColor: 'bg-blue-600',
                                badgeColor: 'bg-blue-100 text-blue-800'
                              };
                          }
                        };

                        const style = getStyle();

                        return (
                          <div key={rec.packageName} className={`${style.bgColor} border rounded-lg p-5`}>
                            <div className="flex items-start gap-4">
                              <div className={`${style.iconColor} rounded-full p-2 flex-shrink-0`}>
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900">{rec.action}</h5>
                                  <Badge className={`${style.badgeColor} text-xs px-2 py-1`}>
                                    {rec.priority.toUpperCase()} PRIORITY
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{rec.reason}</p>

                                <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-3">
                                  <p className="text-sm font-medium text-gray-900 mb-1">💡 Recommendation:</p>
                                  <p className="text-sm text-gray-800">{rec.suggestion}</p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>Impact: {rec.impact}</span>
                                  <span>Expected: {rec.expectedFillRate}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Unallocated Orders Warning */}
        {results.efficiency.unallocatedOrders > 0 && (
          <Alert className={`mb-6 ${
            (results.efficiency.unallocatedOrders / results.summary.totalOrders * 100) >= 5
              ? 'border-red-500 bg-red-50'
              : 'border-yellow-500 bg-yellow-50'
          }`}>
            <AlertCircle className={`h-5 w-5 ${
              (results.efficiency.unallocatedOrders / results.summary.totalOrders * 100) >= 5
                ? 'text-red-600'
                : 'text-yellow-600'
            }`} />
            <AlertTitle className={`text-base font-semibold ${
              (results.efficiency.unallocatedOrders / results.summary.totalOrders * 100) >= 5
                ? 'text-red-900'
                : 'text-yellow-900'
            }`}>
              {results.efficiency.unallocatedOrders.toLocaleString()} Orders Could Not Be Processed
              <span className="ml-2 text-sm font-normal">
                ({((results.efficiency.unallocatedOrders / results.summary.totalOrders) * 100).toFixed(1)}% of total orders)
              </span>
            </AlertTitle>
            <AlertDescription className={`mt-3 space-y-3 ${
              (results.efficiency.unallocatedOrders / results.summary.totalOrders * 100) >= 5
                ? 'text-red-800'
                : 'text-yellow-800'
            }`}>
              <p className="font-medium">These orders were skipped because:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Order volume data is missing, zero, or invalid</li>
                <li>Order is too large for all available packages in your suite</li>
              </ul>
              <div className="pt-2 border-t border-current opacity-50">
                <p className="font-medium">Recommended Actions:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Review your order CSV file for missing or invalid volume data</li>
                  <li>Consider adding larger package options to accommodate oversized orders</li>
                  <li>Check the CSV export for detailed breakdown of unallocated orders</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Order Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Complete analysis results for all {results.summary.processedOrders.toLocaleString()} processed orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by Order ID or Package Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Packages</option>
                  {packageTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Package</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Order Volume</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Package Volume</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fill Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAllocations.map((allocation, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{allocation.orderId}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{allocation.recommendedPackage}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{allocation.orderVolume.toFixed(1)} in³</td>
                      <td className="py-3 px-4 text-gray-600">{allocation.packageVolume.toFixed(1)} in³</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          allocation.fillRate >= 75 ? 'text-green-600' :
                          allocation.fillRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {allocation.fillRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">${allocation.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-4 px-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems.toLocaleString()} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {filteredAllocations.length === 0 && results.allocations.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  No orders match your search criteria
                </div>
              )}

              {results.allocations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No allocations found in analysis results
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}