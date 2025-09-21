import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Package,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Clock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
    memoryUsed?: number;
    throughput: number;
  };
  packageDistribution: { name: string; count: number; percentage: number }[];
  fillRateDistribution: { range: string; count: number }[];
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

  // Calculate chart data
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

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
    csvSections.push(`Total Orders,${results.summary.totalOrders.toLocaleString()}`);
    csvSections.push(`Processed Orders,${results.summary.processedOrders.toLocaleString()}`);
    csvSections.push(`Average Fill Rate,${results.summary.averageFillRate.toFixed(1)}%`);
    csvSections.push(`Total Cost,$${results.summary.totalCost.toFixed(2)}`);
    csvSections.push(`Processing Speed,"${results.summary.throughput.toLocaleString()} orders/sec"`);
    csvSections.push(`Processing Time,${results.summary.processingTime}ms`);
    if (results.summary.memoryUsed) {
      csvSections.push(`Memory Used,${results.summary.memoryUsed}MB`);
    }
    csvSections.push('');

    // Section 2: Package Distribution
    csvSections.push('=== PACKAGE DISTRIBUTION ===');
    csvSections.push('Package Name,Count,Percentage');
    results.packageDistribution.forEach(pkg => {
      csvSections.push(`${pkg.name},${pkg.count.toLocaleString()},${pkg.percentage.toFixed(1)}%`);
    });
    csvSections.push('');

    // Section 3: Efficiency Analysis
    csvSections.push('=== EFFICIENCY ANALYSIS ===');
    csvSections.push('Category,Count,Percentage of Processed');
    csvSections.push(
      `Optimal Allocations (Fill Rate ≥75%),${results.efficiency.optimalAllocations.toLocaleString()},${
        ((results.efficiency.optimalAllocations / results.summary.processedOrders) * 100).toFixed(1)
      }%`
    );
    csvSections.push(
      `Sub-Optimal Allocations (Fill Rate 25-75%),${results.efficiency.subOptimalAllocations.toLocaleString()},${
        ((results.efficiency.subOptimalAllocations / results.summary.processedOrders) * 100).toFixed(1)
      }%`
    );
    csvSections.push(
      `Unallocated Orders,${results.efficiency.unallocatedOrders.toLocaleString()},${
        ((results.efficiency.unallocatedOrders / results.summary.totalOrders) * 100).toFixed(1)
      }%`
    );
    csvSections.push('');

    // Section 4: Fill Rate Distribution
    csvSections.push('=== FILL RATE DISTRIBUTION ===');
    csvSections.push('Fill Rate Range,Count');
    results.fillRateDistribution.forEach(dist => {
      csvSections.push(`${dist.range},${dist.count.toLocaleString()}`);
    });
    csvSections.push('');

    // Section 5: Order Details (use all allocations, not just filtered)
    csvSections.push('=== ORDER ALLOCATION DETAILS ===');
    csvSections.push(`Total Records,${results.allocations.length.toLocaleString()}`);
    csvSections.push('');

    const headers = [
      'Order ID', 'Recommended Package', 'Order Volume (in³)', 'Package Volume (in³)',
      'Fill Rate (%)', 'Efficiency', 'Cost ($)'
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
        allocation.efficiency.toFixed(2),
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
                  <p className="text-sm font-medium text-gray-600">Average Fill Rate</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
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

        {/* Package Distribution and Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Package Distribution</CardTitle>
              <CardDescription>Recommended packages for your orders</CardDescription>
            </CardHeader>
            <CardContent>
              {results.packageDistribution.length > 0 ? (
                <>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results.packageDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                        >
                          {results.packageDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {results.packageDistribution.map((pkg, index) => (
                      <div key={pkg.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                          />
                          <span>{pkg.name}</span>
                        </div>
                        <span className="font-medium">{pkg.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No package data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Efficiency Analysis</CardTitle>
              <CardDescription>Package allocation efficiency breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Optimal Allocations</p>
                      <p className="text-sm text-green-700">Fill rate ≥ 75%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {results.efficiency.optimalAllocations.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">
                      {((results.efficiency.optimalAllocations / results.summary.processedOrders) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Sub-Optimal</p>
                      <p className="text-sm text-yellow-700">Fill rate 25-75%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">
                      {results.efficiency.subOptimalAllocations.toLocaleString()}
                    </p>
                    <p className="text-sm text-yellow-600">
                      {((results.efficiency.subOptimalAllocations / results.summary.processedOrders) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {results.efficiency.unallocatedOrders > 0 && (
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-red-900">Unallocated</p>
                        <p className="text-sm text-red-700">No suitable package</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {results.efficiency.unallocatedOrders.toLocaleString()}
                      </p>
                      <p className="text-sm text-red-600">
                        {((results.efficiency.unallocatedOrders / results.summary.totalOrders) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Efficiency</th>
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
                      <td className="py-3 px-4 text-gray-600">{allocation.efficiency.toFixed(2)}</td>
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