import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowUpTrayIcon as Upload,
  DocumentIcon as FileSpreadsheet,
  ChartBarIcon as BarChart3,
  ArchiveBoxIcon as Package,
  ArrowTrendingUpIcon as TrendingUp,
  CheckCircleIcon as CheckCircle2,
  ExclamationCircleIcon as AlertCircle,
  ArrowPathIcon as Loader2,
  InformationCircleIcon as Info,
  XMarkIcon as X
} from '@heroicons/react/24/outline';
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
import { designSystem } from '@/lib/design-system';
import { useTokenGuard } from '@/hooks/useTokenGuard';


export const PackagingSuiteAnalyzerBackend = () => {
  const navigate = useNavigate();
  const { checkAndConsumeToken, tokenBalance } = useTokenGuard();
  const [showHelpModal, setShowHelpModal] = useState(true); // Show automatically on load
  const [files, setFiles] = useState<{
    orderHistory: File | null;
    packagingSuite: File | null;
  }>({
    orderHistory: null,
    packagingSuite: null,
  });


  const [manualPackages, setManualPackages] = useState([
    { name: '', id: '', length: '', width: '', height: '', cost: '', weight: '', usage: '' }
  ]);
  const [useManualPackageInput, setUseManualPackageInput] = useState(false);

  const [currentAnalysisId, setCurrentAnalysisId] = useState<Id<"analyses"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convex mutations and queries
  const startAnalysis = useMutation(api.suiteAnalyzerBackend.startSuiteAnalysis);
  const analysisData = useQuery(api.suiteAnalyzerBackend.getAnalysis, 
    currentAnalysisId ? { analysisId: currentAnalysisId } : "skip"
  );
  const handleFileUpload = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
    setError(null);
  };

  const addPackageRow = () => {
    setManualPackages([...manualPackages, { name: '', id: '', length: '', width: '', height: '', cost: '', weight: '', usage: '' }]);
  };

  const removePackageRow = (index: number) => {
    setManualPackages(manualPackages.filter((_, i) => i !== index));
  };

  const updatePackageRow = (index: number, field: string, value: string) => {
    const updated = [...manualPackages];
    updated[index] = { ...updated[index], [field]: value };
    setManualPackages(updated);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleAnalyze = async () => {
    console.log('handleAnalyze called');
    console.log('Files:', files);
    
    if (!files.orderHistory) {
      setError('Please upload Order Data file');
      return;
    }

    // Check if we have either a file or manual input for packaging suite
    if (!useManualPackageInput && !files.packagingSuite) {
      setError('Please upload Packaging Suite file or enter packages manually');
      return;
    }

    if (useManualPackageInput) {
      // Validate manual packages
      const validPackages = manualPackages.filter(pkg => 
        pkg.name && pkg.id && pkg.length && pkg.width && pkg.height &&
        !isNaN(parseFloat(pkg.length)) && !isNaN(parseFloat(pkg.width)) && !isNaN(parseFloat(pkg.height))
      );
      
      if (validPackages.length === 0) {
        setError('Please enter at least one valid package with all required fields');
        return;
      }
    }


    console.log('Starting file reading...');
    setError(null);

    try {
      // Read file contents
      console.log('Reading order data...');
      const orderHistoryCSV = await readFileAsText(files.orderHistory);
      
      console.log('Reading/creating packaging suite...');
      let packagingSuiteCSV;
      
      if (useManualPackageInput) {
        // Create CSV from manual input
        const headers = ['Package Name', 'Package ID', 'Length', 'Width', 'Height', 'Cost per Unit', 'Package Weight', 'Usage %'];
        const rows = manualPackages
          .filter(pkg => pkg.name && pkg.id && pkg.length && pkg.width && pkg.height)
          .map(pkg => [
            pkg.name,
            pkg.id,
            pkg.length,
            pkg.width,
            pkg.height,
            pkg.cost || '0',
            pkg.weight || '',
            pkg.usage || ''
          ].join(','));
        
        packagingSuiteCSV = [headers.join(','), ...rows].join('\n');
        console.log('Created packaging suite CSV from manual input:', packagingSuiteCSV);
      } else {
        packagingSuiteCSV = await readFileAsText(files.packagingSuite);
      }
      


      // Start backend analysis with token check
      console.log('Starting backend analysis...');
      
      const result = await checkAndConsumeToken('suite_analyzer', async () => {
        const analysisId = await startAnalysis({
          name: `Suite Analysis - ${new Date().toLocaleString()}`,
          orderHistoryCSV,
          packagingSuiteCSV,
          config: {
            allowRotation: true,
            allowStacking: true,
            includeShippingCosts: false,
            minimumFillRate: 30
          }
        });
        
        return { analysisId };
      });
      
      if (!result.success) {
        console.error('Analysis failed or no tokens available');
        return;
      }

      console.log('Analysis started with ID:', result.result.analysisId);
      setCurrentAnalysisId(result.result.analysisId);
      
      // Navigate to loading page
      navigate(`/suite-analysis/${result.result.analysisId}/loading`);

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  const isAnalyzing = currentAnalysisId && analysisData?.status === 'processing';
  const analysisFailed = analysisData?.status === 'failed';
  const analysisError = analysisFailed ? (analysisData.results as any)?.error : null;
  
  // Remove the auto-navigation since it will be handled by the loading page
  // useEffect(() => {
  //   if (currentAnalysisId && analysisData?.status === 'completed') {
  //     navigate(`/suite-analysis/${currentAnalysisId}`);
  //   }
  // }, [currentAnalysisId, analysisData?.status, navigate]);
  

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
      <div className="space-y-4">
        
        {/* Show placeholder when help modal is open */}
        {showHelpModal && (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Suite Analyzer</h2>
            <p className="text-gray-600">Please read the manual to get started</p>
          </div>
        )}
        
        {/* Show content only when help modal is closed */}
        {!showHelpModal && (
          <>
            {/* Header */}
            <div className="bg-white rounded-3xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Suite Analyzer</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Optimize packaging allocation with powerful backend processing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">AI Powered</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpModal(true)}
                className="w-9 h-9 p-0 rounded-full hover:bg-gray-100"
              >
                <Info className="h-5 w-5 text-gray-600" />
              </Button>
              </div>
            </div>
            </div>

        <div className="max-w-4xl mx-auto">
          {/* File Uploads */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-200 rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-2xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  </div>
                  Required Files
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500 mt-2">
                  Upload your data files to get started with backend analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Order Data Upload */}
                <div className="space-y-2">
                  <Label htmlFor="order-history" className="text-gray-700 font-medium">Order Data File *</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-3xl p-3 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Upload className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Required fields: Order ID, Total Order Volume (cubic inches) | Recommended fields: Product dimensions (L×W×H inches)
                    </p>
                    <Input
                      id="order-history"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => handleFileUpload('orderHistory', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('order-history')?.click()}
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      {files.orderHistory ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="truncate max-w-[100px]">{files.orderHistory.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Choose File
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Packaging Suite Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="packaging-suite" className="text-slate-700 font-medium">Packaging Suite File *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUseManualPackageInput(!useManualPackageInput)}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      {useManualPackageInput ? 'Switch to File Upload' : 'Enter Manually'}
                    </Button>
                  </div>
                  
                  {!useManualPackageInput ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                      <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                      <p className="text-sm text-slate-600 mb-3">
                        Required fields: Package types, L×W×H (inches) | Recommended fields: Price ($), weight (lbs), usage (%)
                      </p>
                      <Input
                        id="packaging-suite"
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={(e) => handleFileUpload('packagingSuite', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button 
                        variant="outline"
                        onClick={() => document.getElementById('packaging-suite')?.click()}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        {files.packagingSuite ? files.packagingSuite.name : 'Choose File'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {manualPackages.map((pkg, index) => (
                        <div key={index} className="border border-gray-200 rounded-3xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">Package {index + 1}</h4>
                            {manualPackages.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePackageRow(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Package Name *</Label>
                              <Input
                                type="text"
                                value={pkg.name}
                                onChange={(e) => updatePackageRow(index, 'name', e.target.value)}
                                placeholder="e.g., Small Box"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Package ID *</Label>
                              <Input
                                type="text"
                                value={pkg.id}
                                onChange={(e) => updatePackageRow(index, 'id', e.target.value)}
                                placeholder="e.g., SM"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Length *</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={pkg.length}
                                onChange={(e) => updatePackageRow(index, 'length', e.target.value)}
                                placeholder="L"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Width *</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={pkg.width}
                                onChange={(e) => updatePackageRow(index, 'width', e.target.value)}
                                placeholder="W"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Height *</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={pkg.height}
                                onChange={(e) => updatePackageRow(index, 'height', e.target.value)}
                                placeholder="H"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Cost (optional)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={pkg.cost}
                                onChange={(e) => updatePackageRow(index, 'cost', e.target.value)}
                                placeholder="$ per unit"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Weight (optional)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={pkg.weight}
                                onChange={(e) => updatePackageRow(index, 'weight', e.target.value)}
                                placeholder="lbs"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Usage % (optional)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={pkg.usage}
                                onChange={(e) => updatePackageRow(index, 'usage', e.target.value)}
                                placeholder="%"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPackageRow}
                        className="w-full"
                      >
                        + Add Another Package
                      </Button>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

        {/* Error Display */}
        {(error || analysisError) && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {error || analysisError}
                </span>
              </div>
            </CardContent>
          </Card>
        )}


            <div className="flex justify-center lg:justify-end px-3 sm:px-0">
          <Button 
            size="lg"
            disabled={!files.orderHistory || (!files.packagingSuite && !useManualPackageInput) || isAnalyzing}
            onClick={handleAnalyze}
            className="hover:opacity-90 text-white disabled:bg-gray-300 disabled:text-gray-500 min-w-48 rounded-full"
            style={{ backgroundColor: designSystem.colors.primary }}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            ) : !files.orderHistory || !files.packagingSuite ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Upload Files
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analyze Suite (Backend)
              </div>
            )}
          </Button>
            </div>
            
          </>
        )}

      {/* Help Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
                <Package className="h-5 w-5 text-white" />
              </div>
              Suite Analyzer Manual
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-4">
              Everything you need to know about using the Suite Analyzer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            {/* What is Suite Analyzer */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: designSystem.colors.primary }}></div>
                What is Suite Analyzer?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Suite Analyzer is an AI-powered tool that optimizes packaging allocation by analyzing your order volume data 
                and mapping orders to your available packaging suite. It uses actual volume data (not estimated dimensions) 
                to provide accurate fill rates and cost analysis, helping you reduce waste and optimize packaging efficiency.
              </p>
            </div>

            {/* How it Works */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: designSystem.colors.primary }}></div>
                How It Works
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Upload your order data with <strong>Total Order Volume</strong> (cubic inches)</li>
                <li>Upload your packaging suite with package dimensions and costs (optional)</li>
                <li>The AI uses <strong>volume-based logic</strong> to map orders to appropriate packages</li>
                <li>Get accurate fill rates based on real volume data (no artificial inflation)</li>
                <li>View cost analysis with $0.00 shown when costs aren't provided</li>
              </ol>
            </div>

            {/* Required Fields */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Required Fields
              </h3>
              
              <div className="bg-red-50 p-4 rounded-3xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Order Data File</h4>
                <ul className="space-y-2 text-sm text-red-800">
                  <li><strong>Order ID:</strong> Unique identifier for each order</li>
                  <li><strong>Total Order Volume:</strong> Combined volume of all products in the order (in cubic inches)</li>
                </ul>
                <p className="text-xs text-red-700 mt-2">
                  <strong>Why required:</strong> We use actual volume data for accurate package selection and fill rate calculations (no fallback dimensions).
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-3xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Packaging Suite File</h4>
                <ul className="space-y-2 text-sm text-red-800">
                  <li><strong>Package Types:</strong> Name/ID of each package option</li>
                  <li><strong>Dimensions (L×W×H):</strong> Length, width, and height of each package</li>
                  <li><strong>Cost per Unit (Optional):</strong> Package cost - shows $0.00 if not provided</li>
                </ul>
                <p className="text-xs text-red-700 mt-2">
                  <strong>Why required:</strong> Package dimensions are used for volume capacity calculations and optimal package selection.
                </p>
              </div>

              <div className="p-4 rounded-3xl border" style={{ backgroundColor: designSystem.colors.primaryLight, borderColor: designSystem.colors.primary }}>
                <h4 className="font-semibold text-blue-900 mb-2">How Volume-Based Classification Works</h4>
                <p className="text-sm text-blue-800 mb-2">
                  When only Total Order Volume is provided (no individual L×W×H):
                </p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li><strong>Package Selection:</strong> Based on volume capacity (package volume ≥ order volume)</li>
                  <li><strong>Fill Rate Calculation:</strong> Uses actual CSV volume data for accuracy</li>
                  <li><strong>Display:</strong> Shows "Volume only" in results instead of estimated dimensions</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>Key Benefit:</strong> No artificial dimension estimates - uses real volume data for better accuracy.
                </p>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Optional Fields
              </h3>
              
              <div className="bg-green-50 p-4 rounded-3xl border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Order Data - Product Dimensions</h4>
                <p className="text-sm text-green-800 mb-2">
                  Individual product dimensions (L×W×H) for each item in the order
                </p>
                <p className="text-xs text-green-700">
                  <strong>Benefits:</strong> More accurate package selection, better fill rate calculations, and precise optimization.
                  <br />
                  <strong>Without it:</strong> System uses fallback dimensions based on order volume ranges.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-3xl border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Packaging Suite - Additional Data</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li><strong>Package Price:</strong> Cost per package unit</li>
                  <li><strong>Package Weight:</strong> Weight of empty package</li>
                  <li><strong>Current Usage %:</strong> How often each package type is currently used</li>
                </ul>
                <p className="text-xs text-green-700 mt-2">
                  <strong>Benefits:</strong> Enables cost savings calculations, material waste analysis, and usage optimization recommendations.
                  <br />
                  <strong>Without it:</strong> Analysis focuses on volume optimization only, without cost projections.
                </p>
              </div>

            </div>

            {/* Best Practices */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Best Practices
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Include at least 100+ orders for meaningful analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Ensure your packaging suite covers a good range of sizes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Use consistent units (inches) across all dimensions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Include package costs for ROI calculations</span>
                </li>
              </ul>
            </div>

            {/* File Format Examples */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                File Format Examples
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Order Data CSV Format</h4>
                <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto">
{`Order ID,Total Order Volume,Product Length,Product Width,Product Height
ORD-001,450.5,10.5,8.2,5.5
ORD-002,1200.0,,,
ORD-003,275.8,7.0,6.5,6.0`}
                </pre>
                <p className="text-xs text-gray-600 mt-2">Note: Product dimensions are optional</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Packaging Suite CSV Format</h4>
                <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto">
{`Package Name,Length,Width,Height,Price,Weight,Usage %
Small Box,10,8,6,0.25,0.15,35
Medium Box,14,12,8,0.45,0.25,45
Large Box,20,16,12,0.75,0.40,20`}
                </pre>
                <p className="text-xs text-gray-600 mt-2">Note: Price, Weight, and Usage % are optional</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      </div>
    </div>
  );
};