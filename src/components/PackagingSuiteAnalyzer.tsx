import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, BarChart3, Package, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SuiteAnalyzer } from '@/lib/suiteAnalyzer';
import type { SuiteAnalysisResult, ProcessingProgress } from '@/lib/suiteAnalyzer/types';

export const PackagingSuiteAnalyzer = () => {
  const [files, setFiles] = useState<{
    orderHistory: File | null;
    packagingSuite: File | null;
    baselineMix: File | null;
  }>({
    orderHistory: null,
    packagingSuite: null,
    baselineMix: null,
  });


  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [results, setResults] = useState<SuiteAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
    setError(null);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleAnalyze = async () => {
    if (!files.orderHistory || !files.packagingSuite) {
      setError('Please upload both Order History and Packaging Suite files');
      return;
    }


    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      // Read file contents
      const orderHistoryCSV = await readFileAsText(files.orderHistory);
      const packagingSuiteCSV = await readFileAsText(files.packagingSuite);
      const baselineMixCSV = files.baselineMix ? await readFileAsText(files.baselineMix) : undefined;


      // Create analyzer instance
      const analyzer = new SuiteAnalyzer(
        {
          allowRotation: true,
          allowStacking: true,
          includeShippingCosts: true,
          minimumFillRate: 30
        },
        (progressUpdate) => setProgress(progressUpdate)
      );

      // Perform analysis
      const analysisResult = await analyzer.analyzeSuite({
        orderHistoryCSV,
        packagingSuiteCSV,
        baselineMixCSV
      });

      setResults(analysisResult);
      setProgress(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setProgress(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Suite Analyzer</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Optimize packaging allocation and identify cost savings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Avg 23% Cost Reduction</span>
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                </div>
                Required Files
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 mt-2">
                Upload your data files to get started with the analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order History Upload */}
              <div className="space-y-3">
                <Label htmlFor="order-history" className="text-gray-700 font-medium">Order History File *</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Upload className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload CSV with Order ID, L×W×H, Total CUIN, Quantity
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
              <div className="space-y-3">
                <Label htmlFor="packaging-suite" className="text-slate-700 font-medium">Packaging Suite File *</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                  <p className="text-sm text-slate-600 mb-3">
                    Package Name, L×W×H, Cost per unit, Package Weight
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
              </div>

              {/* Baseline Mix Upload */}
              <div className="space-y-3">
                <Label htmlFor="baseline-mix" className="text-slate-700 font-medium">Baseline Packaging Mix (Optional)</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                  <Input
                    id="baseline-mix"
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={(e) => handleFileUpload('baselineMix', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => document.getElementById('baseline-mix')?.click()}
                    className="text-slate-600 hover:bg-slate-100"
                  >
                    {files.baselineMix ? files.baselineMix.name : 'Upload Baseline Mix'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Display */}
        {progress && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800 capitalize">{progress.stage}</span>
                  <span className="text-sm text-blue-600">{Math.round(progress.progress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-blue-600">
                  <span>{progress.message}</span>
                  {progress.totalItems > 0 && (
                    <span>{progress.currentItem} / {progress.totalItems}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center lg:justify-end px-4 sm:px-0">
          <Button 
            size="lg"
            disabled={!files.orderHistory || !files.packagingSuite || isAnalyzing}
            onClick={handleAnalyze}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 min-w-48"
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
                Analyze Suite
              </div>
            )}
          </Button>
        </div>

        {/* Results Display */}
        {results && (
          <div className="mt-8 space-y-6">
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  Analysis Complete
                </CardTitle>
                <CardDescription>
                  Analysis completed on {results.timestamp.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.summary.processedOrders}</div>
                    <div className="text-sm text-blue-800">Orders Processed</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">${Math.round(results.summary.totalSavings)}</div>
                    <div className="text-sm text-emerald-800">Total Savings</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(results.summary.averageFillRateImprovement)}%</div>
                    <div className="text-sm text-purple-800">Fill Rate Improvement</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{results.recommendations.length}</div>
                    <div className="text-sm text-orange-800">Recommendations</div>
                  </div>
                </div>

                {/* Top Recommendations */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Top Recommendations</h3>
                  <div className="space-y-3">
                    {results.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {rec.priority.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{rec.title}</span>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-medium text-emerald-600">
                              ${Math.round(rec.impact.savingsAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {rec.impact.affectedOrders} orders
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};