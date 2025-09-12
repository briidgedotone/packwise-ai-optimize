import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, Wand2, Target, CheckCircle2, 
  AlertCircle, Download, FileText, Info,
  HelpCircle, Loader2, RotateCcw, Play, Package,
  Eye, EyeOff, Maximize2, X
} from 'lucide-react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { designSystem } from '@/lib/design-system';

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
  // State
  const [productFile, setProductFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SpecResult[] | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [notesDisplay, setNotesDisplay] = useState<'truncated' | 'wrapped' | 'modal'>('truncated');
  const [selectedNote, setSelectedNote] = useState<{ product: string; notes: string } | null>(null);
  
  // Chunked processing state
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [processedProducts, setProcessedProducts] = useState<number>(0);
  const [currentChunk, setCurrentChunk] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<string>('');

  // Convex hooks
  const generateSpecs = useAction(api.specGenerator.generateSpecs);

  // File upload handler
  const handleFileUpload = async (file: File) => {
    setProductFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      
      // Preview first few lines
      const lines = content.trim().split('\n');
      const productCount = Math.max(0, lines.length - 1);
      
      toast.success(`📄 File loaded: ${productCount} products detected`);
    };
    
    reader.readAsText(file);
  };

  // Validate form
  const validateForm = () => {
    if (!csvContent.trim()) {
      toast.error('Please upload a product file');
      return false;
    }
    
    if (!boundingDimensions.min.l || !boundingDimensions.avg.l || !boundingDimensions.max.l) {
      toast.error('Please set all bounding dimensions');
      return false;
    }

    // Validate dimension logic
    const min = {
      l: parseFloat(boundingDimensions.min.l),
      w: parseFloat(boundingDimensions.min.w),
      h: parseFloat(boundingDimensions.min.h),
    };
    const avg = {
      l: parseFloat(boundingDimensions.avg.l),
      w: parseFloat(boundingDimensions.avg.w),
      h: parseFloat(boundingDimensions.avg.h),
    };
    const max = {
      l: parseFloat(boundingDimensions.max.l),
      w: parseFloat(boundingDimensions.max.w),
      h: parseFloat(boundingDimensions.max.h),
    };

    if (min.l >= avg.l || avg.l >= max.l) {
      toast.error('Length dimensions must be: Min < Average < Max');
      return false;
    }
    
    if (min.w >= avg.w || avg.w >= max.w) {
      toast.error('Width dimensions must be: Min < Average < Max');
      return false;
    }
    
    if (min.h >= avg.h || avg.h >= max.h) {
      toast.error('Height dimensions must be: Min < Average < Max');
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
    
    // Get total product count
    const lines = csvContent.trim().split('\n');
    const totalCount = Math.max(0, lines.length - 1); // Minus header
    setTotalProducts(totalCount);
    
    try {
      const bounds = {
        min: {
          l: parseFloat(boundingDimensions.min.l),
          w: parseFloat(boundingDimensions.min.w),
          h: parseFloat(boundingDimensions.min.h),
        },
        avg: {
          l: parseFloat(boundingDimensions.avg.l),
          w: parseFloat(boundingDimensions.avg.w),
          h: parseFloat(boundingDimensions.avg.h),
        },
        max: {
          l: parseFloat(boundingDimensions.max.l),
          w: parseFloat(boundingDimensions.max.w),
          h: parseFloat(boundingDimensions.max.h),
        },
      };

      await processChunkedSpecs(bounds, totalCount);
      
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
  const processChunkedSpecs = async (bounds: any, totalCount: number) => {
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
        productData: csvContent,
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
      avg: { l: '', w: '', h: '' },
      max: { l: '', w: '', h: '' },
    });
    setAdditionalInfo({ category: '', material: '', size: '' });
    
    // Reset chunked processing state
    setTotalProducts(0);
    setProcessedProducts(0);
    setCurrentChunk(0);
    setProcessingProgress('');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Spec Generator</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Generate estimated L×W×H and CUIN for product lists using AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="border-gray-200"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-xl" style={{ backgroundColor: designSystem.colors.primaryLight, borderColor: designSystem.colors.primary }}>
                <Package className="h-4 w-4" style={{ color: designSystem.colors.primary }} />
                <span className="text-sm font-medium" style={{ color: designSystem.colors.primary }}>AI Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        {showHelp && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4" style={{ color: designSystem.colors.primary }} />
            <AlertDescription className="text-sm text-gray-700">
              <div className="space-y-2">
                <div>
                  <strong className="text-gray-900">📥 INPUTS:</strong>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Product List or Order File (CSV with product names/descriptions)</li>
                    <li>• Order files can include Order ID + Product Name per row</li>
                    <li>• Bounding dimensions (Min/Avg/Max L×W×H in inches)</li>
                    <li>• Optional: Category, Material, Size info</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-gray-900">📤 OUTPUTS:</strong>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Order ID (if applicable) + Product Name</li>
                    <li>• Estimated L×W×H dimensions in inches</li>
                    <li>• Total CUIN (cubic inches)</li>
                    <li>• Confidence level and AI reasoning notes</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!results ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* File Upload Section */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  📥 Product List File
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Upload product list or order file (CSV format)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose CSV file with product names or Order ID + Products
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="product-file"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('product-file')?.click()}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {productFile ? `📄 ${productFile.name}` : 'Choose File'}
                  </Button>
                </div>

                {/* File Success */}
                {productFile && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">File loaded successfully</span>
                    </div>
                  </div>
                )}

                {/* Optional Fields */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Optional Information</Label>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Category (e.g., Electronics, Cosmetics)"
                      className="border-gray-200 rounded-xl"
                      style={{ '--tw-ring-color': designSystem.colors.primary }}
                      onFocus={(e) => e.target.style.borderColor = designSystem.colors.primary}
                      value={additionalInfo.category}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, category: e.target.value }))}
                    />
                    <Input
                      placeholder="Material Type (e.g., plastic, metal)"
                      className="border-gray-200 rounded-xl"
                      style={{ '--tw-ring-color': designSystem.colors.primary }}
                      onFocus={(e) => e.target.style.borderColor = designSystem.colors.primary}
                      value={additionalInfo.material}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, material: e.target.value }))}
                    />
                    <Input
                      placeholder="Size Range (e.g., S, M, L, XL)"
                      className="border-gray-200 rounded-xl"
                      style={{ '--tw-ring-color': designSystem.colors.primary }}
                      onFocus={(e) => e.target.style.borderColor = designSystem.colors.primary}
                      value={additionalInfo.size}
                      onChange={(e) => setAdditionalInfo(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bounding Dimensions */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-3">
                  <Target className="h-5 w-5" style={{ color: designSystem.colors.primary }} />
                  Bounding Dimensions
                  <span className="text-red-500">*</span>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Set min/avg/max dimensions to calibrate AI estimates (inches)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['min', 'avg', 'max'].map((type) => (
                  <div key={type} className="space-y-2">
                    <Label className="text-gray-700 font-medium text-sm">
                      {type === 'min' ? 'Minimum' : type === 'avg' ? 'Average' : 'Maximum'} Dimensions
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['l', 'w', 'h'].map((dim) => (
                        <div key={dim} className="space-y-2">
                          <Label className="text-xs text-gray-500 uppercase font-medium">
                            {dim === 'l' ? 'Length' : dim === 'w' ? 'Width' : 'Height'}
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="0.0"
                            className="border-gray-200 rounded-xl"
                      style={{ '--tw-ring-color': designSystem.colors.primary }}
                      onFocus={(e) => e.target.style.borderColor = designSystem.colors.primary}
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

                <div className="border rounded-xl p-4" style={{ backgroundColor: designSystem.colors.primaryLight, borderColor: designSystem.colors.primary }}>
                  <p className="text-sm" style={{ color: designSystem.colors.primary }}>
                    <strong>Tip:</strong> These should reflect your smallest, average, and largest products based on outer packaging dimensions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Results Section
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-medium text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Generated Specifications
                  </CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    {results.length} products processed with AI analysis
                    {totalProducts > results.length && (
                      <span className="ml-2 font-medium" style={{ color: designSystem.colors.primary }}>
                        ({results.length}/{totalProducts} total)
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Generation
                  </Button>
                  <Button
                    onClick={exportToCSV}
                    className="hover:opacity-90 text-white rounded-full"
                    style={{ backgroundColor: designSystem.colors.primary }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Notes Display Options */}
              <div className="mb-3 flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700">Notes Display:</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={notesDisplay === 'truncated' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotesDisplay('truncated')}
                      className="h-8 text-xs"
                    >
                      <EyeOff className="h-3 w-3 mr-1" />
                      Truncated
                    </Button>
                    <Button
                      variant={notesDisplay === 'wrapped' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotesDisplay('wrapped')}
                      className="h-8 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Full Text
                    </Button>
                    <Button
                      variant={notesDisplay === 'modal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotesDisplay('modal')}
                      className="h-8 text-xs"
                    >
                      <Maximize2 className="h-3 w-3 mr-1" />
                      Click to View
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Hover over truncated text to see full notes
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
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
                        <td className={`px-4 py-3 text-gray-600 text-xs ${notesDisplay === 'wrapped' ? '' : 'max-w-xs'}`}>
                          {notesDisplay === 'truncated' && (
                            <div 
                              className="truncate cursor-help hover:text-gray-900 transition-colors"
                              title={result.notes}
                            >
                              {result.notes}
                            </div>
                          )}
                          
                          {notesDisplay === 'wrapped' && (
                            <div className="whitespace-pre-wrap text-wrap max-w-md">
                              {result.notes}
                            </div>
                          )}
                          
                          {notesDisplay === 'modal' && (
                            <button
                              className="underline cursor-pointer hover:opacity-80"
                              style={{ color: designSystem.colors.primary }}
                              onClick={() => setSelectedNote({ 
                                product: result.productName, 
                                notes: result.notes 
                              })}
                            >
                              View Details →
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Statistics */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="rounded-xl p-4" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                  <p className="text-sm font-medium text-gray-900">Total Products</p>
                  <p className="text-2xl font-bold" style={{ color: designSystem.colors.primary }}>{results.length}</p>
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
                <div className="rounded-xl p-4" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                  <p className="text-sm font-medium text-gray-900">Avg CUIN</p>
                  <p className="text-2xl font-bold" style={{ color: designSystem.colors.primary }}>
                    {(results.reduce((sum, r) => sum + r.totalCUIN, 0) / results.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Modal */}
        {selectedNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
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
                  className="hover:opacity-90 text-white"
                >
                  Copy Notes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button and Progress */}
        {!results && (
          <div className="space-y-4">
            {/* Progress Display */}
            {isProcessing && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Processing Your Products</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {processingProgress || 'Initializing...'}
                    </p>
                  </div>
                </div>
                
                {totalProducts > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900 font-medium">
                        {processedProducts}/{totalProducts} products ({Math.round((processedProducts/totalProducts)*100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(processedProducts / totalProducts) * 100}%` }}
                      />
                    </div>
                    {totalProducts > 50 && currentChunk > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Large file processing: Chunk {currentChunk} of ~{Math.ceil(totalProducts / 50)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                size="lg"
                disabled={!productFile || !boundingDimensions.min.l || !boundingDimensions.avg.l || !boundingDimensions.max.l || isProcessing}
                onClick={handleGenerateSpecs}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 min-w-64 h-12"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </div>
                ) : !productFile || !boundingDimensions.min.l ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Complete Setup Required
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Generate Specs with AI
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};