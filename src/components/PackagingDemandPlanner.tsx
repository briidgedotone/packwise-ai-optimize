
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, PieChart, Settings, AlertCircle, TrendingUp, BarChart3, FileSpreadsheet } from 'lucide-react';

export const PackagingDemandPlanner = () => {
  const [totalOrders, setTotalOrders] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('');
  const [mixSource, setMixSource] = useState<'usage-log' | 'manual'>('usage-log');
  const [safetyStock, setSafetyStock] = useState('');
  
  const [files, setFiles] = useState<{
    usageLog: File | null;
    manualMix: File | null;
    packagingSuite: File | null;
  }>({
    usageLog: null,
    manualMix: null,
    packagingSuite: null,
  });

  const handleFileUpload = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Packaging Demand Planner</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Forecast packaging needs based on total order volumes and historical mix
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
              <BarChart3 className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Mix-Based Planning</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Total Order Forecast */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
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
                    className="border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-sm">Forecast Period *</Label>
                  <Input
                    placeholder="e.g., Q4 2025"
                    value={forecastPeriod}
                    onChange={(e) => setForecastPeriod(e.target.value)}
                    className="border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Packaging Mix Source */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <PieChart className="h-4 w-4 text-blue-600" />
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
                      className={mixSource === 'usage-log' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}
                      size="sm"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Usage History
                    </Button>
                    <Button
                      variant={mixSource === 'manual' ? 'default' : 'outline'}
                      onClick={() => setMixSource('manual')}
                      className={mixSource === 'manual' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                  
                  {mixSource === 'usage-log' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700 font-medium mb-2">📁 Option A: Usage Log (Recommended)</p>
                      <p className="text-xs text-blue-600 mb-3">Upload historical data to automatically calculate mix percentages</p>
                      <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 text-center hover:border-blue-300 hover:bg-blue-25 transition-colors">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-xs text-blue-600 mb-2">Date, Package Type, Quantity Used</p>
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
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
                        >
                          {files.usageLog ? files.usageLog.name : 'Upload Usage Log'}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {mixSource === 'manual' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-xs text-orange-700 font-medium mb-2">⚙️ Option B: Manual Mix</p>
                      <p className="text-xs text-orange-600 mb-3">Manually specify packaging mix percentages</p>
                      <div className="border-2 border-dashed border-orange-200 rounded-lg p-4 text-center hover:border-orange-300 hover:bg-orange-25 transition-colors">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-xs text-orange-600 mb-2">Package Type, Usage % (e.g., 35%)</p>
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
                          className="border-orange-200 text-orange-700 hover:bg-orange-50 text-sm"
                        >
                          {files.manualMix ? files.manualMix.name : 'Upload Manual Mix'}
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-orange-600">
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
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Upload className="h-4 w-4 text-purple-600" />
                  </div>
                  Packaging Suite
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500 mt-2">
                  Upload your packaging specifications and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
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
            <Card className="bg-white border-gray-100 shadow-sm">
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
                    className="border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500">Final Quantity = Base Quantity × (1 + Safety Stock %)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end px-4 sm:px-0">
          <Button 
            size="lg"
            disabled={!totalOrders || !forecastPeriod || !files.packagingSuite || (mixSource === 'usage-log' && !files.usageLog) || (mixSource === 'manual' && !files.manualMix)}
            className="bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300 disabled:text-gray-500 min-w-48"
          >
            {(!totalOrders || !forecastPeriod || !files.packagingSuite || (mixSource === 'usage-log' && !files.usageLog) || (mixSource === 'manual' && !files.manualMix)) ? (
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
      </div>
    </div>
  );
};
