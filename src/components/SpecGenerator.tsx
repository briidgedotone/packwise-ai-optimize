
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Wand2, Table, Sparkles, Brain, Target, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-orange-500/10 rounded-bl-full"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Wand2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Spec Generator</h2>
                  <p className="text-slate-600 text-lg">
                    AI-powered product specification generation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">AI-Powered</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-purple-800">Smart Analysis</div>
                  <div className="text-xs text-purple-600">AI understands your products</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-800">Accurate Specs</div>
                  <div className="text-xs text-orange-600">Industry-trained models</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-emerald-800">Instant Results</div>
                  <div className="text-xs text-emerald-600">Bulk processing ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-purple-50/50 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Upload className="h-5 w-5 text-purple-600" />
                  </div>
                  Product List
                </CardTitle>
                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700">Upload products to generate AI-powered specifications</span>
                  </div>
                </div>
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
            className="min-w-[160px] bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-3 px-8"
          >
            {!productFile || !boundingDimensions.min.l ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Complete Setup
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Generate Specs
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
