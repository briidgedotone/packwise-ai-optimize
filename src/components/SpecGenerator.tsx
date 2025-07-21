
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Spec Generator</h2>
        <p className="text-muted-foreground">
          Generate estimated L×W×H and CUIN for products using AI and industry knowledge
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Product List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
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
                  >
                    {productFile ? productFile.name : 'Choose File'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label>Additional Information (Optional)</Label>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Category (e.g., Electronics, Cosmetics)"
                      value={additionalInfo.category}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, category: e.target.value }))}
                    />
                    <Input
                      placeholder="Material Type (e.g., plastic, metal)"
                      value={additionalInfo.material}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, material: e.target.value }))}
                    />
                    <Input
                      placeholder="Size Range (e.g., S, M, L)"
                      value={additionalInfo.size}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Bounding Dimensions *</CardTitle>
              <CardDescription>
                Define the range to keep AI estimates realistic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['min', 'avg', 'max'].map((type) => (
                <div key={type} className="space-y-2">
                  <Label className="capitalize">{type === 'avg' ? 'Average' : type === 'min' ? 'Minimum' : 'Maximum'} Dimensions</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['l', 'w', 'h'].map((dim) => (
                      <div key={dim} className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase">{dim}</Label>
                        <Input
                          placeholder="0"
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5" />
                Generated Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
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
          className="min-w-[120px]"
        >
          Generate Specs
        </Button>
      </div>
    </div>
  );
};
