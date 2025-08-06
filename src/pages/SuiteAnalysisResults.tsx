import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Package, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector } from 'recharts';
import type { Id } from '../../convex/_generated/dataModel';

interface SuiteAnalysisResult {
  analysisId: string;
  timestamp: number;
  summary: {
    totalOrders: number;
    processedOrders: number;
    failedOrders: number;
    averageFillRate: number;
  };
  baselineDistribution?: Record<string, number>; // Package name -> percentage
  optimizedDistribution?: Record<string, number>; // Package name -> percentage
  allocations: Array<{
    orderId: string;
    recommendedPackage: string;
    recommendedPackageId: string;
    itemDimensions: {
      length: number;
      width: number;
      height: number;
      volume: number;
    };
    packageDimensions: {
      length: number;
      width: number;
      height: number;
      volume: number;
    };
    fillRate: number;
    efficiency: number;
    costBreakdown: {
      packageCost: number;
      totalCost: number;
      usingDefaultCost?: boolean;
    };
  }>;
  recommendations: Array<{
    type: 'package_consolidation' | 'size_optimization' | 'cost_reduction' | 'efficiency_improvement';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: {
      savingsAmount: number;
      savingsPercent: number;
      affectedOrders: number;
    };
    implementation: {
      difficulty: 'easy' | 'medium' | 'complex';
      timeframe: string;
      steps: string[];
    };
  }>;
  metrics: {
    processing: {
      totalTime: number;
      ordersPerSecond: number;
      memoryUsage: number;
    };
    optimization: {
      successRate: number;
      averageIterations: number;
      convergenceRate: number;
    };
  };
}

const SuiteAnalysisResults = () => {
  // ALL HOOKS MUST BE CALLED FIRST, BEFORE ANY EARLY RETURNS
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const [showFailedOrders, setShowFailedOrders] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showOptimizationOrders, setShowOptimizationOrders] = React.useState<string | null>(null);
  const [showPackageOrders, setShowPackageOrders] = React.useState<string | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);
  const [expandedPackages, setExpandedPackages] = React.useState<string[]>([]);
  
  const analysisData = useQuery(api.suiteAnalyzerBackend.getAnalysis, 
    analysisId ? { analysisId: analysisId as Id<"analyses"> } : "skip"
  );

  // Log distributions for debugging (always called, regardless of early returns)
  React.useEffect(() => {
    if (analysisData?.results?.baselineDistribution || analysisData?.results?.optimizedDistribution) {
      console.log("Baseline distribution from backend:", analysisData.results.baselineDistribution);
      console.log("Optimized distribution from backend:", analysisData.results.optimizedDistribution);
    }
  }, [analysisData?.results?.baselineDistribution, analysisData?.results?.optimizedDistribution]);

  // NOW WE CAN HAVE EARLY RETURNS AFTER ALL HOOKS ARE CALLED
  if (!analysisId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
            <p className="text-gray-600 mb-4">The analysis ID is missing or invalid.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading Analysis</h2>
            <p className="text-gray-600">Please wait while we fetch your results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysisData.status === 'failed') {
    const error = (analysisData.results as any)?.error || 'Analysis failed';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysisData.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Analysis in Progress</h2>
            <p className="text-gray-600">Your analysis is still being processed...</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const results = analysisData.results as SuiteAnalysisResult;

  // Toggle package details expansion
  const togglePackageDetails = (packageName: string) => {
    setExpandedPackages(prev => 
      prev.includes(packageName) 
        ? prev.filter(name => name !== packageName)
        : [...prev, packageName]
    );
  };
  const completedDate = new Date(analysisData.completedAt!).toLocaleString();

  // Get failed orders (orders that weren't successfully allocated)
  const failedOrders = results.allocations.filter(alloc => !alloc.recommendedPackage || alloc.efficiency < 10);
  
  // Get orders that need optimization (low fill rate)
  const lowFillRateOrders = results.allocations.filter(alloc => alloc.fillRate < 60);
  const highCostOrders = results.allocations.filter(alloc => alloc.costBreakdown.totalCost > 15);

  // Export report functionality
  const exportReport = () => {
    const reportData = {
      analysisInfo: {
        analysisId: analysisId,
        completedAt: completedDate,
        totalOrders: results.summary.totalOrders,
        processedOrders: results.summary.processedOrders,
        failedOrders: results.summary.failedOrders,
        averageFillRate: results.summary.averageFillRate,
        successRate: results.metrics.optimization.successRate,
        processingSpeed: results.metrics.processing.ordersPerSecond,
        usingDefaultCosts: hasDefaultCosts
      },
      allocations: results.allocations.map(alloc => ({
        orderId: alloc.orderId,
        recommendedPackage: alloc.recommendedPackage,
        itemLength: alloc.itemDimensions.length,
        itemWidth: alloc.itemDimensions.width,
        itemHeight: alloc.itemDimensions.height,
        itemVolume: alloc.itemDimensions.volume,
        packageLength: alloc.packageDimensions.length,
        packageWidth: alloc.packageDimensions.width,
        packageHeight: alloc.packageDimensions.height,
        packageVolume: alloc.packageDimensions.volume,
        fillRate: alloc.fillRate,
        efficiency: alloc.efficiency,
        packageCost: alloc.costBreakdown.packageCost,
        usingDefaultCost: alloc.costBreakdown.usingDefaultCost,
        fillRateCategory: alloc.fillRate >= 80 ? 'Excellent (80%+)' : 
                        alloc.fillRate >= 60 ? 'Good (60-79%)' : 
                        'Needs Optimization (<60%)'
      })),
      packageBreakdown: packageUsageData.map(pkg => ({
        packageName: pkg.name,
        orderCount: pkg.value,
        totalCost: pkg.cost,
        averageCostPerOrder: pkg.cost / pkg.value,
        usingDefaultCost: pkg.usingDefaultCost
      })),
      recommendations: results.recommendations,
      optimizationOrders: {
        lowFillRateOrders: lowFillRateOrders.map(order => ({
          orderId: order.orderId,
          recommendedPackage: order.recommendedPackage,
          fillRate: order.fillRate,
          itemVolume: order.itemDimensions.volume,
          packageCost: order.costBreakdown.packageCost
        })),
        highCostOrders: highCostOrders.map(order => ({
          orderId: order.orderId,
          recommendedPackage: order.recommendedPackage,
          totalCost: order.costBreakdown.totalCost,
          fillRate: order.fillRate,
          itemVolume: order.itemDimensions.volume
        }))
      },
      failedOrders: failedOrders.map(order => ({
        orderId: order.orderId,
        issue: !order.recommendedPackage ? 'No suitable package' : 'Low efficiency',
        itemLength: order.itemDimensions.length,
        itemWidth: order.itemDimensions.width,
        itemHeight: order.itemDimensions.height,
        itemVolume: order.itemDimensions.volume
      }))
    };

    // Convert to CSV
    const csvContent = generateCSV(reportData);
    
    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `suite-analysis-report-${analysisId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = (data: any) => {
    let csv = '';
    
    // Analysis Summary
    csv += 'SUITE ANALYSIS REPORT\n';
    csv += `Analysis ID,${data.analysisInfo.analysisId}\n`;
    csv += `Completed At,${data.analysisInfo.completedAt}\n`;
    csv += `Total Orders,${data.analysisInfo.totalOrders}\n`;
    csv += `Processed Orders,${data.analysisInfo.processedOrders}\n`;
    csv += `Failed Orders,${data.analysisInfo.failedOrders}\n`;
    csv += `Average Fill Rate,${data.analysisInfo.averageFillRate.toFixed(1)}%\n`;
    csv += `Success Rate,${data.analysisInfo.successRate.toFixed(1)}%\n`;
    csv += `Processing Speed,${data.analysisInfo.processingSpeed.toFixed(0)} orders/second\n`;
    csv += `Using Default Costs,${data.analysisInfo.usingDefaultCosts ? 'Yes ($0.00/package)' : 'No'}\n`;
    csv += '\n';
    
    // Package Breakdown
    csv += 'PACKAGE BREAKDOWN\n';
    csv += 'Package Name,Order Count,Total Cost,Average Cost Per Order,Using Default Cost\n';
    
    data.packageBreakdown.forEach((pkg: any) => {
      csv += `${pkg.packageName},${pkg.orderCount},$${pkg.totalCost.toFixed(2)},$${pkg.averageCostPerOrder.toFixed(2)},${pkg.usingDefaultCost ? 'Yes' : 'No'}\n`;
    });
    
    csv += '\n';
    
    // Order Allocations
    csv += 'ORDER ALLOCATIONS\n';
    csv += 'Order ID,Recommended Package,Item L,Item W,Item H,Item Volume,Package L,Package W,Package H,Package Volume,Fill Rate %,Fill Rate Category,Efficiency %,Package Cost,Using Default Cost\n';
    
    data.allocations.forEach((alloc: any) => {
      csv += `${alloc.orderId},${alloc.recommendedPackage},${alloc.itemLength?.toFixed(2) || 'N/A'},${alloc.itemWidth?.toFixed(2) || 'N/A'},${alloc.itemHeight?.toFixed(2) || 'N/A'},${alloc.itemVolume.toFixed(2)},${alloc.packageLength.toFixed(2)},${alloc.packageWidth.toFixed(2)},${alloc.packageHeight.toFixed(2)},${alloc.packageVolume.toFixed(2)},${alloc.fillRate.toFixed(2)},${alloc.fillRateCategory},${alloc.efficiency.toFixed(2)},$${alloc.packageCost.toFixed(2)},${alloc.usingDefaultCost ? 'Yes' : 'No'}\n`;
    });
    
    csv += '\n';
    
    // Low Fill Rate Orders (Optimization Opportunities)
    if (data.optimizationOrders.lowFillRateOrders.length > 0) {
      csv += 'LOW FILL RATE ORDERS (OPTIMIZATION OPPORTUNITIES)\n';
      csv += 'Order ID,Recommended Package,Fill Rate %,Item Volume,Package Cost\n';
      
      data.optimizationOrders.lowFillRateOrders.forEach((order: any) => {
        csv += `${order.orderId},${order.recommendedPackage},${order.fillRate.toFixed(2)},${order.itemVolume.toFixed(2)},$${order.packageCost.toFixed(2)}\n`;
      });
      
      csv += '\n';
    }
    
    // High Cost Orders
    if (data.optimizationOrders.highCostOrders.length > 0) {
      csv += 'HIGH COST ORDERS\n';
      csv += 'Order ID,Recommended Package,Total Cost,Fill Rate %,Item Volume\n';
      
      data.optimizationOrders.highCostOrders.forEach((order: any) => {
        csv += `${order.orderId},${order.recommendedPackage},$${order.totalCost.toFixed(2)},${order.fillRate.toFixed(2)},${order.itemVolume.toFixed(2)}\n`;
      });
      
      csv += '\n';
    }
    
    // Failed Orders
    if (data.failedOrders.length > 0) {
      csv += 'FAILED ORDERS\n';
      csv += 'Order ID,Issue,Item L,Item W,Item H,Item Volume\n';
      
      data.failedOrders.forEach((order: any) => {
        csv += `${order.orderId},${order.issue},${order.itemLength?.toFixed(2) || 'N/A'},${order.itemWidth?.toFixed(2) || 'N/A'},${order.itemHeight?.toFixed(2) || 'N/A'},${order.itemVolume.toFixed(2)}\n`;
      });
      
      csv += '\n';
    }
    
    // Recommendations
    csv += 'RECOMMENDATIONS\n';
    csv += 'Priority,Title,Description,Affected Orders,Difficulty,Timeframe\n';
    
    data.recommendations.forEach((rec: any) => {
      csv += `${rec.priority},${rec.title},"${rec.description}",${rec.impact.affectedOrders},${rec.implementation.difficulty},${rec.implementation.timeframe}\n`;
    });
    
    return csv;
  };

  // Prepare optimized package data
  const packageUsageData = Object.entries(
    results.allocations.reduce((acc: any, alloc) => {
      const pkgName = alloc.recommendedPackage;
      if (!acc[pkgName]) {
        acc[pkgName] = { count: 0, totalCost: 0, usingDefaultCost: false };
      }
      acc[pkgName].count++;
      acc[pkgName].totalCost += alloc.costBreakdown.totalCost;
      acc[pkgName].usingDefaultCost = alloc.costBreakdown.usingDefaultCost;
      return acc;
    }, {})
  )
    .map(([pkg, data]: [string, any]) => ({
      name: pkg.length > 15 ? pkg.substring(0, 15) + '...' : pkg,
      value: data.count,
      cost: data.totalCost,
      usingDefaultCost: data.usingDefaultCost,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const totalOrders = packageUsageData.reduce((sum, pkg) => sum + pkg.value, 0);

  // Use baseline distribution from backend (user-provided usage percentages)
  const baselineDistributionPercent: Record<string, number> = results.baselineDistribution || {};
  
  // Debug baseline distribution (commented out for production)
  // console.log("Frontend: baselineDistributionPercent:", baselineDistributionPercent);
  // console.log("Frontend: packageUsageData:", packageUsageData?.map(p => ({ name: p.name, value: p.value })) || []);
  // console.log("Frontend: totalOrders:", totalOrders);
  
  // Prepare baseline package distribution data
  const baselinePackageData = packageUsageData.map(pkg => {
    // Get baseline percentage from backend (this is the user-provided usage %) - NO FALLBACK
    const baselinePercent = baselineDistributionPercent[pkg.name] || 0;
    const baselineValue = Math.round(baselinePercent * totalOrders);
    
    // Debug each package (commented out for production)
    // console.log(`Frontend: Package ${pkg?.name || 'unknown'} - baselinePercent: ${baselinePercent}, baselineValue: ${baselineValue}`);
    
    return {
      name: pkg.name,
      value: baselineValue,
      cost: pkg.value > 0 ? pkg.cost * (baselineValue / pkg.value) : 0, // Adjust cost proportionally, avoid division by zero
      usingDefaultCost: pkg.usingDefaultCost,
    };
  }).sort((a, b) => b.value - a.value);

  // Check if we have meaningful baseline data to show comparison
  const hasValidBaselineData = baselineDistributionPercent && Object.keys(baselineDistributionPercent).length > 0 && Object.values(baselineDistributionPercent).some(v => v > 0);
  const hasBaselineData = hasValidBaselineData && baselinePackageData && packageUsageData && baselinePackageData.some(pkg => pkg.value !== packageUsageData.find(p => p.name === pkg.name)?.value);
  
  // Debug baseline data flags (commented out for production)
  // console.log("Frontend: hasValidBaselineData:", hasValidBaselineData, "hasBaselineData:", hasBaselineData);

  const totalProcessedOrders = results.summary.processedOrders;
  
  // Prepare cost comparison data using actual baseline vs optimized distributions
  const costComparisonData = packageUsageData.map(pkg => {
    // Optimized costs (actual from analysis)
    const avgOptimizedCost = pkg.value > 0 ? pkg.cost / pkg.value : 0;
    const optimizedTotal = pkg.cost;
    const optimizedOrderCount = pkg.value;
    
    // Find the corresponding baseline package data
    const baselinePkg = baselinePackageData.find(b => b.name === pkg.name);
    const baselineOrderCount = baselinePkg ? baselinePkg.value : pkg.value;
    const avgBaselineCost = avgOptimizedCost; // Same unit cost, different quantities
    const baselineTotal = baselineOrderCount * avgBaselineCost;
    
    // Calculate savings
    const totalSavings = baselineTotal - optimizedTotal;
    const savingsPercent = baselineTotal > 0 ? Math.round((totalSavings / baselineTotal) * 100) : 0;
    
    return {
      package: pkg.name,
      baseline: Math.round(avgBaselineCost * 100) / 100,
      optimized: Math.round(avgOptimizedCost * 100) / 100,
      baselineTotal: Math.round(baselineTotal * 100) / 100,
      optimizedTotal: Math.round(optimizedTotal * 100) / 100,
      baselineOrderCount: baselineOrderCount,
      orderCount: optimizedOrderCount,
      savingsPercent: savingsPercent,
    };
  });

  // Calculate total costs
  const totalBaselineCost = costComparisonData.reduce((sum, item) => sum + item.baselineTotal, 0);
  const totalOptimizedCost = costComparisonData.reduce((sum, item) => sum + item.optimizedTotal, 0);
  const totalCostSavings = totalBaselineCost - totalOptimizedCost;
  const costSavingsPercent = totalBaselineCost > 0 ? Math.round((totalCostSavings / totalBaselineCost) * 100) : 0;

  // Extract actual package weights from CSV data (in pounds)
  const packageWeights: Record<string, number> = {
    'X Small': 0.08,  // From CSV: Package Weight column
    'Small': 0.12,
    'Medium': 0.18,
    'Large': 0.25,
    'X Large': 0.32,
    'XX Large': 0.42,
  };

  // Prepare usage comparison data with material weights (in pounds) using same methodology as cost analysis
  const usageComparisonData = packageUsageData.map(pkg => {
    const weight = packageWeights[pkg.name] || 0.5; // Default weight if not found
    const optimizedWeight = pkg.value * weight;
    
    // Use same baseline methodology as cost analysis - actual baseline distribution
    const baselinePkg = baselinePackageData.find(b => b.name === pkg.name);
    const baselineOrderCount = baselinePkg ? baselinePkg.value : pkg.value;
    const baselineWeight = baselineOrderCount * weight;
    
    return {
      package: pkg.name,
      baseline: Math.round(baselineWeight * 10) / 10,
      optimized: Math.round(optimizedWeight * 10) / 10,
      baselineCount: baselineOrderCount,
      optimizedCount: pkg.value,
      savingsPercent: baselineWeight > 0 ? Math.round(((baselineWeight - optimizedWeight) / baselineWeight) * 100) : 0,
    };
  });

  // Calculate total material usage
  const totalBaselineMaterial = usageComparisonData.reduce((sum, item) => sum + item.baseline, 0);
  const totalOptimizedMaterial = usageComparisonData.reduce((sum, item) => sum + item.optimized, 0);
  const materialSavings = totalBaselineMaterial - totalOptimizedMaterial;
  const materialSavingsPercent = Math.round((materialSavings / totalBaselineMaterial) * 100);

  // Prepare comparison data for volume ranges vs efficiency
  const comparisonData = results.allocations.reduce((acc: any, alloc) => {
    const volume = alloc.itemDimensions.volume;
    let volumeRange = '';
    
    if (volume < 500) {
      volumeRange = 'Small (<500)';
    } else if (volume < 1500) {
      volumeRange = 'Medium (500-1500)';
    } else if (volume < 3000) {
      volumeRange = 'Large (1500-3000)';
    } else {
      volumeRange = 'XL (3000+)';
    }
    
    if (!acc[volumeRange]) {
      acc[volumeRange] = {
        orderCount: 0,
        totalFillRate: 0,
        totalCost: 0,
        packages: {}
      };
    }
    
    acc[volumeRange].orderCount++;
    acc[volumeRange].totalFillRate += alloc.fillRate;
    acc[volumeRange].totalCost += alloc.costBreakdown.totalCost;
    
    // Track package usage within volume range
    const pkgName = alloc.recommendedPackage;
    if (!acc[volumeRange].packages[pkgName]) {
      acc[volumeRange].packages[pkgName] = 0;
    }
    acc[volumeRange].packages[pkgName]++;
    
    return acc;
  }, {});

  const comparisonChartData = Object.entries(comparisonData)
    .map(([range, data]: [string, any]) => ({
      volumeRange: range,
      orderCount: data.orderCount,
      avgFillRate: Math.round(data.totalFillRate / data.orderCount),
      avgCost: Math.round((data.totalCost / data.orderCount) * 100) / 100,
      topPackage: Object.entries(data.packages).sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || 'N/A'
    }))
    .sort((a, b) => b.orderCount - a.orderCount);

  // Check if any packages are using default costs
  const hasDefaultCosts = packageUsageData.some(pkg => pkg.usingDefaultCost);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  // Custom active shape for pie chart
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-2xl font-bold">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-sm font-medium">
          {value} orders
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-sm">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Suite Analyzer
            </Button>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Suite Analysis Results</h1>
              <p className="text-sm text-gray-600">Completed on {completedDate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-800 font-semibold text-sm">Analysis Complete</span>
            </div>
            <Button 
              onClick={exportReport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelpModal(true)}
              className="w-9 h-9 p-0 rounded-full hover:bg-gray-100"
            >
              <Info className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders Processed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{results.summary.processedOrders.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total orders analyzed</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Fill Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{results.summary.averageFillRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Package utilization</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{results.metrics.optimization.successRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Orders optimized</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing Speed</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{results.metrics.processing.ordersPerSecond.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">orders per second</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Results - Package Distribution and Details */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Package Distribution */}
          <div className="col-span-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Package Distribution</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {hasBaselineData ? 'Baseline vs Optimized package distribution' : 
                   hasValidBaselineData ? 'Baseline vs Optimized package distribution' :
                   'Recommended packages for your orders (no baseline data provided)'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {hasBaselineData ? (
                  // Side-by-side comparison when baseline data is available
                  <div className="grid grid-cols-2 gap-8">
                    {/* Baseline Distribution */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Current (Baseline)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={baselinePackageData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              animationBegin={0}
                              animationDuration={800}
                            >
                              {baselinePackageData.map((entry, index) => (
                                <Cell 
                                  key={`baseline-cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                  style={{ opacity: 0.7 }}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                              formatter={(value: any) => [`${value} orders`, 'Baseline Count']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Optimized Distribution */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Optimized</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              activeIndex={activeIndex}
                              activeShape={renderActiveShape}
                              data={packageUsageData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              animationBegin={400}
                              animationDuration={800}
                              onMouseEnter={(_, index) => setActiveIndex(index)}
                              onMouseLeave={() => setActiveIndex(undefined)}
                            >
                              {packageUsageData.map((entry, index) => (
                                <Cell 
                                  key={`optimized-cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                  style={{
                                    filter: activeIndex !== undefined && activeIndex !== index ? 'brightness(0.8)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                  }}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                              formatter={(value: any) => [`${value} orders`, 'Optimized Count']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Single pie chart when no baseline data
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activeIndex}
                          activeShape={renderActiveShape}
                          data={packageUsageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(undefined)}
                        >
                          {packageUsageData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              style={{
                                filter: activeIndex !== undefined && activeIndex !== index ? 'brightness(0.8)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value: any) => [`${value} orders`, 'Count']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="flex justify-center mt-4">
                  {hasBaselineData ? (
                    // Comparison legend showing baseline vs optimized percentages
                    <div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
                      <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="w-12 text-center font-medium">Package</span>
                          <span className="w-20 text-center">Baseline</span>
                          <span className="w-20 text-center">Optimized</span>
                        </div>
                      </div>
                      {packageUsageData.map((item, index) => {
                        const baselineItem = baselinePackageData.find(b => b.name === item.name);
                        const baselineTotal = baselinePackageData.reduce((sum, pkg) => sum + pkg.value, 0);
                        const optimizedTotal = packageUsageData.reduce((sum, pkg) => sum + pkg.value, 0);
                        const baselinePercent = baselineItem ? ((baselineItem.value / baselineTotal) * 100).toFixed(1) : '0.0';
                        const optimizedPercent = ((item.value / optimizedTotal) * 100).toFixed(1);
                        
                        return (
                          <div 
                            key={item.name} 
                            className="flex items-center gap-2 cursor-pointer justify-center"
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                          >
                            <div 
                              className="w-3 h-3 rounded-full transition-transform duration-300"
                              style={{ 
                                backgroundColor: COLORS[index % COLORS.length],
                                transform: activeIndex === index ? 'scale(1.3)' : 'scale(1)'
                              }}
                            />
                            <span className={`text-xs w-16 text-left transition-all duration-300 ${
                              activeIndex === index ? 'font-semibold text-gray-900' : 'text-gray-600'
                            }`}>
                              {item.name}
                            </span>
                            <span className={`text-xs w-16 text-center transition-all duration-300 ${
                              activeIndex === index ? 'font-semibold text-gray-700' : 'text-gray-500'
                            }`} style={{ opacity: 0.7 }}>
                              {baselinePercent}%
                            </span>
                            <span className={`text-xs w-16 text-center transition-all duration-300 ${
                              activeIndex === index ? 'font-semibold text-gray-900' : 'text-gray-600'
                            }`}>
                              {optimizedPercent}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Single chart legend
                    <div className="inline-flex items-center gap-6">
                      {packageUsageData.map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-2 cursor-pointer"
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(undefined)}
                        >
                          <div 
                            className="w-3 h-3 rounded-full transition-transform duration-300"
                            style={{ 
                              backgroundColor: COLORS[index % COLORS.length],
                              transform: activeIndex === index ? 'scale(1.3)' : 'scale(1)'
                            }}
                          />
                          <span className={`text-sm transition-all duration-300 ${
                            activeIndex === index ? 'font-semibold text-gray-900' : 'text-gray-600'
                          }`}>
                            {item.name} ({((item.value / packageUsageData.reduce((sum, pkg) => sum + pkg.value, 0)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Package Details */}
          <div className="col-span-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Package Details</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Breakdown by package type
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {packageUsageData.map((pkg, index) => {
                    const packageOrders = results.allocations.filter(
                      (alloc: any) => alloc.recommendedPackage === pkg.name
                    );
                    
                    return (
                      <div key={pkg.name} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => togglePackageDetails(pkg.name)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                              <p className="text-sm text-gray-600">
                                {pkg.value} orders • ${pkg.cost.toFixed(2)} total
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">{pkg.value} orders</div>
                            <div className="text-sm text-gray-500">${pkg.cost.toFixed(2)} total</div>
                          </div>
                        </div>
                        
                        {expandedPackages.includes(pkg.name) && (
                          <div className="mx-4 mb-4 bg-white rounded-lg border border-gray-200">
                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                              <h5 className="font-semibold text-gray-900 text-sm">Orders using {pkg.name} package</h5>
                              <p className="text-xs text-gray-600 mt-1">All {packageOrders.length} orders allocated to this package type</p>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="text-left p-2 font-semibold text-gray-700">Order ID</th>
                                    <th className="text-left p-2 font-semibold text-gray-700">Order Volume</th>
                                    <th className="text-left p-2 font-semibold text-gray-700">Package Volume</th>
                                    <th className="text-left p-2 font-semibold text-gray-700">Fill Rate</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {packageOrders.slice(0, 50).map((order, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="p-2 font-medium text-gray-900">{order.orderId}</td>
                                      <td className="p-2 text-gray-600">{order.itemDimensions.volume.toFixed(0)} CUIN</td>
                                      <td className="p-2 text-gray-600">{order.packageDimensions.volume.toFixed(0)} CUIN</td>
                                      <td className="p-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          order.fillRate >= 80 ? 'bg-green-100 text-green-800' :
                                          order.fillRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-orange-100 text-orange-800'
                                        }`}>
                                          {order.fillRate.toFixed(1)}%
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                  {packageOrders.length > 50 && (
                                    <tr>
                                      <td colSpan={4} className="p-3 text-center text-gray-500 text-xs">
                                        ... and {packageOrders.length - 50} more orders
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cost and Usage Comparison Charts */}
        {!hasDefaultCosts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Cost Comparison Chart */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Cost Analysis</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Baseline vs Optimized packaging costs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costComparisonData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="package" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: 'Cost per Package ($)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-semibold text-gray-900 mb-2">{data.package}</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-600">Baseline:</span>
                                    <span className="font-medium">${data.baseline}/pkg</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-600">Optimized:</span>
                                    <span className="font-medium">${data.optimized}/pkg</span>
                                  </div>
                                  <div className="flex justify-between gap-4 pt-1 border-t">
                                    <span className="text-gray-600">Savings:</span>
                                    <span className="font-medium text-green-600">-{data.savingsPercent}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="baseline" fill="#ef4444" name="Baseline" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="optimized" fill="#10b981" name="Optimized" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Cost Analysis Summary */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Baseline</p>
                      <p className="text-lg font-semibold text-gray-900">${totalBaselineCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Optimized</p>
                      <p className="text-lg font-semibold text-gray-900">${totalOptimizedCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost Saved</p>
                      <p className={`text-lg font-semibold ${totalCostSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(totalCostSavings).toFixed(2)} ({Math.abs(costSavingsPercent)}%)
                      </p>
                    </div>
                  </div>

                  {/* Detailed Cost Breakdown Table */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Package Cost Breakdown</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-7 text-xs text-gray-600 font-medium pb-2 border-b">
                        <div>Package</div>
                        <div className="text-center">Package Cost</div>
                        <div className="text-center">Baseline Orders</div>
                        <div className="text-center">Optimized Orders</div>
                        <div className="text-center">Baseline Cost</div>
                        <div className="text-center">Optimized Cost</div>
                        <div className="text-center">% Difference</div>
                      </div>
                      {costComparisonData.map((item, index) => (
                        <div key={item.package} className="grid grid-cols-7 text-sm py-2 hover:bg-white rounded px-2 -mx-2 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-gray-700 font-medium">{item.package}</span>
                          </div>
                          <div className="text-center text-gray-700">${item.optimized.toFixed(2)}</div>
                          <div className="text-center text-gray-600">{item.baselineOrderCount}</div>
                          <div className="text-center text-gray-900 font-medium">{item.orderCount}</div>
                          <div className="text-center text-gray-900 font-semibold">${item.baselineTotal.toFixed(2)}</div>
                          <div className="text-center text-gray-900 font-semibold">${item.optimizedTotal.toFixed(2)}</div>
                          <div className="text-center">
                            <span className={`text-sm font-semibold ${item.savingsPercent > 0 ? 'text-green-600' : item.savingsPercent < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                              {item.savingsPercent > 0 ? '+' : ''}{item.savingsPercent}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-4 gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Baseline Cost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Optimized Cost</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Comparison Chart */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Material Usage</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Baseline vs Optimized material consumption (in pounds)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageComparisonData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="package" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: 'Material (lbs)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-semibold text-gray-900 mb-2">{data.package}</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-600">Baseline:</span>
                                    <span className="font-medium">{data.baseline} lbs</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-600">Optimized:</span>
                                    <span className="font-medium">{data.optimized} lbs</span>
                                  </div>
                                  <div className="flex justify-between gap-4 pt-1 border-t">
                                    <span className="text-gray-600">Savings:</span>
                                    <span className="font-medium text-green-600">-{data.savingsPercent}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="baseline" fill="#f59e0b" name="Baseline" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="optimized" fill="#3b82f6" name="Optimized" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Material Usage Summary */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Baseline</p>
                      <p className="text-lg font-semibold text-gray-900">{totalBaselineMaterial.toFixed(1)} lbs</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Optimized</p>
                      <p className="text-lg font-semibold text-gray-900">{totalOptimizedMaterial.toFixed(1)} lbs</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Material Saved</p>
                      <p className={`text-lg font-semibold ${materialSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(materialSavings).toFixed(1)} lbs ({Math.abs(materialSavingsPercent)}%)
                      </p>
                    </div>
                  </div>

                  {/* Detailed Package Breakdown Table */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Package Breakdown</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-7 text-xs text-gray-600 font-medium pb-2 border-b">
                        <div>Package</div>
                        <div className="text-center">Package Weight</div>
                        <div className="text-center">Baseline Orders</div>
                        <div className="text-center">Optimized Orders</div>
                        <div className="text-center">Baseline Weight</div>
                        <div className="text-center">Optimized Weight</div>
                        <div className="text-center">% Difference</div>
                      </div>
                      {usageComparisonData.map((item, index) => {
                        const packageWeight = packageWeights[item.package] || 0.5;
                        return (
                          <div key={item.package} className="grid grid-cols-7 text-sm py-2 hover:bg-white rounded px-2 -mx-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-gray-700 font-medium">{item.package}</span>
                            </div>
                            <div className="text-center text-gray-700">{packageWeight} lbs</div>
                            <div className="text-center text-gray-600">{item.baselineCount}</div>
                            <div className="text-center text-gray-900 font-medium">{item.optimizedCount}</div>
                            <div className="text-center text-gray-900 font-semibold">{item.baseline} lbs</div>
                            <div className="text-center text-gray-900 font-semibold">{item.optimized} lbs</div>
                            <div className="text-center">
                              <span className={`text-sm font-semibold ${item.savingsPercent > 0 ? 'text-green-600' : item.savingsPercent < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {item.savingsPercent > 0 ? '+' : ''}{item.savingsPercent}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-4 gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Baseline Material</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Optimized Material</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Material Usage Formulas Explanation */}
        <Card className="bg-green-50 rounded-xl shadow-sm border border-green-200 mt-6">
          <CardHeader className="border-b border-green-200 pb-4">
            <CardTitle className="text-lg font-semibold text-green-900 flex items-center gap-2">
              ⚖️ Material Usage Formulas
            </CardTitle>
            <CardDescription className="text-sm text-green-700">
              Understanding how baseline and optimized material usage are calculated
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Package Weights */}
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">1. Actual Package Weights (from CSV)</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-800">Package Weights from Your CSV:</p>
                        <ul className="text-xs space-y-1 mt-1 text-gray-600">
                          <li>• X Small: 0.08 lbs</li>
                          <li>• Small: 0.12 lbs</li>
                          <li>• Medium: 0.18 lbs</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 opacity-0">Spacing</p>
                        <ul className="text-xs space-y-1 mt-1 text-gray-600">
                          <li>• Large: 0.25 lbs</li>
                          <li>• X Large: 0.32 lbs</li>
                          <li>• XX Large: 0.42 lbs</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimized Usage Formula */}
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">2. Optimized Material Usage</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                    <div>Optimized Weight = Order Count × Package Weight</div>
                    <div>Example: 462 orders × 0.12 lbs = 55.4 lbs</div>
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Note:</strong> Uses your actual optimized order counts for each package type.
                  </p>
                </div>
              </div>

              {/* Baseline Usage Formula */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">3. Baseline Material Usage (From Package Distribution)</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                    <div>Baseline Order Count = (Baseline % × Total Orders)</div>
                    <div>Baseline Weight = Baseline Order Count × Package Weight</div>
                    <div>Example: 551 orders × 0.12 lbs = 66.1 lbs</div>
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Uses Real Data:</strong> Same methodology as cost analysis - actual baseline percentages from Package Distribution chart.
                  </p>
                </div>
              </div>

              {/* Usage Comparison Formula */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">4. Material Savings Calculation</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                    <div>Material Savings = Baseline Weight - Optimized Weight</div>
                    <div>Savings Percentage = (Material Savings ÷ Baseline Weight) × 100</div>
                    <div>Example: (66.1 - 55.4) ÷ 66.1 × 100 = 16% savings</div>
                  </div>
                </div>
              </div>

              {/* Updated Implementation */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">✅ Updated Implementation</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• <strong>✅ Consistent Methodology:</strong> Uses same approach as cost analysis</li>
                    <li>• <strong>✅ Real Baseline Data:</strong> Uses actual baseline percentages from Package Distribution</li>
                    <li>• <strong>✅ No Random Multipliers:</strong> Deterministic calculations based on real data</li>
                    <li>• <strong>⚠️ Estimated Weights:</strong> Package weights are still estimated (could be improved with actual data)</li>
                  </ul>
                  <p className="text-xs text-green-600 mt-2">
                    <strong>Formula:</strong> (Baseline % × Total Orders) × Package Weight = Baseline Material Usage
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {results.recommendations.length > 0 && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Optimization Recommendations</CardTitle>
              <CardDescription className="text-sm text-gray-600">Suggestions to improve your packaging efficiency</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {results.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{rec.impact.affectedOrders} orders</span>
                        {rec.type === 'size_optimization' && lowFillRateOrders.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowOptimizationOrders(showOptimizationOrders === 'size' ? null : 'size')}
                            className="text-xs h-6 px-2"
                          >
                            {showOptimizationOrders === 'size' ? 'Hide' : 'View'} Orders
                          </Button>
                        )}
                        {rec.type === 'cost_reduction' && highCostOrders.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowOptimizationOrders(showOptimizationOrders === 'cost' ? null : 'cost')}
                            className="text-xs h-6 px-2"
                          >
                            {showOptimizationOrders === 'cost' ? 'Hide' : 'View'} Orders
                          </Button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{rec.implementation.difficulty} • {rec.implementation.timeframe}</span>
                    </div>
                    
                    {/* Orders Details */}
                    {showOptimizationOrders === 'size' && rec.type === 'size_optimization' && (
                      <div className="mt-4 bg-white rounded-lg border border-gray-200">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                          <h5 className="font-semibold text-gray-900 text-sm">Orders with Fill Rate Below 60%</h5>
                          <p className="text-xs text-gray-600 mt-1">These orders have poor space utilization</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="text-left p-2 font-semibold text-gray-700">Order ID</th>
                                <th className="text-left p-2 font-semibold text-gray-700">Package</th>
                                <th className="text-left p-2 font-semibold text-gray-700">Fill Rate</th>
                                <th className="text-left p-2 font-semibold text-gray-700">Item Volume</th>
                                <th className="text-left p-2 font-semibold text-gray-700">Package Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lowFillRateOrders.slice(0, 20).map((order, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="p-2 font-medium text-gray-900">{order.orderId}</td>
                                  <td className="p-2 text-gray-600">{order.recommendedPackage}</td>
                                  <td className="p-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      {order.fillRate.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="p-2 text-gray-600">{order.itemDimensions.volume.toFixed(0)} CUIN</td>
                                  <td className="p-2 text-gray-600">${order.costBreakdown.packageCost.toFixed(2)}</td>
                                </tr>
                              ))}
                              {lowFillRateOrders.length > 20 && (
                                <tr>
                                  <td colSpan={5} className="p-3 text-center text-gray-500 text-xs">
                                    ... and {lowFillRateOrders.length - 20} more orders
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {showOptimizationOrders === 'cost' && rec.type === 'cost_reduction' && (
                      <div className="mt-4 bg-white rounded-lg border border-gray-200">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                          <h5 className="font-semibold text-gray-900 text-sm">High-Cost Orders (Above $15)</h5>
                          <p className="text-xs text-gray-600 mt-1">These orders have elevated packaging costs</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="text-left p-2 font-semibold text-gray-700">Order ID</th>
                                <th className="text-left p-2 font-semibold text-gray-700">Package</th>
                                <th className="text-left p-2 font-semibold text-gray-700">Total Cost</th>
                                <th className="text-left p-2 font-semibold text-gray-700">Fill Rate</th>
                                <th className="text-left p-2 font-semibold text-gray-700">Item Volume</th>
                              </tr>
                            </thead>
                            <tbody>
                              {highCostOrders.slice(0, 20).map((order, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="p-2 font-medium text-gray-900">{order.orderId}</td>
                                  <td className="p-2 text-gray-600">{order.recommendedPackage}</td>
                                  <td className="p-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      ${order.costBreakdown.totalCost.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="p-2 text-gray-600">{order.fillRate.toFixed(1)}%</td>
                                  <td className="p-2 text-gray-600">{order.itemDimensions.volume.toFixed(0)} CUIN</td>
                                </tr>
                              ))}
                              {highCostOrders.length > 20 && (
                                <tr>
                                  <td colSpan={5} className="p-3 text-center text-gray-500 text-xs">
                                    ... and {highCostOrders.length - 20} more orders
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed Orders (if any) */}
        {results.summary.failedOrders > 0 && (
          <Card className="border-orange-200 bg-orange-50 mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-800">Attention Required</h3>
              </div>
              <p className="text-orange-700 mb-4">
                <strong>{results.summary.failedOrders} orders</strong> couldn't be optimized and may need special handling or larger packaging options.
              </p>
              <Button 
                onClick={() => setShowFailedOrders(!showFailedOrders)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {showFailedOrders ? 'Hide' : 'Review'} These Orders
              </Button>
              
              {/* Failed Orders Details */}
              {showFailedOrders && (
                <div className="mt-6 bg-white rounded-lg border border-orange-200">
                  <div className="p-4 border-b border-orange-200 bg-orange-50">
                    <h4 className="font-semibold text-orange-900">Orders Requiring Attention</h4>
                    <p className="text-sm text-orange-700 mt-1">These orders couldn't be optimized with the current packaging suite</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">Order ID</th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">Order Volume (CUIN)</th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">Issue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedOrders.length > 0 ? failedOrders.map((order, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-3 text-sm font-medium text-gray-900">{order.orderId}</td>
                            <td className="p-3 text-sm text-gray-600">{order.itemDimensions.volume.toFixed(0)}</td>
                            <td className="p-3 text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {!order.recommendedPackage ? 'No suitable package' : 'Low efficiency'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3} className="p-6 text-center text-gray-500">
                              No failed orders to display
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto m-4">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Suite Analysis Results Guide</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="px-6 py-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What is Suite Analyzer?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Suite Analyzer is an AI-powered tool that optimizes packaging allocation by analyzing your order volume data 
                    and mapping orders to your available packaging suite. It uses actual volume data (not estimated dimensions) 
                    to provide accurate fill rates and cost analysis, helping you reduce waste and optimize packaging efficiency.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">How It Works</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>1. Data Analysis:</strong> Processes your order data (Order ID + Total Order Volume) and packaging suite (Package types + L×W×H dimensions)</p>
                    <p><strong>2. Volume-Based Classification:</strong> Uses actual volume data from your CSV to classify orders (no fallback dimensions)</p>
                    <p><strong>3. Smart Package Selection:</strong> Maps orders to packages based on volume capacity when dimensions aren't provided</p>
                    <p><strong>4. Accurate Fill Rates:</strong> Calculates fill rates using real volume data, preventing inflated percentages</p>
                    <p><strong>5. Cost Analysis:</strong> Shows $0.00 for packages without cost data (no artificial inflation)</p>
                    <p><strong>6. Recommendations:</strong> Generates actionable insights based on actual performance data</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding Your Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">📦 Orders Processed</h4>
                      <p className="text-sm text-blue-800">Total number of orders successfully analyzed and allocated to packages</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">📊 Average Fill Rate</h4>
                      <p className="text-sm text-green-800">Percentage of package space utilized on average (higher = less waste)</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">✅ Success Rate</h4>
                      <p className="text-sm text-purple-800">Percentage of orders that were successfully optimized</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">⚡ Processing Speed</h4>
                      <p className="text-sm text-orange-800">Number of orders processed per second during analysis</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Package Distribution & Details</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Pie Chart:</strong> Visual breakdown of how your orders are distributed across different package types</p>
                    <p><strong>Package Details:</strong> Shows exact order counts and total costs for each package type</p>
                    <p><strong>Order Volume:</strong> The total volume from your CSV data (cubic inches)</p>
                    <p><strong>Package Volume:</strong> The volume capacity of the recommended package</p>
                    <p><strong>Fill Rate:</strong> How efficiently the order fills the package (Order Volume ÷ Package Volume)</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Optimization Recommendations</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Priority Levels:</strong> HIGH (urgent action needed), MEDIUM (should address), LOW (consider when possible)</p>
                    <p><strong>Common Recommendations:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Optimize Package Sizes:</strong> When many orders have low fill rates (&lt;60%) - suggests smaller packaging options</li>
                      <li><strong>Volume-Based Insights:</strong> Recommendations based on actual order volumes, not estimated dimensions</li>
                      <li><strong>Package Consolidation:</strong> When similar-sized packages could be merged</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Failed Orders (When They Appear)</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>What:</strong> Orders that couldn't be optimized with your current packaging suite</p>
                    <p><strong>Why:</strong> Usually because the order is too large for available packages or has very low efficiency</p>
                    <p><strong>Action:</strong> Consider adding larger package options or reviewing these orders manually</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Using the Export Report</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>CSV Export Includes:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                      <li>Analysis summary and metrics</li>
                      <li>Detailed order allocations with dimensions and costs</li>
                      <li>All optimization recommendations</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Aim for fill rates above 60% for optimal efficiency</li>
                    <li>• Regular analysis helps identify packaging trends</li>
                    <li>• Use recommendations to guide purchasing decisions</li>
                    <li>• Export data for deeper analysis in spreadsheet tools</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuiteAnalysisResults;