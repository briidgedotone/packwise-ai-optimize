
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Wand2, Table, Sparkles, Brain, Target, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export const SpecGenerator = () => {
  const [productFile, setProductFile] = useState<File | null>(null);
  const [boundingDimensions, setBoundingDimensions] = useState({
    min: { l: '', w: '', h: '' },
    avg: { l: '', w: '', h: '' },
    max: { l: '', w: '', h: '' },
  });
  const [additionalInfo, setAdditionalInfo] = useState({
    category: '',
    material: '',
    size: '',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Spec Generator</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  AI-powered product specification generation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg">
              <Brain className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">AI-Powered</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Upload className="h-4 w-4 text-purple-600" />
                  </div>
                  Product List
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500 mt-2">
                  Upload products to generate AI-powered specifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Upload className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      Upload CSV with product names or descriptions
                    </p>
                    <Input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="product-file"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => document.getElementById('product-file')?.click()}
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      {productFile ? productFile.name : 'Choose File'}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-700 font-medium text-sm">Additional Information (Optional)</Label>
                    <div className="grid gap-3 grid-cols-1">
                      <Input
                        placeholder="Category (e.g., Electronics, Cosmetics)"
                        className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={additionalInfo.category}
                        onChange={(e) => setAdditionalInfo(prev => ({ ...prev, category: e.target.value }))}
                      />
                      <Input
                        placeholder="Material Type (e.g., plastic, metal)"
                        className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={additionalInfo.material}
                        onChange={(e) => setAdditionalInfo(prev => ({ ...prev, material: e.target.value }))}
                      />
                      <Input
                        placeholder="Size Range (e.g., S, M, L)"
                        className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={additionalInfo.size}
                        onChange={(e) => setAdditionalInfo(prev => ({ ...prev, size: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Bounding Dimensions Section */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900">Bounding Dimensions *</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500">
                  Define the range to keep AI estimates realistic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['min', 'avg', 'max'].map((type) => (
                  <div key={type} className="space-y-2">
                    <Label className="capitalize text-gray-700 font-medium text-sm">{type === 'avg' ? 'Average' : type === 'min' ? 'Minimum' : 'Maximum'} Dimensions</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['l', 'w', 'h'].map((dim) => (
                        <div key={dim} className="space-y-1">
                          <Label className="text-xs text-gray-500 uppercase font-medium">{dim}</Label>
                          <Input
                            placeholder="0"
                            className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={boundingDimensions[type as keyof typeof boundingDimensions][dim as 'l' | 'w' | 'h']}
                            onChange={(e) => setBoundingDimensions(prev => ({
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
        </div>

        <div className="flex justify-center lg:justify-end px-4 sm:px-0">
          <Button 
            size="lg"
            disabled={!productFile || !boundingDimensions.min.l || !boundingDimensions.avg.l || !boundingDimensions.max.l}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 min-w-48"
          >
            {!productFile || !boundingDimensions.min.l ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Complete Setup
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate Specs
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
