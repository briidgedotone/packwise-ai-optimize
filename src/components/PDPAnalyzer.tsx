
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Eye, BarChart3, FileImage, Camera, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">PDP Analyzer</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  AI-powered visual analysis and competitor benchmarking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-pink-50 border border-pink-200 rounded-lg">
              <Camera className="h-3 w-3 text-pink-600" />
              <span className="text-xs font-medium text-pink-700">Visual AI</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <FileImage className="h-4 w-4 text-indigo-600" />
                  </div>
                  Your PDP
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500 mt-2">
                  Upload your Principal Display Panel for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Upload className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
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
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    {files.mainPDP ? files.mainPDP.name : 'Choose File'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900">Competitor PDPs (Optional)</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500">
                  Upload up to 4 competitor PDPs for benchmarking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors">
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
                    className="text-gray-600 hover:bg-gray-100 text-sm"
                  >
                    Add Competitor ({files.competitors.length}/4)
                  </Button>
                </div>

                {files.competitors.length > 0 && (
                  <div className="space-y-2">
                    {files.competitors.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCompetitor(index)}
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900">Product Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500">
                  Optional details to improve analysis accuracy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-xs sm:text-sm">Product Category</Label>
                  <Input
                    placeholder="e.g., snacks, cosmetics, electronics"
                    className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={metaInfo.category}
                    onChange={(e) => setMetaInfo(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-xs sm:text-sm">Intended Shelf Type</Label>
                  <Input
                    placeholder="e.g., vertical peg, laydown box, upright box"
                    className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={metaInfo.shelfType}
                    onChange={(e) => setMetaInfo(prev => ({ ...prev, shelfType: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-xs sm:text-sm">Primary Claims</Label>
                  <Textarea
                    placeholder="List the main claims or benefits featured on your package"
                    className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={metaInfo.claims}
                    onChange={(e) => setMetaInfo(prev => ({ ...prev, claims: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Options */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  Analysis Settings
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500">
                  Configure analysis parameters for better results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-sm">Analysis Focus</Label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm">
                    <option>Overall Visibility</option>
                    <option>Color Contrast</option>
                    <option>Text Readability</option>
                    <option>Brand Recognition</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-sm">Target Demographics</Label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm">
                    <option>General Consumer</option>
                    <option>Premium Segment</option>
                    <option>Budget Conscious</option>
                    <option>Young Adults (18-35)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium text-sm">Retail Environment</Label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm">
                    <option>Grocery Store</option>
                    <option>Pharmacy/Drug Store</option>
                    <option>Department Store</option>
                    <option>Convenience Store</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end px-4 sm:px-0">
          <Button 
            size="lg"
            disabled={!files.mainPDP}
            className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 disabled:text-gray-500 min-w-48"
          >
            {!files.mainPDP ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Upload PDP
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Analyze PDP
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
