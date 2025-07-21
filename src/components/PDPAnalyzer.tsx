
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
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">PDP Analyzer</h2>
          <p className="text-slate-600">
            Analyze and score your Principal Display Panel effectiveness against competitors
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <FileImage className="h-5 w-5 text-slate-600" />
                  Your PDP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm text-slate-600 mb-4">
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
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    {files.mainPDP ? files.mainPDP.name : 'Choose File'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Competitor PDPs (Optional)</CardTitle>
                <CardDescription className="text-slate-600">
                  Upload up to 4 competitor PDPs for benchmarking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
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
                    className="text-slate-600 hover:bg-slate-100"
                  >
                    Add Competitor ({files.competitors.length}/4)
                  </Button>
                </div>

                {files.competitors.length > 0 && (
                  <div className="space-y-2">
                    {files.competitors.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCompetitor(index)}
                          className="text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Product Information</CardTitle>
                <CardDescription className="text-slate-600">
                  Optional details to improve analysis accuracy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Product Category</Label>
                  <Input
                    placeholder="e.g., snacks, cosmetics, electronics"
                    className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                    value={metaInfo.category}
                    onChange={(e) => setMetaInfo(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Intended Shelf Type</Label>
                  <Input
                    placeholder="e.g., vertical peg, laydown box, upright box"
                    className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                    value={metaInfo.shelfType}
                    onChange={(e) => setMetaInfo(prev => ({ ...prev, shelfType: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Primary Claims</Label>
                  <Textarea
                    placeholder="List the main claims or benefits featured on your package"
                    className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                    value={metaInfo.claims}
                    onChange={(e) => setMetaInfo(prev => ({ ...prev, claims: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <BarChart3 className="h-5 w-5 text-slate-600" />
                  Visibility Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-slate-500">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <p className="text-sm">Upload your PDP to see visibility analysis</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Design Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">AI recommendations will appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Competitor Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
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
            className="min-w-[140px] bg-slate-800 hover:bg-slate-700 text-white"
          >
            Analyze PDP
          </Button>
        </div>
      </div>
    </div>
  );
};
