import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowUpTrayIcon as Upload,
  DocumentIcon as FileSpreadsheet,
  ChartBarIcon as BarChart3,
  ArchiveBoxIcon as Package,
  CheckCircleIcon as CheckCircle2,
  ExclamationCircleIcon as AlertCircle,
  ArrowPathIcon as Loader2,
  XMarkIcon as X,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  CheckIcon as Check
} from '@heroicons/react/24/outline';
import { ProductManual } from '@/components/ui/ProductManual';
import { CSVFormatGuide } from '@/components/ui/CSVFormatGuide';
import { useTokenGuard } from '@/hooks/useTokenGuard';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';


export const PackagingSuiteAnalyzerBackend = () => {
  const navigate = useNavigate();
  const { checkAndConsumeToken, tokenBalance } = useTokenGuard();
  const createAnalysis = useMutation(api.analyses.create);
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

  // Step interface state
  const [currentStep, setCurrentStep] = useState(1);
  
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedOrders, setProcessedOrders] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const workerRef = useRef<Worker | null>(null);


  // Step validation
  const isStep1Valid = files.orderHistory !== null;
  const isStep2Valid = files.packagingSuite !== null || (useManualPackageInput && manualPackages.some(pkg => pkg.name && pkg.length && pkg.width && pkg.height));
  const isStep3Valid = isStep1Valid && isStep2Valid;

  const steps = [
    { 
      number: 1, 
      title: 'Order Data Upload', 
      description: 'Upload your order history data',
      isValid: isStep1Valid,
      isComplete: isStep1Valid && currentStep > 1
    },
    { 
      number: 2, 
      title: 'Packaging Suite', 
      description: 'Upload packaging data or enter manually',
      isValid: isStep2Valid,
      isComplete: isStep2Valid && currentStep > 2
    },
    { 
      number: 3, 
      title: 'Analysis Settings', 
      description: 'Configure and run analysis',
      isValid: isStep3Valid,
      isComplete: false
    }
  ];

  // Parse CSV data into structured objects
  const parseOrderHistoryCSV = (csv: string) => {
    console.log('Parsing CSV with length:', csv.length);
    console.log('First 500 chars of CSV:', csv.substring(0, 500));
    
    const lines = csv.trim().split('\n').filter(line => line.trim() !== '');
    console.log('Total lines in CSV:', lines.length);
    
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);
    
    // Map to aggregate orders by Order ID
    const orderMap = new Map<string, any>();
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const order: any = {};
      
      headers.forEach((header, index) => {
        order[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
      });
      
      // Log first few orders for debugging
      if (i <= 3) {
        console.log(`Line ${i} raw:`, order);
      }
      
      // Parse dimensions - be more flexible with field names
      let length = null, width = null, height = null;
      let hasActualDimensions = false;
      
      // Handle "Product Length" style headers (with spaces)
      const lengthValue = order.product_length || order.length || order.l || order.item_length || order['product_length'];
      const widthValue = order.product_width || order.width || order.w || order.item_width || order['product_width'];
      const heightValue = order.product_height || order.height || order.h || order.item_height || order['product_height'];
      
      if (lengthValue && widthValue && heightValue) {
        length = parseFloat(lengthValue);
        width = parseFloat(widthValue);
        height = parseFloat(heightValue);
        hasActualDimensions = !isNaN(length) && !isNaN(width) && !isNaN(height);
      }
      
      // More flexible order ID extraction
      const orderId = order.order_id || order.orderid || order.id || order.order || 
                     order.order_number || order.ordernumber || order['order_id'] || `ORDER-${i}`;
      
      // More flexible volume extraction - including "Total Order Volumes (CUIN)"
      const volume = order['total_order_volumes_(cuin)'] || order.product_cuin || order.total_order_volumes ||
                     order.total_order_volume || order.total_cuin || order.totalcuin ||
                     order.totalordervolume || order.volume || order.total_volume ||
                     order.cubic_inches || order.size || order.item_volume || order.cuin ||
                     order['product_cuin'] || null;
      
      // Log what we're checking
      if (i <= 3) {
        console.log(`Order ${i} extracted:`, { 
          orderId, 
          volume, 
          hasActualDimensions,
          dimensions: { length, width, height }
        });
      }
      
      // Aggregate orders with the same Order ID
      if (orderId) {
        const volumeNum = volume ? parseFloat(volume) : 
                         (hasActualDimensions ? length * width * height : 0);
        
        if (orderMap.has(orderId)) {
          // Aggregate volume for existing order
          const existing = orderMap.get(orderId);
          existing.originalVolume = (existing.originalVolume || 0) + volumeNum;
          existing.items = existing.items || [];
          existing.items.push({
            sku: order.sku,
            volume: volumeNum,
            dimensions: { length, width, height }
          });
          
          // Use max dimensions for aggregated order
          if (hasActualDimensions) {
            existing.length = Math.max(existing.length || 0, length);
            existing.width = Math.max(existing.width || 0, width);
            existing.height = Math.max(existing.height || 0, height);
            existing.hasActualDimensions = true;
          }
        } else {
          // Create new order
          const parsedOrder = {
            orderId: orderId,
            productName: order.product_name || order.productname || order.name || 
                        order.item_name || order.description || order.sku || 'Order Items',
            length,
            width,
            height,
            hasActualDimensions,
            originalVolume: volumeNum,
            unit: order.unit || 'in',
            quantity: parseInt(order.quantity) || 1,
            weight: parseFloat(order.weight) || 1,
            category: order.category || 'General',
            priority: order.priority || 'standard',
            zone: order.zone || 'domestic',
            items: [{
              sku: order.sku,
              volume: volumeNum,
              dimensions: { length, width, height }
            }]
          };
          
          orderMap.set(orderId, parsedOrder);
        }
        
        if (i <= 3) {
          console.log(`Line ${i} processed for order ${orderId}`);
        }
      }
    }
    
    // Convert map to array
    const orders = Array.from(orderMap.values());
    
    console.log(`Aggregated ${orders.length} unique orders from ${lines.length - 1} data rows`);
    orders.slice(0, 3).forEach(order => {
      console.log(`Order ${order.orderId}:`, {
        totalVolume: order.originalVolume,
        itemCount: order.items?.length || 1,
        hasActualDimensions: order.hasActualDimensions
      });
    });
    
    return orders;
  };

  const parsePackagingSuiteCSV = (csv: string) => {
    console.log('Parsing packaging CSV with length:', csv.length);
    const lines = csv.trim().split('\n');

    // Find the header row (skip title rows if they exist)
    let headerIndex = 0;
    const expectedHeaders = ['package', 'type', 'name', 'length', 'width', 'height', 'cost', 'weight', 'price'];

    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const potentialHeaders = lines[i].toLowerCase();
      if (expectedHeaders.some(h => potentialHeaders.includes(h))) {
        headerIndex = i;
        console.log(`Found headers at row ${i + 1}`);
        break;
      }
    }

    const headers = lines[headerIndex].split(',').map(h => h.trim());
    console.log('Package CSV Headers:', headers);

    const packages = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const pkg: any = {};
      
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        pkg[key] = values[index];
      });
      
      if (i <= 3) {
        console.log(`Package ${i} raw:`, pkg);
      }
      
      // Handle "Price" field as well as other cost fields
      const providedCost = pkg.cost_per_unit || pkg.costperunit || pkg.cost ||
                          pkg.price || pkg.unit_cost || pkg.unitcost || pkg.package_cost;
      const costPerUnit = parseFloat(providedCost) || 1.0;
      const usingDefaultCost = !providedCost || parseFloat(providedCost) === 0;

      // Debug logging for cost parsing
      if (i <= 3) {
        console.log(`Package ${i} cost parsing:`, {
          providedCost,
          costPerUnit,
          usingDefaultCost,
          allFields: Object.keys(pkg).filter(k => k.includes('cost') || k.includes('price')),
          allPkgKeys: Object.keys(pkg),
          allValues: Object.entries(pkg).filter(([k, v]) => k.includes('cost') || k.includes('price'))
        });
      }
      
      const packageData = {
        packageName: pkg.package_name || pkg.packagename || pkg.package_type || pkg.name || pkg['package_name'] || `Package-${i}`,
        packageId: pkg.package_name || pkg.packagename || pkg.package_type || pkg.name || pkg['package_name'] || `PKG-${i}`,
        length: parseFloat(pkg.length || pkg.l || pkg.package_length) || 12,
        width: parseFloat(pkg.width || pkg.w || pkg.package_width) || 9,
        height: parseFloat(pkg.height || pkg.h || pkg.package_height) || 3,
        unit: pkg.unit || 'in',
        costPerUnit,
        usingDefaultCost,
        packageWeight: parseFloat(pkg.package_weight || pkg.packageweight || pkg.weight) || 0.1,
        maxWeight: parseFloat(pkg.max_weight || pkg.maxweight) || 50,
        material: pkg.material || 'Cardboard',
        type: pkg.type || 'box',
        usage: pkg.baseline_usage_percent || pkg['usage_%'] || pkg.usage_percent || pkg.usage || null
      };
      
      packages.push(packageData);
      
      if (i <= 3) {
        console.log(`Package ${i} parsed:`, packageData);
      }
    }
    
    console.log(`Parsed ${packages.length} packages from CSV`);
    return packages;
  };


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
      // Validate manual packages - ID is auto-generated, not required from user
      const validPackages = manualPackages.filter(pkg =>
        pkg.name && pkg.length && pkg.width && pkg.height &&
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
      let packagingSuiteCSV: string;
      
      if (useManualPackageInput) {
        // Create CSV from manual input
        const headers = ['Package Type', 'Length', 'Width', 'Height', 'Cost', 'Weight', 'Baseline Usage Percent'];
        const rows = manualPackages
          .filter(pkg => pkg.name && pkg.length && pkg.width && pkg.height)
          .map(pkg => [
            pkg.name,
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
      
      // Start Web Worker analysis with token check
      console.log('Starting Web Worker analysis...');

      const result = await checkAndConsumeToken('suite_analyzer', async () => {
        
        // Parse CSV data into structured objects
        console.log('Parsing order history...');
        const allOrders = parseOrderHistoryCSV(orderHistoryCSV);
        console.log(`Found ${allOrders.length.toLocaleString()} orders`);

        // NO LIMITS - Process all orders using Web Worker
        const orders = allOrders;
        console.log(`Processing all ${orders.length.toLocaleString()} orders using Web Worker`);
        
        console.log('Parsing packaging suite...');
        const packages = parsePackagingSuiteCSV(packagingSuiteCSV);
        console.log(`Found ${packages.length} packages`);
        
        // Check if we have data to process
        if (orders.length === 0) {
          console.error('No orders found in CSV!');
          setError('No valid orders found in the uploaded CSV file. Please check the file format.');
          return { analysisId: null };
        }

        if (packages.length === 0) {
          console.error('No packages found in CSV!');
          setError('No valid packages found in the packaging suite CSV. Please check the file format.');
          return { analysisId: null };
        }
        
        // Generate analysis ID for navigation
        const analysisId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        // Start Web Worker processing
        console.log('Starting Web Worker processing...');
        setIsProcessing(true);
        setProgress(0);
        setProcessedOrders(0);
        setTotalOrders(orders.length);

        // Initialize Web Worker with Vite's special syntax
        // Import the worker using ?worker suffix for Vite
        import('../workers/analysisWorker.ts?worker').then((WorkerModule) => {
          workerRef.current = new WorkerModule.default();

          // Set up worker message handlers
          workerRef.current.onmessage = (e) => {
            const { type, data } = e.data;

            if (type === 'progress') {
              setProgress(data.progress);
              setProcessedOrders(data.processed);
              console.log(`Progress: ${data.progress.toFixed(1)}% (${data.processed.toLocaleString()}/${data.total.toLocaleString()})`);
            } else if (type === 'complete') {
              console.log('Analysis complete! Saving to database...');
              setIsProcessing(false);

              // Navigate to results page with data passed through React Router state
              navigate(`/suite-analysis/${analysisId}/client-results`, {
                state: {
                  analysisResults: data,
                  analysisId: analysisId,
                  timestamp: new Date().toISOString()
                }
              });

              // Cleanup worker
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
            } else if (type === 'error') {
              console.error('Worker error:', data);
              setError(`Processing failed: ${data.message || 'Unknown error'}`);
              setIsProcessing(false);

              // Cleanup worker
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
            }
          };

          workerRef.current.onerror = (error) => {
            console.error('Worker error:', error);
            setError('Web Worker failed to start');
            setIsProcessing(false);
          };

          // Transform orders to Web Worker format
          const workerOrders = orders.map(order => ({
            orderId: order.orderId,
            volume: order.originalVolume || 0,
            weight: order.weight || 1,
            length: order.hasActualDimensions ? order.length : undefined,
            width: order.hasActualDimensions ? order.width : undefined,
            height: order.hasActualDimensions ? order.height : undefined
          }));

          // Log package costs before sending to worker
          console.log('Packages being sent to worker:', packages.map(pkg => ({
            name: pkg.packageName,
            cost: pkg.costPerUnit,
            usingDefault: pkg.usingDefaultCost,
            usage: pkg.usage
          })));

          // Send data to worker
          workerRef.current.postMessage({
            orders: workerOrders,
            packages
          });
        }).catch((error) => {
          console.error('Failed to load Web Worker:', error);
          setError('Failed to load Web Worker');
          setIsProcessing(false);
        });

        return { analysisId };
      });
      
      if (!result.success) {
        console.error('Analysis failed or no tokens available');
        return;
      }

      if (result.result.analysisId) {
        console.log('Analysis started with ID:', result.result.analysisId);
        setCurrentAnalysisId(result.result.analysisId);
      }

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  // Remove unused variables
  // const isAnalyzing = currentAnalysisId && analysisData?.status === 'processing';
  // const analysisFailed = analysisData?.status === 'failed';
  // const analysisError = analysisFailed ? (analysisData.results as any)?.error : null;
  
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
          <div className="w-8 h-8 rounded-3xl flex items-center justify-center bg-blue-500">
            <FileSpreadsheet className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Order History Data</h3>
        </div>

        <CSVFormatGuide
          title="Required CSV Format"
          description="Your CSV should include: Order ID and Total Order Volume (CUIN)"
          columns={[
            { name: "Order ID" },
            { name: "Total Order Volume" }
          ]}
          sampleData={[
            { "Order ID": "ORD-001", "Total Order Volume": "145.5" },
            { "Order ID": "ORD-002", "Total Order Volume": "89.2" },
            { "Order ID": "ORD-003", "Total Order Volume": "267.8" }
          ]}
          className="mb-6"
        />

        {!files.orderHistory ? (
          <label className="relative block">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload('orderHistory', e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center transition-all cursor-pointer group min-h-[300px] flex flex-col justify-center hover:border-blue-500 hover:bg-blue-50">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 bg-blue-500">
                <Upload className="h-12 w-12 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Order History CSV</h4>
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
                  <p className="font-medium text-gray-900">{files.orderHistory.name}</p>
                  <p className="text-sm text-gray-500">{(files.orderHistory.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFileUpload('orderHistory', null)}
              >
                <X className="h-4 w-4" />
              </Button>
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
          <div className="w-8 h-8 rounded-3xl flex items-center justify-center bg-blue-500">
            <Package className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Packaging Suite Data</h3>
        </div>

        {/* Toggle between file upload and manual input */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={!useManualPackageInput ? "default" : "outline"}
            onClick={() => setUseManualPackageInput(false)}
            className="flex-1"
          >
            Upload CSV File
          </Button>
          <Button
            variant={useManualPackageInput ? "default" : "outline"}
            onClick={() => setUseManualPackageInput(true)}
            className="flex-1"
          >
            Enter Manually
          </Button>
        </div>

        {!useManualPackageInput ? (
          <>
            <CSVFormatGuide
              title="Required CSV Format"
              description="Your CSV should include: Package Type, Length (inches), Width (inches), Height (inches), Cost ($), Weight (lbs), Baseline Usage Percent (%)"
              columns={[
                { name: "Package Type" },
                { name: "Length" },
                { name: "Width" },
                { name: "Height" },
                { name: "Cost" },
                { name: "Weight" },
                { name: "Baseline Usage Percent" }
              ]}
              sampleData={[
                { "Package Type": "Small Box", "Length": "12", "Width": "8", "Height": "6", "Cost": "1.25", "Weight": "0.5", "Baseline Usage Percent": "30" },
                { "Package Type": "Medium Box", "Length": "16", "Width": "12", "Height": "8", "Cost": "2.15", "Weight": "0.8", "Baseline Usage Percent": "50" },
                { "Package Type": "Large Box", "Length": "20", "Width": "16", "Height": "12", "Cost": "3.45", "Weight": "1.2", "Baseline Usage Percent": "20" }
              ]}
              className="mb-6"
            />

            {!files.packagingSuite ? (
              <label className="relative block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload('packagingSuite', e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center transition-all cursor-pointer group min-h-[300px] flex flex-col justify-center hover:border-blue-500 hover:bg-blue-50">
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 bg-blue-500">
                    <Upload className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Packaging Types CSV</h4>
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
                    <p className="font-medium text-gray-900">{files.packagingSuite.name}</p>
                    <p className="text-sm text-gray-500">{(files.packagingSuite.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileUpload('packagingSuite', null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Enter your packaging types manually:</p>
            {manualPackages.map((pkg, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
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
                <div className="mb-3">
                  <Label className="text-xs">Package Name *</Label>
                  <Input
                    type="text"
                    value={pkg.name}
                    onChange={(e) => updatePackageRow(index, 'name', e.target.value)}
                    placeholder="e.g., Small Box"
                    className="mt-1"
                  />
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
                    <Label className="text-xs">Baseline Usage % (optional)</Label>
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
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-3xl flex items-center justify-center bg-blue-500">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Analysis Configuration</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Order History</span>
              </div>
              <p className="text-sm text-gray-600">
                {files.orderHistory ? `✓ ${files.orderHistory.name}` : 'No file uploaded'}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Packaging Suite</span>
              </div>
              <p className="text-sm text-gray-600">
                {files.packagingSuite ? `✓ ${files.packagingSuite.name}` : 
                 useManualPackageInput ? '✓ Manual entry configured' : 'No data provided'}
              </p>
            </div>
          </div>

          {currentAnalysisId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Analysis in progress...</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Your suite analysis is being processed. This may take a few moments.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
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
          onClick={handleAnalyze}
          disabled={!isStep3Valid || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
          {isProcessing ? `Processing... ${progress.toFixed(1)}%` : 'Run Analysis'}
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
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Suite Analyzer</h2>
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
            
            {renderNavigation()}

            {/* Progress Display */}
            {isProcessing && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Processing Analysis</h3>
                    <p className="text-blue-700">
                      {processedOrders.toLocaleString()} of {totalOrders.toLocaleString()} orders processed
                    </p>
                  </div>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-blue-600 text-center">
                  {progress.toFixed(1)}% Complete
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ProductManual
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        productName="Suite Analyzer"
        productIcon={<Package className="h-5 w-5 text-white" />}
        sections={[
          {
            title: "INPUTS",
            icon: "📥",
            items: [
              "Order History CSV with Order ID and Total Order Volume (cubic inches)",
              "Packaging Suite CSV with package dimensions, costs, and baseline packaging usage rate (%)",
              "Alternative: Manual package entry with dimensions and baseline usage rate",
              "Optional: Product dimensions (Length, Width, Height) for enhanced analysis"
            ]
          },
          {
            title: "OUTPUTS",
            icon: "📤", 
            items: [
              "Optimized package recommendations for each order",
              "Fill rate analysis based on actual volume data", 
              "Cost analysis with package allocation breakdown",
              "Volume-based classification and efficiency metrics"
            ]
          },
          {
            title: "HOW IT WORKS",
            icon: "🎯",
            items: [
              "1. Upload order data with Total Order Volume (required)",
              "2. Upload packaging suite or enter package dimensions manually",
              "3. AI maps orders to optimal packages using volume-based logic",
              "4. View results with accurate fill rates and cost analysis"
            ]
          }
        ]}
      />
    </div>
  );
};