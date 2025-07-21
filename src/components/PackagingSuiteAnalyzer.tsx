
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Packaging Suite Analyzer</h2>
        <p className="text-muted-foreground">
          Analyze historical order data to optimize packaging allocation and identify cost savings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* File Uploads */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Required Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order History Upload */}
              <div className="space-y-2">
                <Label htmlFor="order-history">Order History File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
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
                  >
                    {files.orderHistory ? files.orderHistory.name : 'Choose File'}
                  </Button>
                </div>
              </div>

              {/* Packaging Suite Upload */}
              <div className="space-y-2">
                <Label htmlFor="packaging-suite">Packaging Suite File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
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
                  >
                    {files.packagingSuite ? files.packagingSuite.name : 'Choose File'}
                  </Button>
                </div>
              </div>

              {/* Baseline Mix Upload */}
              <div className="space-y-2">
                <Label htmlFor="baseline-mix">Baseline Packaging Mix (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
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
                  >
                    {files.baselineMix ? files.baselineMix.name : 'Upload Baseline Mix'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fallback Dimensions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Fallback Dimensions
              </CardTitle>
              <CardDescription>
                Used when product dimensions are missing from order data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['smallest', 'average', 'largest'].map((size) => (
                <div key={size} className="space-y-2">
                  <Label className="capitalize">{size} Product Dimensions</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['l', 'w', 'h'].map((dim) => (
                      <div key={dim} className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase">{dim}</Label>
                        <Input
                          placeholder="0"
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
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
          className="min-w-[120px]"
        >
          Analyze Suite
        </Button>
      </div>
    </div>
  );
};
