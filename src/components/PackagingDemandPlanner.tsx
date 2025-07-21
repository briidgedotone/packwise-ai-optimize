
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Calculator, PieChart, Settings, TrendingUp, Package2, BarChart3, CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';

export const PackagingDemandPlanner = () => {
  const [files, setFiles] = useState<{
    forecast: File | null;
    packagingSuite: File | null;
  }>({
    forecast: null,
    packagingSuite: null,
  });

  const [fallbackDimensions, setFallbackDimensions] = useState({
    min: { l: '', w: '', h: '' },
    avg: { l: '', w: '', h: '' },
    max: { l: '', w: '', h: '' },
  });

  const handleFileUpload = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-bl-full"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Demand Planner</h2>
                  <p className="text-slate-600 text-lg">
                    Calculate exact packaging quantities for your forecasts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Future-Ready</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-emerald-800">Demand Forecasting</div>
                  <div className="text-xs text-emerald-600">Plan ahead with confidence</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800">Optimal Quantities</div>
                  <div className="text-xs text-blue-600">Right-size your inventory</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-800">Smart Insights</div>
                  <div className="text-xs text-orange-600">Data-driven recommendations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-emerald-50/50 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Upload className="h-5 w-5 text-emerald-600" />
                  </div>
                  Required Files
                </CardTitle>
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700">Upload forecast data to calculate packaging requirements</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Forecast Upload */}
                <div className="space-y-3">
                  <Label htmlFor="forecast-file" className="text-slate-700 font-medium">Forecasted Product Orders *</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-3">
                      Product Name, Forecasted Quantity, L×W×H, Total CUIN
                    </p>
                    <Input
                      id="forecast-file"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => handleFileUpload('forecast', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => document.getElementById('forecast-file')?.click()}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      {files.forecast ? files.forecast.name : 'Choose File'}
                    </Button>
                  </div>
                </div>

                {/* Packaging Suite Upload */}
                <div className="space-y-3">
                  <Label htmlFor="suite-file" className="text-slate-700 font-medium">Packaging Suite *</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-3">
                      Package Name, L×W×H, Internal CUIN, Cost, Weight
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
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      {files.packagingSuite ? files.packagingSuite.name : 'Choose File'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Fallback Dimensions
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Used when product specs are incomplete
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {['min', 'avg', 'max'].map((type) => (
                  <div key={type} className="space-y-3">
                    <Label className="capitalize text-slate-700 font-medium">{type === 'avg' ? 'Average' : type === 'min' ? 'Minimum' : 'Maximum'} Product Dimensions</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['l', 'w', 'h'].map((dim) => (
                        <div key={dim} className="space-y-2">
                          <Label className="text-xs text-slate-500 uppercase font-medium">{dim}</Label>
                          <Input
                            placeholder="0"
                            className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                            value={fallbackDimensions[type as keyof typeof fallbackDimensions][dim as 'l' | 'w' | 'h']}
                            onChange={(e) => setFallbackDimensions(prev => ({
                              ...prev,
                              [type]: {
                                ...prev[type as keyof typeof prev],
                                [dim]: e.target.value
                              }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <PieChart className="h-5 w-5 text-slate-600" />
                  Demand Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-slate-500">
                  <Calculator className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <p className="text-sm">Upload forecast data to see demand planning results</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">Analysis insights will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            size="lg"
            disabled={!files.forecast || !files.packagingSuite}
            className="min-w-[160px] bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-3 px-8"
          >
            {!files.forecast || !files.packagingSuite ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Upload Files
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Generate Plan
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
