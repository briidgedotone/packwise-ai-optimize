
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Eye, BarChart3, FileImage, Camera, Zap, Target, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-pink-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 rounded-bl-full"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">PDP Analyzer</h2>
                  <p className="text-slate-600 text-lg">
                    AI-powered visual analysis and competitor benchmarking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-lg">
                <Camera className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-700">Visual AI</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-indigo-800">Visual Analysis</div>
                  <div className="text-xs text-indigo-600">AI-powered image recognition</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg border border-pink-200">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Target className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-pink-800">Visibility Score</div>
                  <div className="text-xs text-pink-600">Benchmarked performance</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-purple-800">Smart Recommendations</div>
                  <div className="text-xs text-purple-600">Actionable design insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileImage className="h-5 w-5 text-indigo-600" />
                  </div>
                  Your PDP
                </CardTitle>
                <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm text-indigo-700">Upload your Principal Display Panel for AI analysis</span>
                  </div>
                </div>
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
            className="min-w-[160px] bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-3 px-8"
          >
            {!files.mainPDP ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Upload PDP
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Analyze PDP
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
