import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIAssistant } from '@/components/AIAssistant';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, Eye, FileImage, AlertCircle, 
  Loader2, CheckCircle2, Sparkles,
  ArrowRight, X, Plus, Settings, Package,
  Layers, Shield, Scale, Target, Award,
  BarChart3, TrendingUp, MessageSquare
} from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

export const DesignComparator = () => {
  const navigate = useNavigate();
  const { isOpen: isAIOpen, closeAssistant, toggleAssistant } = useAIAssistant();
  const [designs, setDesigns] = useState<Array<{
    id: string;
    file: File | null;
    preview: string | null;
    variant?: string;
    productName?: string;
    claims?: string[];
  }>>([
    { id: 'design_1', file: null, preview: null },
    { id: 'design_2', file: null, preview: null }
  ]);

  const [comparisonSettings, setComparisonSettings] = useState({
    category: '',
    marketContext: '',
    customWeights: {
      branding: 0.18,
      hierarchy: 0.18,
      variant: 0.12,
      color: 0.10,
      imagery: 0.08,
      claims: 0.08,
      compliance: 0.07,
      accessibility: 0.07,
      feasibility: 0.06,
      sustainability: 0.06,
      differentiation: 0.10
    }
  });

  const [isComparing, setIsComparing] = useState(false);

  // Convex hooks
  const compareDesigns = useAction(api.designComparator.compareDesigns);

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

  const handleDesignUpload = async (index: number, file: File | null) => {
    if (file) {
      const preview = await fileToDataUrl(file);
      setDesigns(prev => prev.map((design, i) => 
        i === index ? { ...design, file, preview } : design
      ));
      toast.success(`Design ${index + 1} loaded: ${file.name}`);
    } else {
      setDesigns(prev => prev.map((design, i) => 
        i === index ? { ...design, file: null, preview: null } : design
      ));
    }
  };

  const addDesignSlot = () => {
    if (designs.length < 5) {
      setDesigns(prev => [...prev, { 
        id: `design_${prev.length + 1}`, 
        file: null, 
        preview: null 
      }]);
    }
  };

  const removeDesignSlot = (index: number) => {
    if (designs.length > 2) {
      setDesigns(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateDesignInfo = (index: number, field: string, value: string | string[]) => {
    setDesigns(prev => prev.map((design, i) => 
      i === index ? { ...design, [field]: value } : design
    ));
  };

  const handleCompareDesigns = async () => {
    const validDesigns = designs.filter(d => d.file);
    
    if (validDesigns.length < 2) {
      toast.error('Please upload at least 2 designs to compare');
      return;
    }

    if (!comparisonSettings.category.trim()) {
      toast.error('Please enter a product category');
      return;
    }

    setIsComparing(true);
    
    try {
      const designData = await Promise.all(
        validDesigns.map(async (design) => ({
          id: design.id,
          image_data: await fileToBase64(design.file!),
          variant: design.variant || undefined,
          copy: design.productName || design.claims ? {
            product_name: design.productName || undefined,
            claims: design.claims || undefined
          } : undefined
        }))
      );

      const response = await compareDesigns({
        category: comparisonSettings.category,
        market_context: comparisonSettings.marketContext || undefined,
        designs: designData,
        weights: comparisonSettings.customWeights
      });

      // Store results and images in session storage
      sessionStorage.setItem('designComparisonResults', JSON.stringify(response));
      sessionStorage.setItem('designComparisonSettings', JSON.stringify(comparisonSettings));
      sessionStorage.setItem('designComparisonImages', JSON.stringify(
        validDesigns.map(d => ({
          id: d.id,
          preview: d.preview,
          variant: d.variant,
          productName: d.productName
        }))
      ));
      
      navigate('/design-comparison/results');
      toast.success('Design comparison completed successfully!');
      
    } catch (error) {
      console.error('Error comparing designs:', error);
      
      // Handle different types of errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Connection lost') || errorMessage.includes('WebSocket')) {
        toast.error('Connection lost during analysis. Please try again in a moment.');
      } else if (errorMessage.includes('ArgumentValidationError')) {
        toast.error('Data validation error. The analysis service is being updated.');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        toast.error('Analysis timed out. Please try with fewer designs or try again later.');
      } else {
        toast.error('Failed to compare designs. Please try again.');
      }
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-gray-900">Design Comparator</h1>
              <p className="text-sm text-gray-500 mt-1">
                Compare up to 5 packaging designs with rigorous scoring methodology
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Award className="h-3 w-3 text-indigo-600" />
            <span className="text-xs font-medium text-indigo-700">Scientific Analysis</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        
        {/* Comparison Settings */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Comparison Parameters</h2>
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
                  placeholder="e.g., Greek yogurt, snack bar, skincare serum"
                  className="h-12 text-base border-gray-200 focus:border-indigo-500"
                  value={comparisonSettings.category}
                  onChange={(e) => setComparisonSettings(prev => ({ ...prev, category: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold mb-2">Market Context</Label>
                <Textarea
                  placeholder="US grocery; 6 ft shelf distance; Non-GMO claims common; thumbnails used on Instacart"
                  className="h-12 text-base border-gray-200 focus:border-indigo-500 resize-none"
                  value={comparisonSettings.marketContext}
                  onChange={(e) => setComparisonSettings(prev => ({ ...prev, marketContext: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Design Upload Section */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Design Uploads</h2>
            </div>
            <div className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
              {designs.filter(d => d.file).length}/{designs.length} uploaded
            </div>
          </div>

          <div className="space-y-6">
            {designs.map((design, index) => (
              <div key={design.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Design {index + 1}</h3>
                  {designs.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDesignSlot(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* Image Upload */}
                  <div>
                    {!design.preview ? (
                      <label className="relative block">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleDesignUpload(index, e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Upload Design</p>
                        </div>
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={design.preview}
                          alt={`Design ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDesignUpload(index, null)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Design Metadata */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Variant (e.g., Strawberry)"
                      value={design.variant || ''}
                      onChange={(e) => updateDesignInfo(index, 'variant', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Product Name"
                      value={design.productName || ''}
                      onChange={(e) => updateDesignInfo(index, 'productName', e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Textarea
                      placeholder="Key claims (one per line)"
                      value={design.claims?.join('\n') || ''}
                      onChange={(e) => updateDesignInfo(index, 'claims', e.target.value.split('\n').filter(c => c.trim()))}
                      className="text-sm resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            {designs.length < 5 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={addDesignSlot}
                  className="border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Design ({designs.length}/5)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Scoring Weights</h2>
            <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
              Advanced
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(comparisonSettings.customWeights).map(([key, value]) => (
              <div key={key}>
                <Label className="text-sm font-medium text-gray-700 capitalize mb-1 block">
                  {key === 'differentiation' ? 'Shelf Impact' : key}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={value}
                    onChange={(e) => setComparisonSettings(prev => ({
                      ...prev,
                      customWeights: {
                        ...prev.customWeights,
                        [key]: parseFloat(e.target.value) || 0
                      }
                    }))}
                    className="text-sm"
                  />
                  <span className="text-xs text-gray-500 min-w-0">
                    {Math.round(value * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Weight Total:</strong> {(Object.values(comparisonSettings.customWeights).reduce((sum, w) => sum + w, 0)).toFixed(2)}
            {Object.values(comparisonSettings.customWeights).reduce((sum, w) => sum + w, 0) !== 1 && (
              <span className="text-amber-600 ml-2">⚠️ Weights will be auto-normalized to 1.0</span>
            )}
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-center py-6">
          <Button 
            size="lg"
            disabled={designs.filter(d => d.file).length < 2 || !comparisonSettings.category.trim() || isComparing}
            onClick={handleCompareDesigns}
            className="relative bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400 px-8 py-3 text-base font-medium rounded-lg transition-colors group"
          >
            {isComparing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Comparing Designs...</span>
              </div>
            ) : designs.filter(d => d.file).length < 2 ? (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                <span>Upload at least 2 designs</span>
              </div>
            ) : !comparisonSettings.category.trim() ? (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                <span>Enter product category</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6" />
                <span>Compare Designs with AI</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </div>

        {/* Floating AI Assistant Button */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
          <Button
            onClick={toggleAssistant}
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>

        {/* AI Assistant */}
        <AIAssistant 
          isOpen={isAIOpen}
          onClose={closeAssistant}
          currentFeature="design-comparator"
        />
      </div>
    </div>
  );
};