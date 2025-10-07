import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowUpTrayIcon as Upload,
  SparklesIcon as Wand2,
  RectangleGroupIcon as Target,
  CheckCircleIcon as CheckCircle2,
  ArrowDownTrayIcon as Download,
  DocumentTextIcon as FileText,
  InformationCircleIcon as Info,
  ArrowPathIcon as Loader2,
  ArrowPathIcon as RotateCcw,
  XMarkIcon as X,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  CheckIcon as Check,
  PlusIcon as Plus
} from '@heroicons/react/24/outline';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { useTokenGuard } from '@/hooks/useTokenGuard';
import { CSVFormatGuide } from '@/components/ui/CSVFormatGuide';

interface SpecResult {
  orderId?: string;
  productName: string;
  estimatedL: number;
  estimatedW: number;
  estimatedH: number;
  totalCUIN: number;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

interface SpecGenerationResponse {
  results: Array<{
    orderId?: string;
    productName: string;
    estimatedL: number;
    estimatedW: number;
    estimatedH: number;
    totalCUIN: number;
    confidence: string;
    notes: string;
  }>;
  totalProducts: number;
  processedProducts: number;
  hasMoreProducts: boolean;
  remainingProducts: number;
}

export const SpecGenerator = () => {
  const { checkAndConsumeToken } = useTokenGuard();
  
  // Step interface state
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelpModal, setShowHelpModal] = useState(true);
  
  // State
  const [productFile, setProductFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [manualProducts, setManualProducts] = useState([
    { name: '', description: '', category: '' }
  ]);
  const [boundingDimensions, setBoundingDimensions] = useState({
    min: { l: '', w: '', h: '' },
    max: { l: '', w: '', h: '' },
  });
  const [additionalInfo, setAdditionalInfo] = useState({
    category: '',
    material: '',
    size: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SpecResult[] | null>(null);
  const [selectedNote, setSelectedNote] = useState<{ product: string; notes: string } | null>(null);
  
  // Chunked processing state
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [processedProducts, setProcessedProducts] = useState<number>(0);
  const [currentChunk, setCurrentChunk] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<string>('');

  // Convex hooks
  const generateSpecs = useAction(api.specGenerator.generateSpecs);

  // Manual entry helper functions
  const addProductRow = () => {
    if (manualProducts.length < 20) {
      setManualProducts(prev => [...prev, { name: '', description: '', category: '' }]);
    } else {
      toast.error('Maximum 20 products allowed');
    }
  };

  const removeProductRow = (index: number) => {
    if (manualProducts.length > 1) {
      setManualProducts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateProductRow = (index: number, field: 'name' | 'description' | 'category', value: string) => {
    setManualProducts(prev => prev.map((product, i) =>
      i === index ? { ...product, [field]: value } : product
    ));
  };

  // Step validation
  const isStep1Valid = productFile !== null || (useManualEntry && manualProducts.some(p => p.name.trim() !== ''));
  const isStep2Valid = boundingDimensions.min.l && boundingDimensions.max.l;
  const isStep3Valid = isStep1Valid && isStep2Valid;

  const steps = [
    {
      number: 1,
      title: 'Product Data Upload',
      description: 'Upload your product list',
      isValid: isStep1Valid,
      isComplete: isStep1Valid && currentStep > 1
    },
    { 
      number: 2, 
      title: 'Bounding Dimensions', 
      description: 'Set calibration dimensions for AI estimates',
      isValid: isStep2Valid,
      isComplete: isStep2Valid && currentStep > 2
    },
    { 
      number: 3, 
      title: 'Generate & Results', 
      description: 'Configure generation and view results',
      isValid: isStep3Valid,
      isComplete: false
    }
  ];

  // File upload handler
  const handleFileUpload = async (file: File) => {
    setProductFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Validate product count
      const lines = content.trim().split('\n');
      const productCount = Math.max(0, lines.length - 1);

      if (productCount > 20) {
        toast.error(`Too many products! Your CSV contains ${productCount} products, but the maximum allowed is 20. Please reduce your file size or use multiple generations.`);
        setProductFile(null);
        setCsvContent('');
        return;
      }

      if (productCount === 0) {
        toast.error('No products found in CSV. Please check your file format.');
        setProductFile(null);
        setCsvContent('');
        return;
      }

      setCsvContent(content);
      toast.success(`📄 File loaded: ${productCount} products detected`);
    };
    
    reader.readAsText(file);
  };

  // Validate form
  const validateForm = () => {
    // Check if we have product data (either file upload or manual entry)
    const hasManualProducts = useManualEntry && manualProducts.some(p => p.name.trim() !== '');
    const hasFileData = !useManualEntry && csvContent.trim();

    if (!hasManualProducts && !hasFileData) {
      toast.error('Please upload a product file or enter products manually');
      return false;
    }

    if (!boundingDimensions.min.l || !boundingDimensions.max.l) {
      toast.error('Please set all bounding dimensions');
      return false;
    }

    // Validate dimension logic
    const min = {
      l: parseFloat(boundingDimensions.min.l),
      w: parseFloat(boundingDimensions.min.w),
      h: parseFloat(boundingDimensions.min.h),
    };
    const max = {
      l: parseFloat(boundingDimensions.max.l),
      w: parseFloat(boundingDimensions.max.w),
      h: parseFloat(boundingDimensions.max.h),
    };

    if (min.l >= max.l) {
      toast.error('Length dimensions must be: Min < Max');
      return false;
    }

    if (min.w >= max.w) {
      toast.error('Width dimensions must be: Min < Max');
      return false;
    }

    if (min.h >= max.h) {
      toast.error('Height dimensions must be: Min < Max');
      return false;
    }

    return true;
  };

  // Generate specifications with chunked processing
  const handleGenerateSpecs = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setResults(null);
    setProcessedProducts(0);
    setCurrentChunk(0);

    // Get CSV content - either from file or manual entries
    let productData = csvContent;
    if (useManualEntry) {
      // Create CSV from manual entries
      const validProducts = manualProducts.filter(p => p.name.trim() !== '');
      const headers = ['Product Name', 'Description', 'Category'];
      const rows = validProducts.map(p => [
        `"${p.name}"`,
        `"${p.description || ''}"`,
        `"${p.category || ''}"`
      ].join(','));
      productData = [headers.join(','), ...rows].join('\n');
    }

    // Validate CSV format BEFORE consuming token
    const lines = productData.trim().split('\n');
    if (lines.length < 2) {
      toast.error('Invalid CSV', {
        description: 'CSV must contain header and at least one data row'
      });
      setIsProcessing(false);
      return;
    }

    // Check if CSV has product name column
    const firstLine = lines[0];
    const isTabSeparated = firstLine.includes('\t');
    const delimiter = isTabSeparated ? '\t' : ',';
    const headers = firstLine.toLowerCase().split(delimiter).map(h => h.trim());
    const hasProductColumn = headers.some(h =>
      h.includes('product') || h.includes('name') || h.includes('description') || h.includes('item')
    );

    if (!hasProductColumn) {
      toast.error('Invalid CSV Format', {
        description: 'CSV must contain a column with product names (e.g., "Product Name", "Item", "Description")'
      });
      setIsProcessing(false);
      return;
    }

    const totalCount = Math.max(0, lines.length - 1); // Minus header
    setTotalProducts(totalCount);

    try {
      // Check token before starting (validation passed)
      const tokenResult = await checkAndConsumeToken('spec_generator', async () => {
        const bounds = {
          min: {
            l: parseFloat(boundingDimensions.min.l),
            w: parseFloat(boundingDimensions.min.w),
            h: parseFloat(boundingDimensions.min.h),
          },
          max: {
            l: parseFloat(boundingDimensions.max.l),
            w: parseFloat(boundingDimensions.max.w),
            h: parseFloat(boundingDimensions.max.h),
          },
        };

        await processChunkedSpecs(bounds, totalCount, productData);
        return { success: true };
      });
      
      if (!tokenResult.success) {
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error('Error generating specs:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        toast.error(
          'Processing timed out. The OpenAI API is not responding. Please try again with a smaller file.'
        );
      } else if (errorMessage.includes('OpenAI API key')) {
        toast.error('OpenAI API key issue. Please check the configuration.');
      } else if (errorMessage.includes('rate limit')) {
        toast.error('API rate limit reached. Please wait a moment and try again.');
      } else {
        toast.error(`Failed to generate specifications: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
      setProcessingProgress('');
    }
  };
  
  // Process specs in chunks for large files
  const processChunkedSpecs = async (bounds: any, totalCount: number, productData: string) => {
    let allResults: SpecResult[] = [];
    let chunk = 0;
    let processedSoFar = 0;
    let hasMoreProducts = true;
    
    if (totalCount <= 50) {
      setProcessingProgress('Processing single batch...');
      toast.info(`Processing ${totalCount} products in a single batch`);
    } else {
      const estimatedChunks = Math.ceil(totalCount / 50);
      setProcessingProgress(`Processing large file in ~${estimatedChunks} chunks...`);
      toast.info(`Large file detected: ${totalCount} products will be processed in ~${estimatedChunks} chunks of 50`);
    }
    
    while (hasMoreProducts && processedSoFar < totalCount) {
      chunk++;
      setCurrentChunk(chunk);
      
      const chunkStart = processedSoFar + 1;
      const expectedChunkSize = Math.min(50, totalCount - processedSoFar);
      
      setProcessingProgress(`Processing chunk ${chunk}: products ${chunkStart}-${chunkStart + expectedChunkSize - 1}`);
      
      const response: SpecGenerationResponse = await generateSpecs({
        productData: productData,
        boundingDimensions: bounds,
        additionalInfo: {
          category: additionalInfo.category || undefined,
          material: additionalInfo.material || undefined,
          size: additionalInfo.size || undefined,
        },
        startIndex: processedSoFar, // Tell backend which products to process
      });
      
      // Add new results to existing ones (convert confidence to proper type)
      const convertedResults: SpecResult[] = response.results.map(r => ({
        ...r,
        confidence: (r.confidence as 'high' | 'medium' | 'low') || 'medium'
      }));
      allResults = [...allResults, ...convertedResults];
      setResults([...allResults]);
      
      // Update progress tracking
      processedSoFar += response.processedProducts;
      setProcessedProducts(processedSoFar);
      hasMoreProducts = response.hasMoreProducts;
      
      const progressPercent = Math.round((processedSoFar / totalCount) * 100);
      
      if (response.hasMoreProducts) {
        toast.success(
          `Chunk ${chunk} complete: ${response.processedProducts} products analyzed. ` +
          `Progress: ${processedSoFar}/${totalCount} (${progressPercent}%)`
        );
        setProcessingProgress(`Chunk ${chunk} complete. Continuing with next batch...`);
        
        // Brief pause between chunks to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Final chunk completed
        if (totalCount > 50) {
          toast.success(
            `All chunks complete! Generated specs for ${processedSoFar} products across ${chunk} chunks.`
          );
        } else {
          toast.success(`Generated specs for ${processedSoFar} products!`);
        }
        setProcessingProgress(`Complete: ${processedSoFar} products processed`);
        break;
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!results || results.length === 0) return;

    const headers = ['Order ID', 'Product Name', 'Length (in)', 'Width (in)', 'Height (in)', 'Total CUIN', 'Confidence', 'Notes'];
    const rows = results.map(r => [
      r.orderId || '',
      r.productName,
      r.estimatedL.toFixed(2),
      r.estimatedW.toFixed(2),
      r.estimatedH.toFixed(2),
      r.totalCUIN.toFixed(2),
      r.confidence.toUpperCase(),
      r.notes,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spec-generation-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully');
  };

  // Reset form
  const resetForm = () => {
    setProductFile(null);
    setCsvContent('');
    setResults(null);
    setBoundingDimensions({
      min: { l: '', w: '', h: '' },
      max: { l: '', w: '', h: '' },
    });
    setAdditionalInfo({ category: '', material: '', size: '' });
    
    // Reset chunked processing state
    setTotalProducts(0);
    setProcessedProducts(0);
    setCurrentChunk(0);
    setProcessingProgress('');
    setCurrentStep(1);
  };

  // Step rendering functions
  const renderStepHeader = () => (
    <div className="mb-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
              currentStep === step.number
                ? 'text-white border-blue-500 bg-blue-500'
                : step.isComplete
                  ? 'text-white border-blue-500 bg-blue-500'
                  : step.isValid
                    ? 'border-blue-500 text-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 text-gray-400'
            }`}>
              {step.isComplete ? <Check className="h-5 w-5" /> : step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 transition-all ${
                step.isComplete ? 'bg-blue-500' : 'bg-gray-300'
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
          <div className="w-8 h-8 rounded-3xl flex items-center justify-center bg-purple-500">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Product Data File</h3>
        </div>

        {/* Toggle between CSV upload and manual entry */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={!useManualEntry ? "default" : "outline"}
            onClick={() => setUseManualEntry(false)}
            className="flex-1"
          >
            Upload CSV
          </Button>
          <Button
            variant={useManualEntry ? "default" : "outline"}
            onClick={() => setUseManualEntry(true)}
            className="flex-1"
          >
            Manual Entry
          </Button>
        </div>

        {!useManualEntry ? (
          <>
            <CSVFormatGuide
              title="Required CSV Format"
              description="Your CSV should include: Product Name, and optionally Description, Category. Note: Limited to 20 products per generation."
              columns={[
                { name: "Product Name" },
                { name: "Description" },
                { name: "Category" }
              ]}
              sampleData={[
                { "Product Name": "Wireless Bluetooth Headphones", "Description": "Over-ear wireless headphones", "Category": "Electronics" },
                { "Product Name": "Stainless Steel Water Bottle", "Description": "500ml insulated bottle", "Category": "Drinkware" },
                { "Product Name": "Organic Cotton T-Shirt", "Description": "Medium size crew neck", "Category": "Apparel" }
              ]}
              className="mb-6"
            />

            {!productFile ? (
          <label className="relative block">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center transition-all cursor-pointer group min-h-[300px] flex flex-col justify-center hover:border-purple-500 hover:bg-purple-50">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 bg-purple-500">
                <Upload className="h-12 w-12 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Product List CSV</h4>
              <p className="text-gray-600 mb-1">Click to browse or drag and drop your file</p>
              <p className="text-sm text-gray-500">CSV file with the format shown above</p>
            </div>
          </label>
        ) : (
          <div className="border border-gray-200 rounded-3xl p-6 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{productFile.name}</p>
                  <p className="text-sm text-gray-500">{(productFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProductFile(null);
                  setCsvContent('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Enter your products manually (maximum 20):</p>
            {manualProducts.map((product, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Product {index + 1}</h4>
                  {manualProducts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProductRow(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Product Name *</Label>
                    <Input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProductRow(index, 'name', e.target.value)}
                      placeholder="e.g., Wireless Bluetooth Headphones"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description (optional)</Label>
                    <Input
                      type="text"
                      value={product.description}
                      onChange={(e) => updateProductRow(index, 'description', e.target.value)}
                      placeholder="e.g., Over-ear wireless headphones"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Category (optional)</Label>
                    <Input
                      type="text"
                      value={product.category}
                      onChange={(e) => updateProductRow(index, 'category', e.target.value)}
                      placeholder="e.g., Electronics"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}

            {manualProducts.length < 20 && (
              <Button
                type="button"
                variant="outline"
                onClick={addProductRow}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Product
              </Button>
            )}
          </div>
        )}

        {/* Optional Information */}
        {(productFile || (useManualEntry && manualProducts.some(p => p.name.trim() !== ''))) && (
          <div className="mt-6 space-y-4">
            <Label className="text-gray-700 font-medium">Optional Information (helps improve AI accuracy)</Label>
            <div className="grid gap-3">
              <Input
                placeholder="Category (e.g., Electronics, Cosmetics)"
                className="border-gray-200 rounded-3xl"
                value={additionalInfo.category}
                onChange={(e) => setAdditionalInfo(prev => ({ ...prev, category: e.target.value }))}
              />
              <Input
                placeholder="Material Type (e.g., plastic, metal)"
                className="border-gray-200 rounded-3xl"
                value={additionalInfo.material}
                onChange={(e) => setAdditionalInfo(prev => ({ ...prev, material: e.target.value }))}
              />
              <Input
                placeholder="Size Range (e.g., S, M, L, XL)"
                className="border-gray-200 rounded-3xl"
                value={additionalInfo.size}
                onChange={(e) => setAdditionalInfo(prev => ({ ...prev, size: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-3xl flex items-center justify-center bg-purple-500">
            <Target className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Bounding Dimensions</h3>
          <span className="text-red-500">*</span>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Set min/max dimensions to calibrate AI estimates (inches). These should reflect your smallest and largest products based on outer packaging dimensions.
        </p>

        <div className="space-y-6">
          {['min', 'max'].map((type) => (
            <div key={type} className="space-y-3">
              <Label className="text-gray-700 font-medium text-base">
                {type === 'min' ? 'Minimum' : 'Maximum'} Dimensions
              </Label>
              <div className="grid grid-cols-3 gap-4">
                {['l', 'w', 'h'].map((dim) => (
                  <div key={dim} className="space-y-2">
                    <Label className="text-sm text-gray-500 uppercase font-medium">
                      {dim === 'l' ? 'Length' : dim === 'w' ? 'Width' : 'Height'}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="0.0"
                      className="border-gray-200 rounded-3xl"
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
        </div>

        <div className="mt-6 border rounded-3xl p-4 bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-700">
            <strong>Tip:</strong> Enter dimensions in inches. Each dimension (L, W, H) must follow: Min &lt; Max
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-3xl flex items-center justify-center bg-purple-500">
            <Wand2 className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Generation Settings</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Product File</span>
              </div>
              <p className="text-sm text-gray-600">
                {productFile ? `✓ ${productFile.name}` : 'No file uploaded'}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Dimensions</span>
              </div>
              <p className="text-sm text-gray-600">
                {isStep2Valid ? '✓ Configured' : 'Not configured'}
              </p>
            </div>
          </div>

          {(csvContent || (useManualEntry && manualProducts.some(p => p.name.trim() !== ''))) && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {useManualEntry ? 'Manual Entry Preview' : 'File Preview'}
              </h4>
              <p className="text-sm text-gray-600">
                {useManualEntry
                  ? `${manualProducts.filter(p => p.name.trim() !== '').length} products entered`
                  : `${Math.max(0, csvContent.trim().split('\n').length - 1)} products detected`
                }
              </p>
            </div>
          )}

          {/* Progress Display */}
          {isProcessing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-800 mb-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Processing Your Products</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                {processingProgress || 'Initializing...'}
              </p>
              
              {totalProducts > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700">Progress</span>
                    <span className="text-yellow-800 font-medium">
                      {processedProducts}/{totalProducts} products ({Math.round((processedProducts/totalProducts)*100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(processedProducts / totalProducts) * 100}%` }}
                    />
                  </div>
                  {totalProducts > 50 && currentChunk > 0 && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Large file processing: Chunk {currentChunk} of ~{Math.ceil(totalProducts / 50)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results Display */}
          {results && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Generated Specifications
                </h4>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetForm} className="border-gray-200">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Generation
                  </Button>
                  <Button onClick={exportToCSV} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>


              {/* Results Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {results[0]?.orderId && <th className="px-4 py-3 text-left font-medium text-gray-700">Order ID</th>}
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Product Name</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">L (in)</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">W (in)</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">H (in)</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">CUIN</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Confidence</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {result.orderId && (
                          <td className="px-4 py-3 text-gray-700 font-mono text-xs">{result.orderId}</td>
                        )}
                        <td className="px-4 py-3 text-gray-900 font-medium">{result.productName}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{result.estimatedL.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{result.estimatedW.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{result.estimatedH.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center font-semibold text-gray-900">
                          {result.totalCUIN.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            result.confidence === 'high' 
                              ? 'bg-green-100 text-green-700'
                              : result.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {result.confidence.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          <div className="whitespace-pre-wrap text-wrap max-w-md">
                            {result.notes}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900">Total Products</p>
                  <p className="text-2xl font-bold text-purple-600">{results.length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-green-900">High Confidence</p>
                  <p className="text-2xl font-bold text-green-700">
                    {results.filter(r => r.confidence === 'high').length}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-yellow-900">Medium Confidence</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {results.filter(r => r.confidence === 'medium').length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900">Avg CUIN</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(results.reduce((sum, r) => sum + r.totalCUIN, 0) / results.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      <Button
        variant="outline"
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <div className="text-sm text-gray-500">
        Step {currentStep} of {steps.length}
      </div>

      {currentStep < steps.length ? (
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          disabled={!steps[currentStep - 1].isValid}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={handleGenerateSpecs}
          disabled={!isStep3Valid || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Generate Specs
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Show placeholder when help modal is open */}
        {showHelpModal && (
          <div className="text-center py-20">
            <Wand2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Spec Generator</h2>
            <p className="text-gray-600">Generate AI-powered product specifications</p>
          </div>
        )}
        
        {/* Show stepped interface when help modal is closed */}
        {!showHelpModal && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 relative">
            {renderStepHeader()}
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            {renderNavigation()}
          </div>
        )}
      </div>

      {/* Help Modal */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity ${showHelpModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              Spec Generator Manual
            </h3>
            <button
              onClick={() => setShowHelpModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-gray-700">
                  <div className="space-y-3">
                    <div>
                      <strong className="text-gray-900">📥 INPUTS:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Product List (CSV with product names - required)</li>
                        <li>• Bounding dimensions (Min/Avg/Max L×W×H in inches)</li>
                        <li>• Optional: Order ID, Product descriptions, Category, Material, Size info</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-gray-900">📤 OUTPUTS:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Order ID (if applicable) + Product Name</li>
                        <li>• Estimated L×W×H dimensions in inches</li>
                        <li>• Total CUIN (cubic inches)</li>
                        <li>• Confidence level and AI reasoning notes</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-gray-900">🎯 HOW IT WORKS:</strong>
                      <ol className="mt-2 space-y-1 text-sm">
                        <li>1. Upload your product list CSV file</li>
                        <li>2. Set bounding dimensions to calibrate AI estimates</li>
                        <li>3. Generate AI-powered specifications</li>
                        <li>4. Review results and export to CSV</li>
                      </ol>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button onClick={() => setShowHelpModal(false)} className="bg-purple-600 hover:bg-purple-700 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                AI Analysis Notes: {selectedNote.product}
              </h3>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedNote.notes}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedNote(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(selectedNote.notes);
                  toast.success('Notes copied to clipboard');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Copy Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};