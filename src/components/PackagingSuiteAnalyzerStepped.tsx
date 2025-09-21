import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, FileSpreadsheet, BarChart3, Package, Settings,
  CheckCircle2, AlertCircle, Loader2, Info, X, 
  ChevronRight, ChevronLeft, Plus, Trash2, HelpCircle,
  FileText, ArrowRight, Sparkles, Shield, Eye, Download, Zap
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export const PackagingSuiteAnalyzerBackend = () => {
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSamplePreview, setShowSamplePreview] = useState(false);
  
  // File states
  const [files, setFiles] = useState<{
    orderHistory: File | null;
    packagingSuite: File | null;
  }>({
    orderHistory: null,
    packagingSuite: null,
  });

  // Manual package input
  const [manualPackages, setManualPackages] = useState([
    { name: '', id: '', length: '', width: '', height: '', cost: '', weight: '', usage: '' }
  ]);
  const [useManualPackageInput, setUseManualPackageInput] = useState(false);

  // Configuration options
  const [config, setConfig] = useState({
    allowRotation: true,
    allowStacking: true,
    includeShippingCosts: false,
    minimumFillRate: 30,
    analysisName: `Suite Analysis - ${new Date().toLocaleDateString()}`
  });

  // Analysis state
  const [currentAnalysisId, setCurrentAnalysisId] = useState<Id<"analyses"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Convex mutations and queries
  const startAnalysis = useMutation(api.suiteAnalyzerBackend.startSuiteAnalysis);
  const uploadCSVChunk = useMutation(api.suiteAnalyzerBackend.uploadCSVChunk);
  const analysisData = useQuery(api.suiteAnalyzerBackend.getAnalysis, 
    currentAnalysisId ? { analysisId: currentAnalysisId } : "skip"
  );

  // Step validation
  const isStep1Valid = files.orderHistory !== null;
  const isStep2Valid = files.packagingSuite !== null || (useManualPackageInput && manualPackages.some(pkg => 
    pkg.name && pkg.length && pkg.width && pkg.height
  ));
  const isStep3Valid = config.analysisName.trim() !== '';

  const steps = [
    { 
      number: 1, 
      title: 'Order Data', 
      description: 'Upload your order history',
      icon: FileSpreadsheet,
      isValid: isStep1Valid,
      isComplete: isStep1Valid && currentStep > 1
    },
    { 
      number: 2, 
      title: 'Packaging Suite', 
      description: 'Define available packages',
      icon: Package,
      isValid: isStep2Valid,
      isComplete: isStep2Valid && currentStep > 2
    },
    { 
      number: 3, 
      title: 'Configuration', 
      description: 'Set analysis parameters',
      icon: Settings,
      isValid: isStep3Valid,
      isComplete: isStep3Valid && currentStep > 3
    },
    { 
      number: 4, 
      title: 'Analyze', 
      description: 'Run optimization analysis',
      icon: BarChart3,
      isValid: isStep1Valid && isStep2Valid && isStep3Valid,
      isComplete: false
    }
  ];

  // Handle file uploads
  const handleFileUpload = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
    setError(null);
  };

  // Manual package management
  const addPackageRow = () => {
    setManualPackages([...manualPackages, { 
      name: '', id: '', length: '', width: '', height: '', cost: '', weight: '', usage: '' 
    }]);
  };

  const removePackageRow = (index: number) => {
    if (manualPackages.length > 1) {
      setManualPackages(manualPackages.filter((_, i) => i !== index));
    }
  };

  const updatePackageRow = (index: number, field: string, value: string) => {
    const updated = [...manualPackages];
    updated[index] = { ...updated[index], [field]: value };
    setManualPackages(updated);
  };

  // Navigate between steps
  const goToStep = (step: number) => {
    if (step < currentStep || (step === currentStep + 1 && steps[currentStep - 1].isValid)) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && steps[currentStep - 1].isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Upload CSV in chunks
  const uploadCSVInChunks = async (analysisId: string, csvContent: string, fileType: 'orderHistory' | 'packagingSuite' | 'baselineMix') => {
    const CHUNK_SIZE = 800000; // ~800KB chunks to stay under 1MB limit
    const chunks = [];
    
    // Split CSV into chunks
    for (let i = 0; i < csvContent.length; i += CHUNK_SIZE) {
      chunks.push(csvContent.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`Uploading ${fileType} in ${chunks.length} chunks`);
    
    // Upload each chunk
    for (let i = 0; i < chunks.length; i++) {
      await uploadCSVChunk({
        analysisId: analysisId as any,
        fileType,
        chunkIndex: i,
        totalChunks: chunks.length,
        chunk: chunks[i]
      });
      
      // Show progress
      const progress = ((i + 1) / chunks.length) * 100;
      console.log(`Uploaded ${fileType} chunk ${i + 1}/${chunks.length} (${Math.round(progress)}%)`);
    }
    
    console.log(`Finished uploading ${fileType}`);
  };

  // Start analysis
  const handleAnalyze = async () => {
    if (!files.orderHistory) {
      setError('Please upload Order Data file');
      return;
    }

    if (!useManualPackageInput && !files.packagingSuite) {
      setError('Please upload Packaging Suite file or enter packages manually');
      return;
    }

    if (useManualPackageInput) {
      const validPackages = manualPackages.filter(pkg => 
        pkg.name && pkg.length && pkg.width && pkg.height &&
        !isNaN(parseFloat(pkg.length)) && !isNaN(parseFloat(pkg.width)) && !isNaN(parseFloat(pkg.height))
      );
      
      if (validPackages.length === 0) {
        setError('Please enter at least one valid package with all required fields');
        return;
      }
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const orderHistoryCSV = await readFileAsText(files.orderHistory);
      
      let packagingSuiteCSV: string;
      
      if (useManualPackageInput) {
        // Create CSV from manual input
        const headers = ['Package Name', 'Package ID', 'Length', 'Width', 'Height', 'Cost per Unit', 'Package Weight', 'Usage %'];
        const rows = manualPackages
          .filter(pkg => pkg.name && pkg.length && pkg.width && pkg.height)
          .map(pkg => [
            pkg.name,
            pkg.id || pkg.name,
            pkg.length,
            pkg.width,
            pkg.height,
            pkg.cost || '0',
            pkg.weight || '0',
            pkg.usage || ''
          ].join(','));
        
        packagingSuiteCSV = [headers.join(','), ...rows].join('\n');
      } else {
        packagingSuiteCSV = await readFileAsText(files.packagingSuite!);
      }

      // Check if files are too large for direct upload (>800KB)
      const orderHistorySize = new Blob([orderHistoryCSV]).size;
      const packagingSuiteSize = new Blob([packagingSuiteCSV]).size;
      const useChunkedUpload = orderHistorySize > 800000 || packagingSuiteSize > 800000;

      console.log(`Order history size: ${orderHistorySize} bytes`);
      console.log(`Packaging suite size: ${packagingSuiteSize} bytes`);
      console.log(`Using chunked upload: ${useChunkedUpload}`);

      // Create analysis record first
      const analysisId = await startAnalysis({
        name: config.analysisName,
        orderHistoryCSV: useChunkedUpload ? undefined : orderHistoryCSV,
        packagingSuiteCSV: useChunkedUpload ? undefined : packagingSuiteCSV,
        useChunkedUpload,
        config: {
          allowRotation: config.allowRotation,
          allowStacking: config.allowStacking,
          includeShippingCosts: config.includeShippingCosts,
          minimumFillRate: config.minimumFillRate
        }
      });

      // If using chunked upload, upload the large files in chunks
      if (useChunkedUpload) {
        toast.success('Analysis created! Uploading large files...');
        
        if (orderHistorySize > 800000) {
          await uploadCSVInChunks(analysisId, orderHistoryCSV, 'orderHistory');
        }
        
        if (packagingSuiteSize > 800000) {
          await uploadCSVInChunks(analysisId, packagingSuiteCSV, 'packagingSuite');
        }
      }

      setCurrentAnalysisId(analysisId);
      toast.success('Analysis started successfully!');
      
      // Navigate to loading page
      setTimeout(() => {
        navigate(`/suite-analysis/${analysisId}/loading`);
      }, 1000);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start analysis');
      toast.error('Failed to start analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <button
            onClick={() => goToStep(step.number)}
            disabled={step.number > currentStep && !steps[step.number - 2]?.isValid}
            className={`
              flex items-center justify-center w-10 h-10 rounded-full transition-all text-sm
              ${step.isComplete ? 'bg-green-500 text-white' : 
                step.number === currentStep ? 'bg-blue-500 text-white ring-2 ring-blue-200' :
                step.isValid ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' :
                'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
          >
            {step.isComplete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="font-medium">{step.number}</span>
            )}
          </button>
          
          {index < steps.length - 1 && (
            <div className={`
              w-16 h-0.5 mx-2 transition-all
              ${step.isComplete ? 'bg-green-500' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Upload Order Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload your order history CSV file to analyze packaging allocation
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm flex-1">
                  <p className="font-semibold text-blue-900 mb-1">Required CSV Format</p>
                  <p className="text-blue-800">
                    Your CSV should include: Order ID, Total Order Volume (cubic inches)
                  </p>
                  <p className="text-blue-800 mt-1 mb-2">
                    Recommended fields: Product dimensions (L×W×H inches)
                  </p>
                  <p className="text-blue-800 text-xs mt-1 mb-2">
                    <strong>Note:</strong> Multiple products with the same Order ID will be automatically aggregated into a single order with combined volume.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowSamplePreview(true)}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Sample File
                  </Button>
                </div>
              </div>
            </div>


            <div className="border-2 border-dashed border-gray-200 rounded-lg p-16 text-center hover:border-gray-300 transition-colors min-h-[400px] flex flex-col justify-center">
              {files.orderHistory ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-12 w-12 text-green-600" />
                    <span className="font-semibold text-lg">{files.orderHistory.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => handleFileUpload('orderHistory', null)}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
                    <Upload className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Upload Order Data</h3>
                  <p className="text-gray-500 mb-4">Drop or Upload Your Order History CSV Here</p>
                  <div>
                    <Label htmlFor="order-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </Label>
                    <Input
                      id="order-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => handleFileUpload('orderHistory', e.target.files?.[0] || null)}
                    />
                  </div>
                  <p className="text-sm text-gray-500">CSV files only • Max 10MB</p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Define Packaging Suite</h3>
              <p className="text-sm text-gray-600">
                Upload your available packages or enter them manually
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Label htmlFor="manual-input" className="font-medium">
                  Enter Manually
                </Label>
                <Switch
                  id="manual-input"
                  checked={useManualPackageInput}
                  onCheckedChange={setUseManualPackageInput}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpModal(true)}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Format Help
              </Button>
            </div>

            {useManualPackageInput ? (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    Enter your packaging specifications below. All dimensions should be in inches.
                  </p>
                </div>

                <div className="space-y-3">
                  {manualPackages.map((pkg, index) => (
                    <div key={index} className="grid grid-cols-8 gap-2 p-3 bg-white border rounded-lg">
                      <Input
                        placeholder="Name"
                        value={pkg.name}
                        onChange={(e) => updatePackageRow(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="ID"
                        value={pkg.id}
                        onChange={(e) => updatePackageRow(index, 'id', e.target.value)}
                      />
                      <Input
                        placeholder="Length"
                        type="number"
                        value={pkg.length}
                        onChange={(e) => updatePackageRow(index, 'length', e.target.value)}
                      />
                      <Input
                        placeholder="Width"
                        type="number"
                        value={pkg.width}
                        onChange={(e) => updatePackageRow(index, 'width', e.target.value)}
                      />
                      <Input
                        placeholder="Height"
                        type="number"
                        value={pkg.height}
                        onChange={(e) => updatePackageRow(index, 'height', e.target.value)}
                      />
                      <Input
                        placeholder="Cost ($)"
                        type="number"
                        value={pkg.cost}
                        onChange={(e) => updatePackageRow(index, 'cost', e.target.value)}
                      />
                      <Input
                        placeholder="Weight (lbs)"
                        type="number"
                        value={pkg.weight}
                        onChange={(e) => updatePackageRow(index, 'weight', e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePackageRow(index)}
                        disabled={manualPackages.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={addPackageRow}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-16 text-center hover:border-gray-300 transition-colors min-h-[400px] flex flex-col justify-center">
                {files.packagingSuite ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Package className="h-12 w-12 text-green-600" />
                      <span className="font-semibold text-lg">{files.packagingSuite.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => handleFileUpload('packagingSuite', null)}
                    >
                      <X className="h-5 w-5 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Upload Packaging Suite</h3>
                    <p className="text-gray-500 mb-4">Drop or Upload Your Packaging CSV Here</p>
                    <div>
                      <Label htmlFor="package-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Click to upload
                        </span>
                        <span className="text-gray-600"> or drag and drop</span>
                      </Label>
                      <Input
                        id="package-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload('packagingSuite', e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Required fields: Package types, L×W×H (inches) | Optional: Price ($), weight (lbs), usage (%)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Analysis Configuration</h3>
              <p className="text-sm text-gray-600">
                Customize your analysis parameters for optimal results
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="analysis-name">Analysis Name</Label>
                <Input
                  id="analysis-name"
                  value={config.analysisName}
                  onChange={(e) => setConfig(prev => ({ ...prev, analysisName: e.target.value }))}
                  placeholder="Enter a name for this analysis"
                />
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Optimization Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="rotation" className="text-sm">
                      Allow Package Rotation
                    </Label>
                  </div>
                  <Switch
                    id="rotation"
                    checked={config.allowRotation}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, allowRotation: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="stacking" className="text-sm">
                      Allow Item Stacking
                    </Label>
                  </div>
                  <Switch
                    id="stacking"
                    checked={config.allowStacking}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, allowStacking: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="shipping" className="text-sm">
                      Include Shipping Costs
                    </Label>
                  </div>
                  <Switch
                    id="shipping"
                    checked={config.includeShippingCosts}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeShippingCosts: checked }))}
                  />
                </div>

                <div>
                  <Label htmlFor="fill-rate" className="text-sm">
                    Minimum Fill Rate (%)
                  </Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="fill-rate"
                      type="range"
                      min="10"
                      max="90"
                      value={config.minimumFillRate}
                      onChange={(e) => setConfig(prev => ({ ...prev, minimumFillRate: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-right">
                      {config.minimumFillRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Ready to Analyze</h3>
              <p className="text-sm text-gray-600">
                Review your configuration and start the optimization analysis
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Analysis Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Analysis Name:</span>
                    <span className="font-medium text-blue-900">{config.analysisName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Order Data:</span>
                    <span className="font-medium text-blue-900">
                      {files.orderHistory?.name || 'Not uploaded'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Packaging Suite:</span>
                    <span className="font-medium text-blue-900">
                      {useManualPackageInput ? 
                        `${manualPackages.filter(p => p.name).length} packages (manual)` : 
                        files.packagingSuite?.name || 'Not uploaded'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">Configuration</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {config.allowRotation ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span>Package Rotation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {config.allowStacking ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span>Item Stacking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {config.includeShippingCosts ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span>Shipping Costs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Min Fill: {config.minimumFillRate}%</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !isStep1Valid || !isStep2Valid || !isStep3Valid}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-8">
          {renderStepIndicator()}
          
          <div className="mt-8">
            {renderStepContent()}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              size="default"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                size="default"
                onClick={handleNext}
                disabled={!steps[currentStep - 1].isValid}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="default"
                onClick={() => setCurrentStep(1)}
              >
                Start Over
              </Button>
            )}
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Help Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Packaging Suite CSV Format</DialogTitle>
            <DialogDescription>
              Your CSV file should include the following columns
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Required Fields:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Package Name or Package Type</li>
                <li>• Length (inches)</li>
                <li>• Width (inches)</li>
                <li>• Height (inches)</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Optional Fields:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Package ID</li>
                <li>• Cost per Unit ($)</li>
                <li>• Package Weight (lbs)</li>
                <li>• Usage %</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Example CSV:</h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`Package Name,Length,Width,Height,Cost,Weight
Small Box,12,8,6,1.25,0.5
Medium Box,16,12,8,2.15,0.8
Large Box,20,16,12,3.45,1.2`}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sample File Preview Dialog */}
      <Dialog open={showSamplePreview} onOpenChange={setShowSamplePreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sample CSV File Formats</DialogTitle>
            <DialogDescription>
              Download these sample files as templates for your suite analysis
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="order-data" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="order-data">Order Data Format</TabsTrigger>
              <TabsTrigger value="packaging-suite">Packaging Suite Format</TabsTrigger>
            </TabsList>
            
            <TabsContent value="order-data" className="mt-4">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                  <div className="font-semibold text-gray-700 mb-2">order_data.csv</div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left pb-2 pr-4">Order ID</th>
                          <th className="text-left pb-2 pr-4">Total Order Volume</th>
                          <th className="text-left pb-2 pr-4">Product Length</th>
                          <th className="text-left pb-2 pr-4">Product Width</th>
                          <th className="text-left pb-2">Product Height</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="py-1 pr-4">ORD-001</td><td className="pr-4">450.5</td><td className="pr-4">10.5</td><td className="pr-4">8.2</td><td>5.5</td></tr>
                        <tr><td className="py-1 pr-4">ORD-001</td><td className="pr-4">180.0</td><td className="pr-4">6.0</td><td className="pr-4">5.0</td><td>6.0</td></tr>
                        <tr><td className="py-1 pr-4">ORD-002</td><td className="pr-4">1200.0</td><td className="pr-4"></td><td className="pr-4"></td><td></td></tr>
                        <tr><td className="py-1 pr-4">ORD-003</td><td className="pr-4">275.8</td><td className="pr-4">7.0</td><td className="pr-4">6.5</td><td>6.0</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = 'Order ID,Total Order Volume,Product Length,Product Width,Product Height\nORD-001,450.5,10.5,8.2,5.5\nORD-001,180.0,6.0,5.0,6.0\nORD-002,1200.0,,,\nORD-003,275.8,7.0,6.5,6.0';
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sample_order_data.csv';
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="packaging-suite" className="mt-4">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                  <div className="font-semibold text-gray-700 mb-2">packaging_suite.csv</div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left pb-2 pr-4">Package Name</th>
                          <th className="text-left pb-2 pr-4">Length</th>
                          <th className="text-left pb-2 pr-4">Width</th>
                          <th className="text-left pb-2 pr-4">Height</th>
                          <th className="text-left pb-2 pr-4">Price</th>
                          <th className="text-left pb-2 pr-4">Weight</th>
                          <th className="text-left pb-2">Usage %</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="py-1 pr-4">Small Box</td><td className="pr-4">10</td><td className="pr-4">8</td><td className="pr-4">6</td><td className="pr-4">0.25</td><td className="pr-4">0.15</td><td>35</td></tr>
                        <tr><td className="py-1 pr-4">Medium Box</td><td className="pr-4">14</td><td className="pr-4">12</td><td className="pr-4">8</td><td className="pr-4">0.45</td><td className="pr-4">0.25</td><td>45</td></tr>
                        <tr><td className="py-1 pr-4">Large Box</td><td className="pr-4">20</td><td className="pr-4">16</td><td className="pr-4">12</td><td className="pr-4">0.75</td><td className="pr-4">0.40</td><td>20</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = 'Package Name,Length,Width,Height,Price,Weight,Usage %\nSmall Box,10,8,6,0.25,0.15,35\nMedium Box,14,12,8,0.45,0.25,45\nLarge Box,20,16,12,0.75,0.40,20';
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sample_packaging_suite.csv';
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};