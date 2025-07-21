
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, Settings, BarChart3 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Packaging Suite Analyzer</h2>
          <p className="text-slate-600">
            Analyze historical order data to optimize packaging allocation and identify cost savings
          </p>
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
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
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
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      {files.orderHistory ? files.orderHistory.name : 'Choose File'}
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
            className="min-w-[140px] bg-slate-800 hover:bg-slate-700 text-white"
          >
            Analyze Suite
          </Button>
        </div>
      </div>
    </div>
  );
};
