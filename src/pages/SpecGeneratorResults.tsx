import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Copy, Package, CheckCircle, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductSpec {
  orderId?: string;
  productName: string;
  estimatedLength: number;
  estimatedWidth: number;
  estimatedHeight: number;
  totalCUIN: number;
  confidence: string;
  notes?: string;
}

interface SpecGeneratorResults {
  productSpecs: ProductSpec[];
  summary: {
    totalProducts: number;
    processedProducts: number;
    boundingDimensions: {
      min: { length: number; width: number; height: number };
      avg: { length: number; width: number; height: number };
      max: { length: number; width: number; height: number };
    };
  };
}

export const SpecGeneratorResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<SpecGeneratorResults | null>(null);
  const [backPath, setBackPath] = useState('/spec-generator');
  // Removed tab state - showing only specifications

  useEffect(() => {
    // Get back path context
    const storedContext = sessionStorage.getItem('specGeneratorContext');
    if (storedContext === '/dashboard') {
      setBackPath('/dashboard');
    }
    
    const storedResults = sessionStorage.getItem('specGeneratorResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        // Validate the results structure
        if (parsedResults && parsedResults.productSpecs && parsedResults.summary) {
          setResults(parsedResults);
        } else {
          console.error('Invalid results structure:', parsedResults);
          navigate(backPath);
        }
      } catch (error) {
        console.error('Failed to parse stored results:', error);
        navigate(backPath);
      }
    } else {
      console.log('No stored results found, redirecting to generator');
      navigate(backPath);
    }
  }, [navigate, backPath]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      'High': 'bg-green-100 text-green-800 border-green-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low': 'bg-red-100 text-red-800 border-red-200'
    };
    return variants[confidence as keyof typeof variants] || variants.Medium;
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Product Name', 'Length (in)', 'Width (in)', 'Height (in)', 'CUIN', 'Confidence Level', 'Notes'];
    const rows = results.productSpecs.map(spec => [
      spec.orderId || '',
      spec.productName,
      spec.estimatedLength.toString(),
      spec.estimatedWidth.toString(),
      spec.estimatedHeight.toString(),
      spec.totalCUIN.toString(),
      spec.confidence,
      spec.notes || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `product-specifications-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Specifications exported to CSV');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };


  const renderSpecs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Specifications</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={exportToCSV}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="space-y-3">
        {results.productSpecs.map((spec, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-12 items-center">
                <div className="md:col-span-4">
                  <div className="flex flex-col">
                    {spec.orderId && (
                      <span className="text-xs text-gray-500 mb-1">Order: {spec.orderId}</span>
                    )}
                    <h4 className="font-medium text-gray-900">{spec.productName}</h4>
                  </div>
                </div>
                
                <div className="md:col-span-2 text-center">
                  <div className="text-sm text-gray-500">Dimensions</div>
                  <div className="font-mono text-sm">
                    {spec.estimatedLength}" × {spec.estimatedWidth}" × {spec.estimatedHeight}"
                  </div>
                </div>
                
                <div className="md:col-span-2 text-center">
                  <div className="text-sm text-gray-500">CUIN</div>
                  <div className="font-semibold text-lg text-blue-600">{spec.totalCUIN}</div>
                </div>
                
                <div className="md:col-span-2 text-center">
                  <div className="text-sm text-gray-500">Confidence Level</div>
                  <Badge className={getConfidenceBadge(spec.confidence)}>
                    {spec.confidence}
                  </Badge>
                </div>
                
                <div className="md:col-span-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`${spec.productName}: ${spec.estimatedLength}" × ${spec.estimatedWidth}" × ${spec.estimatedHeight}" = ${spec.totalCUIN} CUIN`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {spec.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">{spec.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(backPath)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Generator
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Product Specifications</h1>
                <p className="text-sm text-gray-500 mt-1">
                  AI-generated dimensional estimates for {results.summary.processedProducts} products
                </p>
              </div>
            </div>
            <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
          
          {/* Warning Message */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-800 font-medium">
                Download your results before you leave — reports are cleared when you exit.
              </p>
            </div>
          </div>
        </div>


        {/* Summary Metrics */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.summary.processedProducts}</p>
                  <p className="text-sm text-gray-500">Products Processed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((results.productSpecs.filter(s => s.confidence === 'High').length / results.productSpecs.length) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">High Confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Specifications Content */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          {renderSpecs()}
        </div>
      </div>
    </div>
  );
};

export default SpecGeneratorResults;