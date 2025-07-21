
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Packaging Demand Planner</h2>
        <p className="text-muted-foreground">
          Calculate exact packaging quantities needed based on forecasted product volumes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Required Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Forecast Upload */}
              <div className="space-y-2">
                <Label htmlFor="forecast-file">Forecasted Product Orders *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
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
                  >
                    {files.forecast ? files.forecast.name : 'Choose File'}
                  </Button>
                </div>
              </div>

              {/* Packaging Suite Upload */}
              <div className="space-y-2">
                <Label htmlFor="suite-file">Packaging Suite *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
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
                  >
                    {files.packagingSuite ? files.packagingSuite.name : 'Choose File'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Fallback Dimensions
              </CardTitle>
              <CardDescription>
                Used when product specs are incomplete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['min', 'avg', 'max'].map((type) => (
                <div key={type} className="space-y-2">
                  <Label className="capitalize">{type === 'avg' ? 'Average' : type === 'min' ? 'Minimum' : 'Maximum'} Product Dimensions</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['l', 'w', 'h'].map((dim) => (
                      <div key={dim} className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase">{dim}</Label>
                        <Input
                          placeholder="0"
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Demand Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Upload forecast data to see demand planning results</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
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
          className="min-w-[120px]"
        >
          Generate Plan
        </Button>
      </div>
    </div>
  );
};
