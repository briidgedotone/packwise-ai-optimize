
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Wand2, Table } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Spec Generator</h2>
          <p className="text-slate-600">
            Generate estimated L×W×H and CUIN for products using AI and industry knowledge
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Upload className="h-5 w-5 text-slate-600" />
                  Product List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-4">
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
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      {productFile ? productFile.name : 'Choose File'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-700 font-medium">Additional Information (Optional)</Label>
                    <div className="grid gap-4">
                      <Input
                        placeholder="Category (e.g., Electronics, Cosmetics)"
                        className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                        value={additionalInfo.category}
                        onChange={(e) => setAdditionalInfo(prev => ({ ...prev, category: e.target.value }))}
                      />
                      <Input
                        placeholder="Material Type (e.g., plastic, metal)"
                        className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                        value={additionalInfo.material}
                        onChange={(e) => setAdditionalInfo(prev => ({ ...prev, material: e.target.value }))}
                      />
                      <Input
                        placeholder="Size Range (e.g., S, M, L)"
                        className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                        value={additionalInfo.size}
                        onChange={(e) => setAdditionalInfo(prev => ({ ...prev, size: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Bounding Dimensions *</CardTitle>
                <CardDescription className="text-slate-600">
                  Define the range to keep AI estimates realistic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {['min', 'avg', 'max'].map((type) => (
                  <div key={type} className="space-y-3">
                    <Label className="capitalize text-slate-700 font-medium">{type === 'avg' ? 'Average' : type === 'min' ? 'Minimum' : 'Maximum'} Dimensions</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['l', 'w', 'h'].map((dim) => (
                        <div key={dim} className="space-y-2">
                          <Label className="text-xs text-slate-500 uppercase font-medium">{dim}</Label>
                          <Input
                            placeholder="0"
                            className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
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

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Table className="h-5 w-5 text-slate-600" />
                  Generated Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-slate-500">
                  <Wand2 className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <p className="text-sm">Upload product list to generate specs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            size="lg"
            disabled={!productFile || !boundingDimensions.min.l || !boundingDimensions.avg.l || !boundingDimensions.max.l}
            className="min-w-[140px] bg-slate-800 hover:bg-slate-700 text-white"
          >
            Generate Specs
          </Button>
        </div>
      </div>
    </div>
  );
};
