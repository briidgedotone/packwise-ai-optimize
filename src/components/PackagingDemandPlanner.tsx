
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Calculator, PieChart, Settings } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Packaging Demand Planner</h2>
          <p className="text-slate-600">
            Calculate exact packaging quantities needed based on forecasted product volumes
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Upload className="h-5 w-5 text-slate-600" />
                  Required Files
                </CardTitle>
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
            className="min-w-[140px] bg-slate-800 hover:bg-slate-700 text-white"
          >
            Generate Plan
          </Button>
        </div>
      </div>
    </div>
  );
};
