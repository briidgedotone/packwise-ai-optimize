import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, Eye, FileImage, AlertCircle, 
  Loader2, CheckCircle2, Sparkles,
  ArrowRight, X, Plus, Settings, Package,
  Layers, Shield
} from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
// import { motion, AnimatePresence } from 'framer-motion';

export const PDPAnalyzer = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<{
    mainPDP: File | null;
    competitors: File[];
  }>({
    mainPDP: null,
    competitors: [],
  });

  const [metaInfo, setMetaInfo] = useState({
    category: '',
    description: '',
    shelfType: '',
    claims: '',
    analysisFocus: 'Overall Visibility',
    targetDemographics: 'General Consumer',
    retailEnvironment: 'Grocery Store',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mainPDPPreview, setMainPDPPreview] = useState<string | null>(null);
  const [competitorPreviews, setCompetitorPreviews] = useState<string[]>([]);

  // Convex hooks
  const analyzePDP = useAction(api.pdpAnalyzer.analyzePDP);

  // File conversion helpers
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
    });
  };

  const handleMainPDPUpload = async (file: File | null) => {
    setFiles(prev => ({ ...prev, mainPDP: file }));
    if (file) {
      const preview = await fileToDataUrl(file);
      setMainPDPPreview(preview);
      toast.success(`Main PDP loaded: ${file.name}`);
    } else {
      setMainPDPPreview(null);
    }
  };

  const handleCompetitorUpload = async (file: File | null) => {
    if (file && files.competitors.length < 4) {
      setFiles(prev => ({ ...prev, competitors: [...prev.competitors, file] }));
      const preview = await fileToDataUrl(file);
      setCompetitorPreviews(prev => [...prev, preview]);
      toast.success(`Competitor PDP added: ${file.name}`);
    }
  };

  const removeCompetitor = (index: number) => {
    setFiles(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
    setCompetitorPreviews(prev => prev.filter((_, i) => i !== index));
    toast.info('Competitor PDP removed');
  };

  // Handle PDP analysis
  const handleAnalyzePDP = async () => {
    if (!files.mainPDP) {
      toast.error('Please upload your main PDP first');
      return;
    }

    if (!metaInfo.category.trim()) {
      toast.error('Please enter a product category');
      return;
    }

    if (!metaInfo.description.trim()) {
      toast.error('Please provide a product description');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert main PDP to base64
      const mainPDPData = await fileToBase64(files.mainPDP);
      
      // Convert competitor PDPs to base64
      const competitorPDPs = await Promise.all(
        files.competitors.map(file => fileToBase64(file))
      );

      // Store images for results page
      const imageData: any = {
        competitors: []
      };

      if (files.mainPDP) {
        imageData.mainPDP = {
          file: {
            name: files.mainPDP.name,
            size: files.mainPDP.size,
            type: files.mainPDP.type
          },
          dataUrl: await fileToDataUrl(files.mainPDP)
        };
      }

      if (files.competitors.length > 0) {
        imageData.competitors = await Promise.all(
          files.competitors.map(async (file) => ({
            file: {
              name: file.name,
              size: file.size,
              type: file.type
            },
            dataUrl: await fileToDataUrl(file)
          }))
        );
      }

      const response = await analyzePDP({
        mainPDPData,
        competitorPDPs: competitorPDPs.length > 0 ? competitorPDPs : undefined,
        metaInfo: {
          category: metaInfo.category,
          description: metaInfo.description,
          shelfType: metaInfo.shelfType || undefined,
          claims: metaInfo.claims || undefined,
          analysisFocus: metaInfo.analysisFocus,
          targetDemographics: metaInfo.targetDemographics,
          retailEnvironment: metaInfo.retailEnvironment,
        },
      });

      // Store results and images in session storage
      sessionStorage.setItem('pdpAnalysisResults', JSON.stringify(response));
      sessionStorage.setItem('pdpAnalysisMetaInfo', JSON.stringify(metaInfo));
      sessionStorage.setItem('pdpAnalysisImages', JSON.stringify(imageData));
      
      navigate('/pdp-analysis/results');
      
      toast.success('PDP analysis completed successfully!');
      
    } catch (error) {
      console.error('Error analyzing PDP:', error);
      toast.error('Failed to analyze PDP');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-gray-900">PDP Analyzer</h1>
              <p className="text-sm text-gray-500 mt-1">
                AI-powered packaging analysis with consumer psychology insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 rounded-lg">
            <Eye className="h-3 w-3 text-pink-600" />
            <span className="text-xs font-medium text-pink-700">Visual Intelligence</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Main Upload Section */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <FileImage className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Your Principal Display Panel</h2>
          </div>

          <div>
            {!mainPDPPreview ? (
              <label className="relative block">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleMainPDPUpload(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-pink-400 hover:bg-pink-50/50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your PDP</h3>
                  <p className="text-gray-500 mb-4">Drop your package front image here or click to browse</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Secure upload • JPG, PNG, PDF • Max 10MB</span>
                  </div>
                </div>
              </label>
            ) : (
              <div className="relative">
                <img
                  src={mainPDPPreview}
                  alt="Main PDP"
                  className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                />
                <button
                  onClick={() => {
                    setFiles(prev => ({ ...prev, mainPDP: null }));
                    setMainPDPPreview(null);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Main PDP uploaded successfully</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Product Context</h2>
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">Required</span>
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  Product Category
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Soft Drinks, Snacks, Cosmetics"
                  className="h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={metaInfo.category}
                  onChange={(e) => setMetaInfo(prev => ({ ...prev, category: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold mb-2">Shelf Type</Label>
                <Input
                  placeholder="e.g., Vertical Peg, Laydown Box"
                  className="h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={metaInfo.shelfType}
                  onChange={(e) => setMetaInfo(prev => ({ ...prev, shelfType: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                Product Description
                <span className="text-red-500">*</span>
              </Label>
              <textarea
                placeholder="Describe your product in 1-2 sentences (e.g., 'A refreshing carbonated cola drink with natural flavors, targeting young adults')"
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                rows={3}
                value={metaInfo.description}
                onChange={(e) => setMetaInfo(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label className="text-gray-700 font-semibold mb-2">Key Claims</Label>
              <Input
                placeholder="e.g., Organic, Sugar-Free, Premium Quality"
                className="h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={metaInfo.claims}
                onChange={(e) => setMetaInfo(prev => ({ ...prev, claims: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Competitor PDPs */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Competitive Benchmarking</h2>
            </div>
            <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded">Optional</span>
          </div>

          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {competitorPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  <img
                    src={preview}
                    alt={`Competitor ${String.fromCharCode(65 + index)}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeCompetitor(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-center text-sm font-medium text-gray-700">
                    Competitor {String.fromCharCode(65 + index)}
                  </div>
                </div>
              ))}
              
              {files.competitors.length < 4 && (
                <label className="relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleCompetitorUpload(e.target.files?.[0] || null)}
                    disabled={files.competitors.length >= 4}
                    className="hidden"
                  />
                  <div className="h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
                    <Plus className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">Add Competitor</span>
                    <span className="text-xs text-gray-400 mt-1">{files.competitors.length}/4</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Settings */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Analysis Parameters</h2>
          </div>

          <div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <Label className="text-gray-700 font-semibold mb-2">Analysis Focus</Label>
                <select 
                  className="w-full h-12 px-4 text-base border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={metaInfo.analysisFocus}
                  onChange={(e) => setMetaInfo(prev => ({ ...prev, analysisFocus: e.target.value }))}
                >
                  <option value="Overall Visibility">Overall Visibility</option>
                  <option value="Color Contrast">Color Contrast</option>
                  <option value="Text Readability">Text Readability</option>
                  <option value="Brand Recognition">Brand Recognition</option>
                </select>
              </div>
              
              <div>
                <Label className="text-gray-700 font-semibold mb-2">Target Demographics</Label>
                <select 
                  className="w-full h-12 px-4 text-base border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={metaInfo.targetDemographics}
                  onChange={(e) => setMetaInfo(prev => ({ ...prev, targetDemographics: e.target.value }))}
                >
                  <option value="General Consumer">General Consumer</option>
                  <option value="Premium Segment">Premium Segment</option>
                  <option value="Budget Conscious">Budget Conscious</option>
                  <option value="Young Adults (18-35)">Young Adults (18-35)</option>
                </select>
              </div>
              
              <div>
                <Label className="text-gray-700 font-semibold mb-2">Retail Environment</Label>
                <select 
                  className="w-full h-12 px-4 text-base border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={metaInfo.retailEnvironment}
                  onChange={(e) => setMetaInfo(prev => ({ ...prev, retailEnvironment: e.target.value }))}
                >
                  <option value="Grocery Store">Grocery Store</option>
                  <option value="Pharmacy/Drug Store">Pharmacy/Drug Store</option>
                  <option value="Department Store">Department Store</option>
                  <option value="Convenience Store">Convenience Store</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center py-6">
          <Button 
            size="lg"
            disabled={!files.mainPDP || !metaInfo.category.trim() || !metaInfo.description.trim() || isAnalyzing}
            onClick={handleAnalyzePDP}
            className="relative bg-pink-600 hover:bg-pink-700 text-white disabled:bg-gray-400 px-8 py-3 text-base font-medium rounded-lg transition-colors group"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Analyzing Your Design...</span>
              </div>
            ) : !files.mainPDP ? (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                <span>Upload PDP to Begin</span>
              </div>
            ) : !metaInfo.category.trim() || !metaInfo.description.trim() ? (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                <span>Complete Required Fields</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                <span>Analyze with AI Intelligence</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};