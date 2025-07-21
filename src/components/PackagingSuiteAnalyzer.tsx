
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, Settings, BarChart3, Package, TrendingUp, Target, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const PackagingSuiteAnalyzer = () => {
  const [files, setFiles] = useState<{
    orderHistory: File | null;
    packagingSuite: File | null;
    baselineMix: File | null;
  }>({
    orderHistory: null,
    packagingSuite: null,
    baselineMix: null,
  });

  const [fallbackDimensions, setFallbackDimensions] = useState({
    smallest: { l: '', w: '', h: '' },
    average: { l: '', w: '', h: '' },
    largest: { l: '', w: '', h: '' },
  });

  const handleFileUpload = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-bl-full"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Suite Analyzer</h2>
                  <p className="text-slate-600 text-lg">
                    Optimize packaging allocation and identify cost savings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Avg 23% Cost Reduction</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800">Optimize Mix</div>
                  <div className="text-xs text-blue-600">Find best package allocation</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-emerald-800">Cost Analysis</div>
                  <div className="text-xs text-emerald-600">Identify savings opportunities</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-800">Smart Reports</div>
                  <div className="text-xs text-orange-600">Actionable insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* File Uploads */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <FileSpreadsheet className="h-5 w-5 text-slate-600" />
                  Required Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order History Upload */}
                <div className="space-y-3">
                  <Label htmlFor="order-history" className="text-slate-700 font-medium">Order History File *</Label>
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 bg-gradient-to-br from-blue-50/20 to-slate-50/50 group">
                    <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Upload CSV with Order ID, L×W×H, Total CUIN, Quantity
                    </p>
                    <Input
                      id="order-history"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => handleFileUpload('orderHistory', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('order-history')?.click()}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-medium px-6 py-2 min-w-[140px]"
                    >
                      {files.orderHistory ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="truncate max-w-[100px]">{files.orderHistory.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Choose File
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Packaging Suite Upload */}
                <div className="space-y-3">
                  <Label htmlFor="packaging-suite" className="text-slate-700 font-medium">Packaging Suite File *</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-3">
                      Package Name, L×W×H, Cost per unit, Package Weight
                    </p>
                    <Input
                      id="packaging-suite"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => handleFileUpload('packagingSuite', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => document.getElementById('packaging-suite')?.click()}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      {files.packagingSuite ? files.packagingSuite.name : 'Choose File'}
                    </Button>
                  </div>
                </div>

                {/* Baseline Mix Upload */}
                <div className="space-y-3">
                  <Label htmlFor="baseline-mix" className="text-slate-700 font-medium">Baseline Packaging Mix (Optional)</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                    <Input
                      id="baseline-mix"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => handleFileUpload('baselineMix', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => document.getElementById('baseline-mix')?.click()}
                      className="text-slate-600 hover:bg-slate-100"
                    >
                      {files.baselineMix ? files.baselineMix.name : 'Upload Baseline Mix'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fallback Dimensions */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Fallback Dimensions
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Used when product dimensions are missing from order data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {['smallest', 'average', 'largest'].map((size) => (
                  <div key={size} className="space-y-3">
                    <Label className="capitalize text-slate-700 font-medium">{size} Product Dimensions</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['l', 'w', 'h'].map((dim) => (
                        <div key={dim} className="space-y-2">
                          <Label className="text-xs text-slate-500 uppercase font-medium">{dim}</Label>
                          <Input
                            placeholder="0"
                            className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                            value={fallbackDimensions[size as keyof typeof fallbackDimensions][dim as 'l' | 'w' | 'h']}
                            onChange={(e) => setFallbackDimensions(prev => ({
                              ...prev,
                              [size]: {
                                ...prev[size as keyof typeof prev],
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

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <BarChart3 className="h-5 w-5 text-slate-600" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <p className="text-sm">Upload files to see analysis results</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            size="lg"
            disabled={!files.orderHistory || !files.packagingSuite}
            className="min-w-[160px] bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-3 px-8"
          >
            {!files.orderHistory || !files.packagingSuite ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Upload Files
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analyze Suite
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
