import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, Eye, FileImage, AlertCircle, 
  Loader2, CheckCircle2, Sparkles,
  ArrowRight, X, Plus, Settings, Package,
  Layers, Shield, ChevronRight, ChevronLeft,
  Check, Calculator
} from 'lucide-react';
import { ProductManual } from '@/components/ui/ProductManual';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { designSystem } from '@/lib/design-system';
import { useTokenGuard } from '@/hooks/useTokenGuard';
// import { motion, AnimatePresence } from 'framer-motion';

export const PDPAnalyzer = () => {
  const navigate = useNavigate();
  const { canUseToken, checkAndConsumeToken } = useTokenGuard();
  
  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(true);
  
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

  const [mainPDPPreview, setMainPDPPreview] = useState<string | null>(null);
  const [competitorPreviews, setCompetitorPreviews] = useState<string[]>([]);

  // Convex hooks
  const analyzePDP = useAction(api.pdpAnalyzer.analyzePDP);

  // Step validation
  const isStep1Valid = files.mainPDP !== null;
  const isStep2Valid = metaInfo.category.trim() !== '' && metaInfo.description.trim() !== '';
  const isStep3Valid = true; // Competitive benchmarking is optional
  const isStep4Valid = isStep2Valid; // Analysis still requires step 2

  const steps = [
    { 
      number: 1, 
      title: 'Design Upload', 
      description: 'Upload your packaging design',
      isValid: isStep1Valid,
      isComplete: isStep1Valid && currentStep > 1
    },
    { 
      number: 2, 
      title: 'Product Context', 
      description: 'Enter product information',
      isValid: isStep2Valid,
      isComplete: isStep2Valid && currentStep > 2
    },
    { 
      number: 3, 
      title: 'Competitive Benchmarking', 
      description: 'Add competitor designs (optional)',
      isValid: true, // Always valid since it's optional
      isComplete: currentStep > 3
    },
    { 
      number: 4, 
      title: 'Analysis Settings', 
      description: 'Configure analysis and generate',
      isValid: isStep2Valid, // Still requires step 2 to be valid
      isComplete: false
    }
  ];

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
      const result = await checkAndConsumeToken('pdp_analyzer', async () => {
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
        
        return response;
      });

      if (result.success) {
        navigate('/pdp-analysis/results');
        toast.success('PDP analysis completed successfully!');
      } else if (result.error === 'NO_TOKENS') {
        navigate('/onboarding');
      }
      
    } catch (error) {
      console.error('Error analyzing PDP:', error);
      toast.error('Failed to analyze PDP');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStepHeader = () => (
    <div className="mb-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
              currentStep === step.number
                ? 'text-white'
                  + ` border-[${designSystem.colors.primary}]`
                  + ` bg-[${designSystem.colors.primary}]`
                : step.isComplete
                  ? 'text-white'
                    + ` border-[${designSystem.colors.primary}] bg-[${designSystem.colors.primary}]`
                  : step.isValid
                    ? `border-[${designSystem.colors.primary}] text-[${designSystem.colors.primary}]`
                      + ` bg-[${designSystem.colors.primaryLight}]`
                    : 'border-gray-300 bg-gray-50 text-gray-400'
            }`}>
              {step.isComplete ? <Check className="h-5 w-5" /> : step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 transition-all ${
                step.isComplete ? `bg-[${designSystem.colors.primary}]` : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Info */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Step {currentStep}: {steps[currentStep - 1].title}
        </h2>
        <p className="text-gray-600">
          {steps[currentStep - 1].description}
        </p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-3xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
            <FileImage className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Your Packaging Design</h3>
        </div>

        {!mainPDPPreview ? (
          <label className="relative block">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleMainPDPUpload(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center transition-all cursor-pointer group min-h-[400px] flex flex-col justify-center" onMouseEnter={(e) => { e.currentTarget.style.borderColor = designSystem.colors.primary; e.currentTarget.style.backgroundColor = designSystem.colors.primaryLight; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.backgroundColor = ''; }}>
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: designSystem.colors.primary }}>
                <Upload className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-3">Upload Your Design</h3>
              <p className="text-lg text-gray-500 mb-4">Drop or Upload Your Packaging Design Here</p>
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
              className="w-full max-w-md mx-auto rounded-3xl shadow-lg"
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
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-3xl">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Main PDP uploaded successfully</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto">
      {/* Product Information */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-3xl flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Product Context</h3>
          </div>
          <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">Required</span>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
              className="w-full px-4 py-3 text-base border border-gray-200 rounded-3xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
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

    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      {/* Competitor PDPs */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-3xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Competitive Benchmarking</h3>
          </div>
          <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded">Optional</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {competitorPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Competitor ${String.fromCharCode(65 + index)}`}
                className="w-full h-32 object-cover rounded-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="h-32 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all" onMouseEnter={(e) => { e.currentTarget.style.borderColor = designSystem.colors.primary; e.currentTarget.style.backgroundColor = designSystem.colors.primaryLight; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.backgroundColor = ''; }}>
                <Plus className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">Add Competitor</span>
                <span className="text-xs text-gray-400 mt-1">{files.competitors.length}/4</span>
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Analysis Settings */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-3xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
            <Settings className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Analysis Parameters</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <div>
            <Label className="text-gray-700 font-semibold mb-2">Analysis Focus</Label>
            <select 
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-3xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={metaInfo.analysisFocus}
              onChange={(e) => setMetaInfo(prev => ({ ...prev, analysisFocus: e.target.value }))}
            >
              <option value="Overall Visibility">Overall Visibility</option>
              <option value="Color Contrast">Color Contrast</option>
              <option value="Text Readability">Text Readability</option>
              <option value="Brand Recognition">Brand Recognition</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <Label className="text-gray-700 font-semibold mb-2">Target Demographics</Label>
            <select 
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-3xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={metaInfo.targetDemographics}
              onChange={(e) => setMetaInfo(prev => ({ ...prev, targetDemographics: e.target.value }))}
            >
              <option value="General Consumer">General Consumer</option>
              <option value="Premium Segment">Premium Segment</option>
              <option value="Budget Conscious">Budget Conscious</option>
              <option value="Young Adults (18-35)">Young Adults (18-35)</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <Label className="text-gray-700 font-semibold mb-2">Retail Environment</Label>
            <select 
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-3xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={metaInfo.retailEnvironment}
              onChange={(e) => setMetaInfo(prev => ({ ...prev, retailEnvironment: e.target.value }))}
            >
              <option value="Grocery Store">Grocery Store</option>
              <option value="Pharmacy/Drug Store">Pharmacy/Drug Store</option>
              <option value="Department Store">Department Store</option>
              <option value="Convenience Store">Convenience Store</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <Button
            onClick={handleAnalyzePDP}
            disabled={!canUseToken || !isStep4Valid || isAnalyzing}
            className="w-full hover:opacity-90 text-white rounded-full"
            style={{ backgroundColor: designSystem.colors.primary }}
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing Your Design...
              </>
            ) : !canUseToken ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                No Tokens Available
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Analyze with AI Intelligence
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex justify-between items-center mt-6">
      <Button
        variant="outline"
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="text-sm text-gray-500">
        Step {currentStep} of {steps.length}
      </div>

      {currentStep < steps.length ? (
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          disabled={!steps[currentStep - 1].isValid}
          className="hover:opacity-90 text-white rounded-full"
          style={{ backgroundColor: designSystem.colors.primary }}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <div className="w-20"></div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
      <div>
        {/* Show placeholder when help modal is open */}
        {showHelpModal && (
          <div className="text-center py-20">
            <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Design Analyzer</h2>
            <p className="text-gray-600">Please read the manual to get started</p>
          </div>
        )}
        
        {/* Show stepped interface when help modal is closed */}
        {!showHelpModal && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 relative">
            {renderStepHeader()}
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            
            {renderNavigation()}
          </div>
        )}
      </div>
      
      <ProductManual
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        productName="Design Analyzer"
        productIcon={<Eye className="h-5 w-5 text-white" />}
        sections={[
          {
            title: "INPUTS",
            icon: "📥",
            items: [
              "Packaging design images (PNG, JPG, JPEG formats)",
              "Product context: category, description, and target demographics",
              "Optional: Competitor design images for benchmarking",
              "Analysis preferences: focus areas and retail environment"
            ]
          },
          {
            title: "OUTPUTS",
            icon: "📤", 
            items: [
              "Visual impact and shelf visibility analysis",
              "Brand coherence and messaging effectiveness assessment", 
              "Competitive positioning and differentiation insights",
              "Actionable recommendations for design improvements"
            ]
          },
          {
            title: "HOW IT WORKS",
            icon: "🎯",
            items: [
              "1. Upload your packaging design image",
              "2. Provide product context and target market details",
              "3. Optionally add competitor designs for benchmarking",
              "4. Generate comprehensive design analysis and recommendations"
            ]
          }
        ]}
      />
    </div>
  );
};