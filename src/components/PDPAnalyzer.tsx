
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Eye, BarChart3, FileImage } from 'lucide-react';

export const PDPAnalyzer = () => {
  const [files, setFiles] = useState<{
    mainPDP: File | null;
    competitors: File[];
  }>({
    mainPDP: null,
    competitors: [],
  });

  const [metaInfo, setMetaInfo] = useState({
    category: '',
    shelfType: '',
    claims: '',
  });

  const handleMainPDPUpload = (file: File | null) => {
    setFiles(prev => ({ ...prev, mainPDP: file }));
  };

  const handleCompetitorUpload = (file: File | null) => {
    if (file && files.competitors.length < 4) {
      setFiles(prev => ({ ...prev, competitors: [...prev.competitors, file] }));
    }
  };

  const removeCompetitor = (index: number) => {
    setFiles(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">PDP Analyzer</h2>
        <p className="text-muted-foreground">
          Analyze and score your Principal Display Panel effectiveness against competitors
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Your PDP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Upload your Principal Display Panel (JPG, PNG, PDF)
                </p>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleMainPDPUpload(e.target.files?.[0] || null)}
                  className="hidden"
                  id="main-pdp"
                />
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('main-pdp')?.click()}
                >
                  {files.mainPDP ? files.mainPDP.name : 'Choose File'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Competitor PDPs (Optional)</CardTitle>
              <CardDescription>
                Upload up to 4 competitor PDPs for benchmarking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleCompetitorUpload(e.target.files?.[0] || null)}
                  className="hidden"
                  id="competitor-pdp"
                  disabled={files.competitors.length >= 4}
                />
                <Button 
                  variant="ghost"
                  onClick={() => document.getElementById('competitor-pdp')?.click()}
                  disabled={files.competitors.length >= 4}
                >
                  Add Competitor ({files.competitors.length}/4)
                </Button>
              </div>

              {files.competitors.length > 0 && (
                <div className="space-y-2">
                  {files.competitors.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCompetitor(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Product Information</CardTitle>
              <CardDescription>
                Optional details to improve analysis accuracy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Category</Label>
                <Input
                  placeholder="e.g., snacks, cosmetics, electronics"
                  value={metaInfo.category}
                  onChange={(e) => setMetaInfo(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Intended Shelf Type</Label>
                <Input
                  placeholder="e.g., vertical peg, laydown box, upright box"
                  value={metaInfo.shelfType}
                  onChange={(e) => setMetaInfo(prev => ({ ...prev, shelfType: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Claims</Label>
                <Textarea
                  placeholder="List the main claims or benefits featured on your package"
                  value={metaInfo.claims}
                  onChange={(e) => setMetaInfo(prev => ({ ...prev, claims: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Visibility Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Upload your PDP to see visibility analysis</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Design Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">AI recommendations will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Competitor Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  {files.competitors.length > 0 
                    ? `Comparing against ${files.competitors.length} competitor${files.competitors.length > 1 ? 's' : ''}`
                    : 'Upload competitor PDPs for benchmarking'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          size="lg"
          disabled={!files.mainPDP}
          className="min-w-[120px]"
        >
          Analyze PDP
        </Button>
      </div>
    </div>
  );
};
