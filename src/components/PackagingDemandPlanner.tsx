
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpTrayIcon as Upload,
  ChartPieIcon as PieChart,
  Cog6ToothIcon as Settings,
  ExclamationCircleIcon as AlertCircle,
  ArrowTrendingUpIcon as TrendingUp,
  ChartBarIcon as BarChart3,
  DocumentIcon as FileSpreadsheet,
  ArrowPathIcon as Loader2,
  CheckCircleIcon as CheckCircle2,
  ArrowDownTrayIcon as Download,
  CurrencyDollarIcon as DollarSign
} from '@heroicons/react/24/outline';
import { PieChart as RechartsPie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAction } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { designSystem } from '@/lib/design-system';
import { exportToCSV, exportToPDF } from '@/lib/demandPlannerExport';
import { useTokenGuard } from '@/hooks/useTokenGuard';

interface DemandResult {
  packageType: string;
  baseQty: number;
  usagePercent: number;
  safetyStockPercent: number;
  finalQty: number;
  estimatedCost: number;
  estimatedWeight: number;
}

export const PackagingDemandPlanner = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { canUseToken, checkAndConsumeToken } = useTokenGuard();
  const [totalOrders, setTotalOrders] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('');
  const [mixSource, setMixSource] = useState<'usage-log' | 'manual'>('usage-log');
  const [safetyStock, setSafetyStock] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [files, setFiles] = useState<{
    usageLog: File | null;
    manualMix: File | null;
    packagingSuite: File | null;
  }>({
    usageLog: null,
    manualMix: null,
    packagingSuite: null,
  });

  const [results, setResults] = useState<{
    results: DemandResult[];
    totalPackages: number;
    totalCost: number;
    totalWeight: number;
    insights: string[];
  } | null>(null);

  // Convex action
  const calculateDemandPlanning = useAction(api.demandPlanner.calculateDemandPlanning);

  // File to string converter
  const fileToString = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleFileUpload = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
    if (file) {
      toast.success(`📄 ${type === 'usageLog' ? 'Usage log' : type === 'manualMix' ? 'Manual mix' : 'Packaging suite'} loaded: ${file.name}`);
    }
  };

  const handleGeneratePlan = async () => {
    if (!user || !files.packagingSuite || !totalOrders || !forecastPeriod) {
      toast.error('Please complete all required fields');
      return;
    }

    if (mixSource === 'usage-log' && !files.usageLog) {
      toast.error('Please upload usage log file');
      return;
    }

    if (mixSource === 'manual' && !files.manualMix) {
      toast.error('Please upload manual mix file');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await checkAndConsumeToken('demand_planner', async () => {
        // Convert files to strings
        const packagingSuiteData = await fileToString(files.packagingSuite);
        const usageLogData = mixSource === 'usage-log' && files.usageLog 
          ? await fileToString(files.usageLog) 
          : undefined;
        const manualMixData = mixSource === 'manual' && files.manualMix 
          ? await fileToString(files.manualMix) 
          : undefined;

        const response = await calculateDemandPlanning({
          totalOrders: parseInt(totalOrders.replace(/,/g, '')) || 0,
          forecastPeriod,
          usageLogData,
          manualMixData,
          packagingSuiteData,
          safetyStockPercent: safetyStock ? parseFloat(safetyStock) : undefined,
          userId: user.id,
        });

        return response;
      });

      if (result.success) {
        setResults(result.result);
        toast.success(`✅ Demand plan generated for ${result.result.totalPackages.toLocaleString()} packages!`);
      } else if (result.error === 'NO_TOKENS') {
        navigate('/onboarding');
      }
      
    } catch (error) {
      console.error('Error generating demand plan:', error);
      toast.error('Failed to generate demand plan');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setFiles({ usageLog: null, manualMix: null, packagingSuite: null });
    setTotalOrders('');
    setForecastPeriod('');
    setSafetyStock('');
    setResults(null);
  };

  // Chart data preparation
  const getPieChartData = () => {
    if (!results) return [];
    return results.results.map(item => ({
      name: item.packageType,
      value: item.usagePercent,
      qty: item.finalQty,
    }));
  };

  const getBarChartData = () => {
    if (!results) return [];
    return results.results.map(item => ({
      packageType: item.packageType.length > 12 ? item.packageType.substring(0, 12) + '...' : item.packageType,
      cost: item.estimatedCost,
      weight: item.estimatedWeight,
    }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
      <div className="space-y-3">
        <div className="bg-white rounded-3xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-3xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Packaging Demand Planner</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Forecast packaging needs based on total order volumes and historical mix
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 border rounded-3xl" style={{ backgroundColor: designSystem.colors.primaryLight, borderColor: designSystem.colors.primary }}>
              <BarChart3 className="h-3 w-3" style={{ color: designSystem.colors.primary }} />
              <span className="text-xs font-medium" style={{ color: designSystem.colors.primary }}>Mix-Based Planning</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          {/* Total Order Forecast */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-200 shadow-sm rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-3xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                    <TrendingUp className="h-4 w-4" style={{ color: designSystem.colors.primary }} />
                  </div>
                  Total Order Forecast
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500 mt-2">
                  Enter your total forecasted shipments for the planning period
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-sm">Total Forecasted Orders *</Label>
                  <Input
                    placeholder="e.g., 40,000"
                    value={totalOrders}
                    onChange={(e) => setTotalOrders(e.target.value)}
                    className="border-gray-200 rounded-3xl"
                    style={{ '--tw-ring-color': designSystem.colors.primary }}
                    onFocus={(e) => { e.target.style.borderColor = designSystem.colors.primary; e.target.style.boxShadow = `0 0 0 1px ${designSystem.colors.primary}`; }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-sm">Forecast Period *</Label>
                  <Input
                    placeholder="e.g., Q4 2025"
                    value={forecastPeriod}
                    onChange={(e) => setForecastPeriod(e.target.value)}
                    className="border-gray-200 rounded-3xl"
                    style={{ '--tw-ring-color': designSystem.colors.primary }}
                    onFocus={(e) => { e.target.style.borderColor = designSystem.colors.primary; e.target.style.boxShadow = `0 0 0 1px ${designSystem.colors.primary}`; }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Packaging Mix Source */}
            <Card className="bg-white border-gray-200 shadow-sm rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-3xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                    <PieChart className="h-4 w-4" style={{ color: designSystem.colors.primary }} />
                  </div>
                  Packaging Mix Source
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500 mt-2">
                  Choose how to determine your packaging mix percentages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mix Source Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant={mixSource === 'usage-log' ? 'default' : 'outline'}
                      onClick={() => setMixSource('usage-log')}
                      className={mixSource === 'usage-log' ? 'hover:opacity-90' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}
                      size="sm"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Usage History
                    </Button>
                    <Button
                      variant={mixSource === 'manual' ? 'default' : 'outline'}
                      onClick={() => setMixSource('manual')}
                      className={mixSource === 'manual' ? 'hover:opacity-90' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                  
                  {mixSource === 'usage-log' && (
                    <div className="border rounded-3xl rounded-3xl p-3">
                      <p className="text-xs text-gray-700 font-medium mb-2">📁 Option A: Usage Log (Recommended)</p>
                      <p className="text-xs text-gray-600 mb-3">Upload historical data to automatically calculate mix percentages</p>
                      <div className="border-2 border-dashed border-blue-200 rounded-3xl p-4 text-center hover:border-blue-300 hover:bg-blue-25 transition-colors">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-xs text-gray-600 mb-2">Date, Package Type, Quantity Used</p>
                        <Input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={(e) => handleFileUpload('usageLog', e.target.files?.[0] || null)}
                          className="hidden"
                          id="usage-log-file"
                        />
                        <Button 
                          variant="outline"
                          onClick={() => document.getElementById('usage-log-file')?.click()}
                          className="border-blue-200 text-gray-700 hover:bg-blue-50 text-sm"
                        >
                          {files.usageLog ? files.usageLog.name : 'Upload Usage Log'}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {mixSource === 'manual' && (
                    <div className="border rounded-3xl rounded-3xl p-3">
                      <p className="text-xs text-gray-700 font-medium mb-2">⚙️ Option B: Manual Mix</p>
                      <p className="text-xs text-gray-600 mb-3">Manually specify packaging mix percentages</p>
                      <div className="border-2 border-dashed border-orange-200 rounded-3xl p-4 text-center hover:border-orange-300 hover:bg-orange-25 transition-colors">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-xs text-gray-600 mb-2">Package Type, Usage % (e.g., 35%)</p>
                        <Input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={(e) => handleFileUpload('manualMix', e.target.files?.[0] || null)}
                          className="hidden"
                          id="manual-mix-file"
                        />
                        <Button 
                          variant="outline"
                          onClick={() => document.getElementById('manual-mix-file')?.click()}
                          className="border-orange-200 text-gray-700 hover:bg-orange-50 text-sm"
                        >
                          {files.manualMix ? files.manualMix.name : 'Upload Manual Mix'}
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        ⚠️ This will override any calculated values from usage logs
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Packaging Suite & Settings */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-200 shadow-sm rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-3xl flex items-center justify-center">
                    <Upload className="h-4 w-4 text-purple-600" />
                  </div>
                  Packaging Suite
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500 mt-2">
                  Upload your packaging specifications and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-4 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-2">
                    <Upload className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    Package Type, L×W×H, Cost per Unit, Weight per Unit
                  </p>
                  <Input
                    id="suite-file"
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={(e) => handleFileUpload('packagingSuite', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('suite-file')?.click()}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    {files.packagingSuite ? files.packagingSuite.name : 'Choose File'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Stock */}
            <Card className="bg-white border-gray-200 shadow-sm rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Safety Stock Buffer
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500">
                  Add a buffer to prevent packaging shortages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-sm">Safety Stock % (Optional)</Label>
                  <Input
                    placeholder="e.g., 10"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(e.target.value)}
                    className="border-gray-200 rounded-3xl"
                    style={{ '--tw-ring-color': designSystem.colors.primary }}
                    onFocus={(e) => { e.target.style.borderColor = designSystem.colors.primary; e.target.style.boxShadow = `0 0 0 1px ${designSystem.colors.primary}`; }}
                  />
                  <p className="text-xs text-gray-500">Final Quantity = Base Quantity × (1 + Safety Stock %)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generate Plan Button */}
        <div className="flex justify-center lg:justify-end px-3 sm:px-0">
          <Button 
            size="lg"
            disabled={!canUseToken || !totalOrders || !forecastPeriod || !files.packagingSuite || (mixSource === 'usage-log' && !files.usageLog) || (mixSource === 'manual' && !files.manualMix) || isAnalyzing}
            onClick={handleGeneratePlan}
            className="hover:opacity-90 text-white disabled:bg-gray-300 disabled:text-gray-500 min-w-48 rounded-full"
            style={{ backgroundColor: designSystem.colors.primary }}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Plan...
              </div>
            ) : (!canUseToken) ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No Tokens Available
              </div>
            ) : (!totalOrders || !forecastPeriod || !files.packagingSuite || (mixSource === 'usage-log' && !files.usageLog) || (mixSource === 'manual' && !files.manualMix)) ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Complete Setup
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Generate Demand Plan
              </div>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-4 mt-6">
            {/* Summary Cards */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">📦 Demand Planning Summary</CardTitle>
                <CardDescription className="text-gray-700">
                  Forecast period: {forecastPeriod} • Total orders: {parseInt(totalOrders.replace(/,/g, '')).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-3xl border border-orange-100">
                    <div className="text-2xl font-bold text-gray-700">
                      {results.totalPackages.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Packages</div>
                  </div>
                  {results.totalCost > 0 && (
                    <div className="text-center p-4 bg-white rounded-3xl border border-green-100">
                      <div className="text-2xl font-bold text-green-700">
                        ${results.totalCost.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600">Estimated Cost</div>
                    </div>
                  )}
                  {results.totalWeight > 0 && (
                    <div className="text-center p-4 bg-white rounded-3xl border border-blue-100">
                      <div className="text-2xl font-bold text-gray-700">
                        {results.totalWeight.toFixed(1)} lbs
                      </div>
                      <div className="text-sm text-gray-600">Total Weight</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results Table */}
            <Card className="bg-white border-gray-200 shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">📊 Packaging Demand Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Package Type</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Usage %</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Base Qty</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Final Qty</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Est. Cost</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Est. Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.results.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{item.packageType}</td>
                          <td className="px-4 py-3 text-center text-gray-700">{item.usagePercent.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-center text-gray-700">{item.baseQty.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-semibold text-gray-900">{item.finalQty.toLocaleString()}</span>
                              {item.safetyStockPercent > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.safetyStockPercent}%
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {item.estimatedCost > 0 ? `$${item.estimatedCost.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {item.estimatedWeight > 0 ? `${item.estimatedWeight.toFixed(1)} lbs` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Pie Chart - Mix Distribution */}
              <Card className="bg-white border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Packaging Mix Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie
                      data={getPieChartData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      labelLine={false}
                    >
                      {getPieChartData().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart - Cost/Weight */}
              <Card className="bg-white border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Cost & Weight by Package Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getBarChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="packageType" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis yAxisId="cost" orientation="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="weight" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="cost" dataKey="cost" fill="#10b981" name="Cost ($)" />
                      <Bar yAxisId="weight" dataKey="weight" fill="#3b82f6" name="Weight (lbs)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  🤖 AI Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-3xl border border-blue-100">
                      <CheckCircle2 className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-800">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-gray-200 text-gray-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (results) {
                      exportToCSV(results, parseInt(totalOrders.replace(/,/g, '')), forecastPeriod, parseFloat(safetyStock) || 0);
                      toast.success('CSV export completed!');
                    }
                  }}
                  className="border-gray-200 text-gray-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  onClick={() => {
                    if (results) {
                      exportToPDF(results, parseInt(totalOrders.replace(/,/g, '')), forecastPeriod, parseFloat(safetyStock) || 0);
                      toast.success('PDF report generated!');
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
