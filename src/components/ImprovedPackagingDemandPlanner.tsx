import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, Upload, FileText, Calculator, 
  Check, AlertCircle, Package, BarChart3,
  History, Percent, Plus, Trash2, Download,
  ChevronRight, ChevronLeft, Info, Lightbulb,
  Hash, X
} from 'lucide-react';
import { ProductManual } from '@/components/ui/ProductManual';
import { toast } from 'sonner';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTokenGuard } from '@/hooks/useTokenGuard';

interface PackagingType {
  name: string;
  length: number;
  width: number;
  height: number;
  cost: number;
  weight: number;
}

interface QuarterData {
  quarter: string;
  packageType: string;
  quantity: number;
}

interface ManualMix {
  packageType: string;
  percentage: number;
}

interface ManualQuantity {
  packageType: string;
  quantity: number;
}

interface DemandResults {
  packageType: string;
  usagePercentage: number;
  baseQuantity: number;
  finalQuantity: number;
  estimatedCost: number;
  estimatedWeight: number;
}

export const ImprovedPackagingDemandPlanner = () => {
  const { user } = useUser();
  const { checkAndConsumeToken } = useTokenGuard();

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataEntryMode, setDataEntryMode] = useState<'upload' | 'manual'>('upload');
  const [manualInputMode, setManualInputMode] = useState<'percentage' | 'quantity'>('percentage');
  const [showHelpModal, setShowHelpModal] = useState(true);
  
  // Data State
  const [packagingTypes, setPackagingTypes] = useState<PackagingType[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<'historical' | 'manual' | null>(null);
  const [quarterlyData, setQuarterlyData] = useState<QuarterData[]>([]);
  const [manualMix, setManualMix] = useState<ManualMix[]>([]);
  const [manualQuantities, setManualQuantities] = useState<ManualQuantity[]>([]);
  const [currentMix, setCurrentMix] = useState<{ [key: string]: number }>({});
  const [quarterNames, setQuarterNames] = useState<string[]>(['Q1', 'Q2', 'Q3', 'Q4']);
  const [editingQuarter, setEditingQuarter] = useState<number | null>(null);
  const [showUsageFormatInfo, setShowUsageFormatInfo] = useState(false);
  const [forecastParams, setForecastParams] = useState({
    totalOrders: '',
    safetyBuffer: '10'
  });
  const [results, setResults] = useState<DemandResults[]>([]);
  const [newPackageType, setNewPackageType] = useState<PackagingType>({
    name: '',
    length: 0,
    width: 0,
    height: 0,
    cost: 0,
    weight: 0
  });

  // Convex hooks
  const storedPackagingTypes = useQuery(api.improvedDemandPlanner.getPackagingTypes);
  const storedQuarterlyData = useQuery(api.improvedDemandPlanner.getQuarterlyData);
  const storedManualMix = useQuery(api.improvedDemandPlanner.getManualMix);
  const calculatedMix = useQuery(api.improvedDemandPlanner.calculateMixFromQuarterly);
  
  const storePackagingTypes = useMutation(api.improvedDemandPlanner.storePackagingTypes);
  const storeQuarterlyData = useMutation(api.improvedDemandPlanner.storeQuarterlyData);
  const storeManualMix = useMutation(api.improvedDemandPlanner.storeManualMix);
  const calculateDemand = useAction(api.improvedDemandPlanner.calculateDemandForecast);
  const clearAllData = useMutation(api.improvedDemandPlanner.clearAllUserData);

  // Load data from Convex on mount
  useEffect(() => {
    if (storedPackagingTypes) {
      setPackagingTypes(storedPackagingTypes.map(pt => ({
        name: pt.name,
        length: pt.length,
        width: pt.width,
        height: pt.height,
        cost: pt.cost,
        weight: pt.weight
      })));
    }
  }, [storedPackagingTypes]);

  useEffect(() => {
    if (storedQuarterlyData) {
      const mappedData = storedQuarterlyData.map(qd => ({
        quarter: qd.quarter,
        packageType: qd.packageType,
        quantity: qd.quantity
      }));
      setQuarterlyData(mappedData);
    }
  }, [storedQuarterlyData]);

  useEffect(() => {
    if (storedManualMix) {
      const mappedMix = storedManualMix.map(mm => ({
        packageType: mm.packageType,
        percentage: mm.percentage
      }));
      setManualMix(mappedMix);
    }
  }, [storedManualMix]);

  useEffect(() => {
    if (calculatedMix) {
      setCurrentMix(calculatedMix);
    }
  }, [calculatedMix]);

  // Step validation
  const isStep1Valid = packagingTypes.length > 0;
  const isStep2Valid = selectedMethod && (
    (selectedMethod === 'manual' && (
      (manualInputMode === 'percentage' && manualMix.length > 0 && manualMix.every(m => m.percentage > 0)) ||
      (manualInputMode === 'quantity' && manualQuantities.length > 0 && manualQuantities.every(q => q.quantity > 0))
    )) ||
    (selectedMethod === 'historical' && Object.keys(currentMix).length > 0)
  );
  const isStep3Valid = forecastParams.totalOrders && parseInt(forecastParams.totalOrders) > 0;

  const steps = [
    { 
      number: 1, 
      title: 'Packaging Types', 
      description: 'Upload your packaging specifications',
      isValid: isStep1Valid,
      isComplete: isStep1Valid && currentStep > 1
    },
    { 
      number: 2, 
      title: 'Usage Method', 
      description: 'Choose how to set usage rates',
      isValid: isStep2Valid,
      isComplete: isStep2Valid && currentStep > 2
    },
    { 
      number: 3, 
      title: 'Forecast Parameters', 
      description: 'Set forecast details and calculate',
      isValid: isStep3Valid,
      isComplete: results.length > 0
    }
  ];

  // File upload handler for packaging types
  const handlePackagingTypesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());

        // Find the actual header row by looking for expected column names
        let headerRowIndex = -1;
        let delimiter = ',';
        let headers: string[] = [];

        // Check first 5 lines to find the header row
        for (let i = 0; i < Math.min(5, lines.length); i++) {
          const line = lines[i];
          // Auto-detect delimiter
          const testDelimiter = line.includes('\t') ? '\t' :
                               line.includes(';') ? ';' : ',';

          const testHeaders = line.toLowerCase().split(testDelimiter).map(h => h.trim());

          // Check if this line contains expected header keywords
          const hasPackageType = testHeaders.some(h =>
            ['package type', 'packaging', 'type', 'name', 'package'].includes(h) ||
            h.includes('package') || h.includes('type')
          );

          const hasOtherHeaders = testHeaders.some(h =>
            ['length', 'width', 'height', 'cost', 'weight', 'l', 'w', 'h'].includes(h) ||
            h.includes('length') || h.includes('width') || h.includes('height')
          );

          if (hasPackageType || hasOtherHeaders) {
            headerRowIndex = i;
            delimiter = testDelimiter;
            headers = testHeaders;
            break;
          }
        }

        if (headerRowIndex === -1) {
          toast.error('Could not find header row with expected column names');
          return;
        }

        const nameIndex = headers.findIndex(h => ['package type', 'packaging', 'type', 'name', 'package'].includes(h) || h.includes('package'));
        const lengthIndex = headers.findIndex(h => ['length', 'l', 'len'].includes(h) || h.includes('length'));
        const widthIndex = headers.findIndex(h => ['width', 'w', 'wid'].includes(h) || h.includes('width'));
        const heightIndex = headers.findIndex(h => ['height', 'h', 'depth', 'hgt'].includes(h) || h.includes('height'));
        const costIndex = headers.findIndex(h => ['cost', 'price', '$', 'unit cost'].includes(h) || h.includes('cost'));
        const weightIndex = headers.findIndex(h => ['weight', 'wt', 'lbs', 'pounds'].includes(h) || h.includes('weight'));

        if (nameIndex === -1) {
          toast.error('Package Type column not found in header row');
          return;
        }

        const types: PackagingType[] = [];
        // Start processing from the row after the header
        for (let i = headerRowIndex + 1; i < lines.length; i++) {
          const values = lines[i].split(delimiter).map(v => v.trim());

          // Skip empty rows
          if (!values[nameIndex] || values[nameIndex] === '') continue;

          const type: PackagingType = {
            name: values[nameIndex] || `Package ${types.length + 1}`,
            length: lengthIndex !== -1 ? parseFloat(values[lengthIndex]) || 0 : 0,
            width: widthIndex !== -1 ? parseFloat(values[widthIndex]) || 0 : 0,
            height: heightIndex !== -1 ? parseFloat(values[heightIndex]) || 0 : 0,
            cost: costIndex !== -1 ? parseFloat(values[costIndex]) || 0 : 0,
            weight: weightIndex !== -1 ? parseFloat(values[weightIndex]) || 0 : 0,
          };
          types.push(type);
        }

        if (types.length === 0) {
          toast.error('No valid packaging data found in the file');
          return;
        }

        setPackagingTypes(types);

        // Store in Convex
        storePackagingTypes({ packagingTypes: types })
          .then(() => {
            toast.success(`Loaded ${types.length} packaging types`);
          })
          .catch((error) => {
            console.error('Failed to store packaging types:', error);
            toast.error('Failed to save packaging types to database');
          });
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  // Handle quarterly data upload
  const handleQuarterlyUpload = (quarter: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log(`No file selected for ${quarter}`);
      return;
    }

    console.log(`Processing ${file.name} for ${quarter}`);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());

        // Find the actual header row by looking for expected column names
        let headerRowIndex = -1;
        let delimiter = ',';
        let headers: string[] = [];

        // Check first 5 lines to find the header row
        for (let i = 0; i < Math.min(5, lines.length); i++) {
          const line = lines[i];
          // Auto-detect delimiter
          const testDelimiter = line.includes('\t') ? '\t' :
                               line.includes(';') ? ';' : ',';

          const testHeaders = line.toLowerCase().split(testDelimiter).map(h => h.trim());

          // Check if this line contains expected header keywords for quarterly data
          const hasPackageType = testHeaders.some(h =>
            ['package type', 'packaging', 'type', 'name', 'package id', 'packaging name', 'package name', 'package'].includes(h) ||
            h.includes('package') || h.includes('packaging')
          );

          const hasQuantity = testHeaders.some(h =>
            ['quantity', 'qty', 'amount', 'count', 'used', 'usage amount', 'usage count'].includes(h) ||
            h.includes('quantity') || h.includes('qty') || h.includes('used') ||
            h.includes('usage') || h.includes('amount') || h.includes('count')
          );

          if (hasPackageType || hasQuantity) {
            headerRowIndex = i;
            delimiter = testDelimiter;
            headers = testHeaders;
            break;
          }
        }

        if (headerRowIndex === -1) {
          toast.error('Could not find header row with expected column names for quarterly data');
          return;
        }

        const typeIndex = headers.findIndex(h =>
          ['package type', 'packaging', 'type', 'name', 'package id', 'packaging name', 'package name'].includes(h) ||
          h.includes('package') || h.includes('packaging')
        );
        const qtyIndex = headers.findIndex(h =>
          ['quantity', 'qty', 'amount', 'count', 'used', 'usage amount', 'usage count'].includes(h) ||
          h.includes('quantity') || h.includes('qty') || h.includes('used') ||
          h.includes('usage') || h.includes('amount') || h.includes('count')
        );

        if (typeIndex === -1 || qtyIndex === -1) {
          console.log('Available columns:', headers);
          toast.error(`Required columns not found. Found: ${headers.join(', ')}`);
          return;
        }

        const newQuarterData: QuarterData[] = [];
        // Start processing from the row after the header
        for (let i = headerRowIndex + 1; i < lines.length; i++) {
          const values = lines[i].split(delimiter).map(v => v.trim());

          // Skip empty rows
          if (!values[typeIndex] || values[typeIndex] === '') continue;

          newQuarterData.push({
            quarter,
            packageType: values[typeIndex],
            quantity: parseFloat(values[qtyIndex]) || 0
          });
        }

        if (newQuarterData.length === 0) {
          toast.error('No valid quarterly data found in the file');
          return;
        }

        // Remove existing data for this quarter and add new data
        const filteredData = quarterlyData.filter(d => d.quarter !== quarter);
        const updatedData = [...filteredData, ...newQuarterData];
        setQuarterlyData(updatedData);

        // Store in Convex
        storeQuarterlyData({ quarter, usageData: newQuarterData })
          .then(() => {
            // Recalculate mix percentages
            updateMixFromQuarterlyData(updatedData);
            toast.success(`${quarter} data uploaded successfully`);

            // Clear the file input to allow re-uploading
            if (event.target) {
              event.target.value = '';
            }
          })
          .catch((error) => {
            console.error('Failed to store quarterly data:', error);
            toast.error('Failed to save quarterly data to database');
          });
      } catch (error) {
        toast.error('Failed to parse quarterly data');
      }
    };
    reader.readAsText(file);
  };

  // Update mix percentages from quarterly data
  const updateMixFromQuarterlyData = (data: QuarterData[]) => {
    const totals: { [key: string]: number } = {};
    let grandTotal = 0;

    // Sum quantities by package type
    data.forEach(item => {
      totals[item.packageType] = (totals[item.packageType] || 0) + item.quantity;
      grandTotal += item.quantity;
    });

    // Calculate percentages
    const newMix: { [key: string]: number } = {};
    Object.keys(totals).forEach(packageType => {
      newMix[packageType] = (totals[packageType] / grandTotal) * 100;
    });

    setCurrentMix(newMix);
  };

  // Handle manual percentage changes
  const updateManualPercentage = (packageType: string, percentage: number) => {
    const updated = manualMix.filter(m => m.packageType !== packageType);
    if (percentage > 0) {
      updated.push({ packageType, percentage });
    }
    setManualMix(updated);
  };

  // Handle manual quantity changes
  const updateManualQuantity = (packageType: string, quantity: number) => {
    const updated = manualQuantities.filter(q => q.packageType !== packageType);
    if (quantity > 0) {
      updated.push({ packageType, quantity });
    }
    setManualQuantities(updated);
    
    // Convert quantities to percentages for validation and display
    convertQuantitiesToPercentages(updated);
  };

  // Convert quantities to percentages
  const convertQuantitiesToPercentages = (quantities: ManualQuantity[]) => {
    if (quantities.length === 0) {
      setManualMix([]);
      return;
    }

    const totalQuantity = quantities.reduce((sum, q) => sum + q.quantity, 0);
    if (totalQuantity === 0) {
      setManualMix([]);
      return;
    }

    const percentages: ManualMix[] = quantities.map(q => ({
      packageType: q.packageType,
      percentage: (q.quantity / totalQuantity) * 100
    }));

    setManualMix(percentages);
  };

  // Handle quarter name editing
  const updateQuarterName = (index: number, newName: string) => {
    const updatedNames = [...quarterNames];
    updatedNames[index] = newName.trim() || `Q${index + 1}`;
    setQuarterNames(updatedNames);
    
    // Update any existing quarterly data with the new name
    const oldName = quarterNames[index];
    if (oldName && quarterlyData.some(d => d.quarter === oldName)) {
      const updatedData = quarterlyData.map(d => 
        d.quarter === oldName ? { ...d, quarter: updatedNames[index] } : d
      );
      setQuarterlyData(updatedData);
    }
  };

  // Add a new quarter
  const addQuarter = () => {
    const newIndex = quarterNames.length;
    const newQuarterName = `Q${newIndex + 1}`;
    setQuarterNames([...quarterNames, newQuarterName]);
  };

  // Remove a quarter
  const removeQuarter = (index: number) => {
    if (quarterNames.length <= 1) {
      toast.error('You need at least one quarter');
      return;
    }

    const quarterToRemove = quarterNames[index];
    
    // Remove the quarter name
    const updatedNames = quarterNames.filter((_, i) => i !== index);
    setQuarterNames(updatedNames);
    
    // Remove any data associated with this quarter
    const updatedData = quarterlyData.filter(d => d.quarter !== quarterToRemove);
    setQuarterlyData(updatedData);
    
    // Recalculate mix if there's remaining data
    if (updatedData.length > 0) {
      updateMixFromQuarterlyData(updatedData);
    } else {
      setCurrentMix({});
    }
    
    toast.success(`Removed ${quarterToRemove} and its data`);
  };

  // Handle manual packaging type entry
  const addManualPackageType = async () => {
    if (!newPackageType.name.trim()) {
      toast.error('Package name is required');
      return;
    }

    const typeToAdd = {
      ...newPackageType,
      name: newPackageType.name.trim()
    };

    const updatedTypes = [...packagingTypes, typeToAdd];
    setPackagingTypes(updatedTypes);

    // Store in Convex
    try {
      await storePackagingTypes({ packagingTypes: updatedTypes });
      toast.success('Package type added successfully');
      
      // Reset form
      setNewPackageType({
        name: '',
        length: 0,
        width: 0,
        height: 0,
        cost: 0,
        weight: 0
      });
    } catch (error) {
      console.error('Failed to store packaging type:', error);
      toast.error('Failed to save package type');
    }
  };

  const removePackageType = async (index: number) => {
    const updatedTypes = packagingTypes.filter((_, i) => i !== index);
    setPackagingTypes(updatedTypes);

    try {
      await storePackagingTypes({ packagingTypes: updatedTypes });
      toast.success('Package type removed');
    } catch (error) {
      console.error('Failed to update packaging types:', error);
      toast.error('Failed to remove package type');
    }
  };

  // Export demand forecast results to CSV
  const exportResults = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    // Create CSV content
    const headers = [
      'Package Type',
      'Usage %',
      'Base Quantity',
      'Final Quantity',
      'Estimated Cost',
      'Estimated Weight'
    ];

    const csvRows = [
      headers.join(','),
      ...results.map(result => [
        `"${result.packageType}"`,
        result.usagePercentage.toFixed(1),
        result.baseQuantity,
        result.finalQuantity,
        result.estimatedCost.toFixed(2),
        result.estimatedWeight.toFixed(1)
      ].join(','))
    ];

    // Add totals row
    const totalUnits = results.reduce((sum, r) => sum + r.finalQuantity, 0);
    const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);
    const totalWeight = results.reduce((sum, r) => sum + r.estimatedWeight, 0);

    csvRows.push(''); // Empty row
    csvRows.push([
      'TOTALS',
      '',
      '',
      totalUnits,
      totalCost.toFixed(2),
      totalWeight.toFixed(1)
    ].join(','));

    const csvContent = csvRows.join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `demand-forecast-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Demand forecast exported successfully');
  };

  // Reset all data for testing
  const resetAllData = async () => {
    try {
      const result = await clearAllData({});
      
      // Clear local state
      setPackagingTypes([]);
      setQuarterlyData([]);
      setManualMix([]);
      setCurrentMix({});
      setResults([]);
      setSelectedMethod(null);
      setCurrentStep(1);
      
      toast.success(`All data cleared! Removed ${result.cleared} database records.`);
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast.error('Failed to clear database data');
    }
  };

  // Calculate demand forecast
  const handleCalculateDemand = async () => {
    if (!isStep3Valid) return;

    setIsProcessing(true);

    try {
      const result = await checkAndConsumeToken('demand_planner', async () => {
        const totalOrders = parseInt(forecastParams.totalOrders);
        const safetyBuffer = parseFloat(forecastParams.safetyBuffer);

        // Prepare manual mix if using manual method
        const manualMixData = selectedMethod === 'manual' ? manualMix : undefined;

        const response = await calculateDemand({
          method: selectedMethod!,
          forecastParams: {
            totalOrders,
            safetyBuffer
          },
          manualMix: manualMixData
        });

        return response;
      });

      if (result.success && result.result) {
        setResults(result.result.results);
        toast.success('Demand forecast calculated successfully');
      } else if (result.error === 'NO_TOKENS') {
        toast.error('No tokens remaining. Please upgrade your plan.');
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Failed to calculate demand:', error);
      toast.error('Failed to calculate demand forecast');
      setIsProcessing(false);
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
                ? 'border-blue-500 bg-blue-500 text-white'
                : step.isComplete
                  ? 'border-green-500 bg-green-500 text-white'
                  : step.isValid
                    ? 'border-blue-300 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-gray-50 text-gray-400'
            }`}>
              {step.isComplete ? <Check className="h-5 w-5" /> : step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 transition-all ${
                step.isComplete ? 'bg-green-500' : 'bg-gray-300'
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Data Entry Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setDataEntryMode('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dataEntryMode === 'upload' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="h-4 w-4 mr-2 inline" />
            Upload CSV
          </button>
          <button
            onClick={() => setDataEntryMode('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dataEntryMode === 'manual' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Manual Entry
          </button>
        </div>
      </div>

      {dataEntryMode === 'upload' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Required CSV Format</h3>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Your CSV should include: Package Type, Length (inches), Width (inches), Height (inches), Cost ($), Weight (lbs)
            </p>
            <div className="bg-white rounded border border-blue-200 overflow-hidden">
              <table className="text-xs font-mono w-full">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    <td className="px-3 py-2 text-blue-900">Package Type</td>
                    <td className="px-2 py-2 text-blue-900">Length</td>
                    <td className="px-2 py-2 text-blue-900">Width</td>
                    <td className="px-2 py-2 text-blue-900">Height</td>
                    <td className="px-2 py-2 text-blue-900">Cost</td>
                    <td className="px-2 py-2 text-blue-900">Weight</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  <tr>
                    <td className="px-3 py-1.5 text-gray-700">Small Box</td>
                    <td className="px-2 py-1.5 text-gray-700">12</td>
                    <td className="px-2 py-1.5 text-gray-700">8</td>
                    <td className="px-2 py-1.5 text-gray-700">6</td>
                    <td className="px-2 py-1.5 text-gray-700">1.25</td>
                    <td className="px-2 py-1.5 text-gray-700">0.5</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 text-gray-700">Medium Box</td>
                    <td className="px-2 py-1.5 text-gray-700">16</td>
                    <td className="px-2 py-1.5 text-gray-700">12</td>
                    <td className="px-2 py-1.5 text-gray-700">8</td>
                    <td className="px-2 py-1.5 text-gray-700">2.15</td>
                    <td className="px-2 py-1.5 text-gray-700">0.8</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 text-gray-700">Large Box</td>
                    <td className="px-2 py-1.5 text-gray-700">20</td>
                    <td className="px-2 py-1.5 text-gray-700">16</td>
                    <td className="px-2 py-1.5 text-gray-700">12</td>
                    <td className="px-2 py-1.5 text-gray-700">3.45</td>
                    <td className="px-2 py-1.5 text-gray-700">1.2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <label className="cursor-pointer block">
              <span className="text-lg font-medium text-gray-700 block mb-2">
                Upload Packaging Types CSV
              </span>
              <span className="text-sm text-gray-500 block mb-4">
                Click to browse or drag and drop your file
              </span>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handlePackagingTypesUpload}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </span>
            </label>
          </div>
        </>
      )}

      {dataEntryMode === 'manual' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Packaging Type Manually</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3">
              <Label htmlFor="packageName" className="text-gray-700 font-medium">
                Package Name *
              </Label>
              <Input
                id="packageName"
                type="text"
                value={newPackageType.name}
                onChange={(e) => setNewPackageType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Small Box"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="length" className="text-gray-700 font-medium">
                Length (inches)
              </Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                min="0"
                value={newPackageType.length === 0 ? '' : newPackageType.length}
                onChange={(e) => setNewPackageType(prev => ({ ...prev, length: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="width" className="text-gray-700 font-medium">
                Width (inches)
              </Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                min="0"
                value={newPackageType.width === 0 ? '' : newPackageType.width}
                onChange={(e) => setNewPackageType(prev => ({ ...prev, width: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="height" className="text-gray-700 font-medium">
                Height (inches)
              </Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0"
                value={newPackageType.height === 0 ? '' : newPackageType.height}
                onChange={(e) => setNewPackageType(prev => ({ ...prev, height: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="cost" className="text-gray-700 font-medium">
                Cost ($)
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={newPackageType.cost === 0 ? '' : newPackageType.cost}
                onChange={(e) => setNewPackageType(prev => ({ ...prev, cost: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="weight" className="text-gray-700 font-medium">
                Weight (lbs)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={newPackageType.weight === 0 ? '' : newPackageType.weight}
                onChange={(e) => setNewPackageType(prev => ({ ...prev, weight: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                placeholder="0.0"
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            onClick={addManualPackageType}
            disabled={!newPackageType.name.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package Type
          </Button>
        </div>
      )}

      {packagingTypes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-900">
              Loaded Packaging Types ({packagingTypes.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {packagingTypes.map((type, index) => (
              <div key={index} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-500">
                    {type.length}"×{type.width}"×{type.height}" • ${type.cost} • {type.weight}lbs
                  </p>
                </div>
                {dataEntryMode === 'manual' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePackageType(index)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          How would you like to set usage rates?
        </h3>
        <p className="text-gray-600">
          Choose the method that works best for your business
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Historical Tracking Method */}
        <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
          selectedMethod === 'historical' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`} onClick={() => setSelectedMethod('historical')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedMethod === 'historical' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <History className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Historical Tracking</h4>
                <p className="text-sm text-gray-600">Build mix from quarterly data</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${
              selectedMethod === 'historical' 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'historical' && (
                <Check className="h-3 w-3 text-white m-0.5" />
              )}
            </div>
          </div>
          
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li>• Upload usage data for any time periods</li>
            <li>• Automatically calculate percentages</li>
            <li>• Mix updates as you add periods</li>
            <li>• More accurate over time</li>
          </ul>

          {selectedMethod === 'historical' && (
            <div className="space-y-4 mt-6 border-t pt-4">
              {/* Quarter Management Header */}
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-gray-900">Periods</h5>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addQuarter}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Period
                </Button>
              </div>
              
              {/* CSV Format Button */}
              <div className="mb-3">
                <button
                  onClick={() => setShowUsageFormatInfo(!showUsageFormatInfo)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors"
                >
                  {showUsageFormatInfo ? 'Hide CSV Format' : 'Show CSV Format'}
                </button>
              </div>

              {/* CSV Format Info (collapsible) */}
              {showUsageFormatInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <h5 className="text-sm font-medium text-blue-900">Required CSV Format for Usage Data</h5>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    Your CSV should include: Package Name and either Usage Count/Quantity OR Percentage
                  </p>
                  
                  <div className="bg-white rounded border border-blue-200 overflow-hidden max-w-md">
                    <table className="text-xs font-mono w-full">
                      <thead className="bg-blue-50 border-b border-blue-100">
                        <tr>
                          <td className="px-3 py-1.5 text-blue-900 font-medium">Package Name</td>
                          <td className="px-3 py-1.5 text-blue-900 font-medium">Usage Count</td>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50">
                        <tr>
                          <td className="px-3 py-1 text-gray-700">Small</td>
                          <td className="px-3 py-1 text-gray-700">30000</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1 text-gray-700">Medium</td>
                          <td className="px-3 py-1 text-gray-700">55000</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1 text-gray-700">Large</td>
                          <td className="px-3 py-1 text-gray-700">20000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="text-xs text-blue-700 mt-2">
                    <strong>Or use percentages:</strong> Replace "Usage Count" column with "Percentage" (e.g., 28.6%, 52.4%, 19.0%)
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {quarterNames.map((quarter, index) => {
                  const isUploaded = quarterlyData.some(d => d.quarter === quarter);
                  const quarterCount = quarterlyData.filter(d => d.quarter === quarter).length;
                  
                  return (
                    <div key={index} className={`border rounded-lg p-3 relative ${isUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                      {/* Remove Button */}
                      {quarterNames.length > 1 && (
                        <button
                          onClick={() => removeQuarter(index)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove this period"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      
                      <div className="flex items-center justify-between mb-2 pr-6">
                        {editingQuarter === index ? (
                          <Input
                            type="text"
                            value={quarter}
                            onChange={(e) => updateQuarterName(index, e.target.value)}
                            onBlur={() => setEditingQuarter(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingQuarter(null);
                              }
                            }}
                            className="h-6 px-2 text-sm font-medium text-gray-900 w-20"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => setEditingQuarter(index)}
                            title="Click to edit"
                          >
                            {quarter}
                          </span>
                        )}
                        {isUploaded && (
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-green-600">{quarterCount} items</span>
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <div className={`border border-dashed rounded p-2 text-center transition-colors ${
                          isUploaded 
                            ? 'border-green-300 hover:border-green-400 bg-green-25' 
                            : 'border-gray-300 hover:border-blue-400'
                        }`}>
                          <Upload className={`h-4 w-4 mx-auto mb-1 ${isUploaded ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className={`text-xs ${isUploaded ? 'text-green-600' : 'text-gray-500'}`}>
                            {isUploaded ? 'Re-upload CSV' : 'Upload CSV'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={(e) => handleQuarterlyUpload(quarter, e)}
                          className="hidden"
                          key={`${quarter}-upload`}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              {Object.keys(currentMix).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Current Mix</h5>
                  <div className="space-y-2">
                    {Object.entries(currentMix).map(([type, percentage]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{type}</span>
                        <span className="font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Percentage Method */}
        <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
          selectedMethod === 'manual' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`} onClick={() => setSelectedMethod('manual')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedMethod === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Manual Input</h4>
                <p className="text-sm text-gray-600">Set percentages or quantities</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${
              selectedMethod === 'manual' 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'manual' && (
                <Check className="h-3 w-3 text-white m-0.5" />
              )}
            </div>
          </div>
          
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li>• Input percentages or quantities directly</li>
            <li>• Auto-calculates percentages from quantities</li>
            <li>• Perfect for established processes</li>
            <li>• Easy to update and modify</li>
          </ul>

          {selectedMethod === 'manual' && (
            <div className="space-y-4 mt-6 border-t pt-4">
              {/* Input Mode Toggle */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-1 rounded-lg flex">
                  <button
                    onClick={() => setManualInputMode('percentage')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      manualInputMode === 'percentage' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Percent className="h-4 w-4 mr-1 inline" />
                    Percentages
                  </button>
                  <button
                    onClick={() => setManualInputMode('quantity')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      manualInputMode === 'quantity' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Hash className="h-4 w-4 mr-1 inline" />
                    Quantities
                  </button>
                </div>
              </div>

              {manualInputMode === 'percentage' && (
                <div className="space-y-3">
                  {packagingTypes.map((type) => {
                    const currentValue = manualMix.find(m => m.packageType === type.name)?.percentage || 0;
                    return (
                      <div key={type.name} className="flex items-center gap-3">
                        <Label className="min-w-0 flex-1 text-sm font-medium text-gray-700">
                          {type.name}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentValue === 0 ? '' : currentValue}
                            onChange={(e) => updateManualPercentage(type.name, e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                            className="w-20 text-right"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {manualInputMode === 'quantity' && (
                <div className="space-y-3">
                  {packagingTypes.map((type) => {
                    const currentValue = manualQuantities.find(q => q.packageType === type.name)?.quantity || 0;
                    return (
                      <div key={type.name} className="flex items-center gap-3">
                        <Label className="min-w-0 flex-1 text-sm font-medium text-gray-700">
                          {type.name}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={currentValue === 0 ? '' : currentValue}
                            onChange={(e) => updateManualQuantity(type.name, e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                            className="w-24 text-right"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500">units</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {manualMix.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {manualInputMode === 'quantity' ? 'Calculated Mix:' : 'Total:'}
                    </span>
                    {manualInputMode === 'percentage' && (
                      <span className={`font-semibold ${
                        manualMix.reduce((sum, m) => sum + m.percentage, 0) === 100 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`}>
                        {manualMix.reduce((sum, m) => sum + m.percentage, 0).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  
                  {manualInputMode === 'quantity' && (
                    <div className="space-y-1 mb-2">
                      {manualMix.map((mix) => (
                        <div key={mix.packageType} className="flex justify-between text-xs">
                          <span className="text-gray-600">{mix.packageType}:</span>
                          <span className="font-medium">{mix.percentage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {manualInputMode === 'quantity' && manualQuantities.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      Total: {manualQuantities.reduce((sum, q) => sum + q.quantity, 0).toLocaleString()} units
                    </div>
                  )}
                  
                  {manualInputMode === 'percentage' && manualMix.reduce((sum, m) => sum + m.percentage, 0) !== 100 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Total should equal 100% for accurate forecasting
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Parameters</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="totalOrders" className="text-gray-700 font-medium">
              Total Forecasted Orders
            </Label>
            <Input
              id="totalOrders"
              type="number"
              min="1"
              value={forecastParams.totalOrders}
              onChange={(e) => setForecastParams(prev => ({ ...prev, totalOrders: e.target.value }))}
              placeholder="e.g., 10000"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total number of orders expected for the forecast period
            </p>
          </div>

          <div>
            <Label htmlFor="safetyBuffer" className="text-gray-700 font-medium">
              Safety Buffer (%)
            </Label>
            <Input
              id="safetyBuffer"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={forecastParams.safetyBuffer}
              onChange={(e) => setForecastParams(prev => ({ ...prev, safetyBuffer: e.target.value }))}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Additional buffer to account for demand variability
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={handleCalculateDemand}
            disabled={!isStep3Valid || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Calculating Demand...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Demand Forecast
              </>
            )}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Demand Forecast Results</h3>
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Weight
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{result.packageType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.usagePercentage.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.baseQuantity.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{result.finalQuantity.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${result.estimatedCost.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.estimatedWeight.toFixed(1)} lbs</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {results.reduce((sum, r) => sum + r.finalQuantity, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Total Units</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  ${results.reduce((sum, r) => sum + r.estimatedCost, 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Total Cost</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {results.reduce((sum, r) => sum + r.estimatedWeight, 0).toFixed(1)} lbs
                </div>
                <div className="text-xs text-gray-500">Total Weight</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNavigation = () => (
    <div className="flex justify-between items-center mt-8">
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

      <Button
        onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
        disabled={!steps[currentStep - 1].isValid || currentStep === steps.length}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Show placeholder when help modal is open */}
        {showHelpModal && (
          <div className="text-center py-20">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Demand Planner</h2>
            <p className="text-gray-600">Please read the manual to get started</p>
          </div>
        )}
        
        {/* Show stepped interface when help modal is closed */}
        {!showHelpModal && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 relative">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllData}
              className="absolute top-6 right-6 text-red-600 border-red-300 hover:bg-red-50"
            >
              Reset All Data
            </Button>
            {renderStepHeader()}
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            {renderNavigation()}
          </div>
        )}
      </div>
      
      <ProductManual
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        productName="Demand Planner"
        productIcon={<TrendingUp className="h-5 w-5 text-white" />}
        sections={[
          {
            title: "INPUTS",
            icon: "📥",
            items: [
              "Packaging Types CSV with dimensions, costs, and weights",
              "Alternative: Manual package entry with all specifications",
              "Historical usage data by time periods (quarterly/monthly data)",
              "Optional: Manual percentage or quantity-based mix configuration"
            ]
          },
          {
            title: "OUTPUTS",
            icon: "📤", 
            items: [
              "Demand forecast by package type with quantities needed",
              "Cost analysis and budget planning for packaging inventory", 
              "Weight calculations for logistics and shipping planning",
              "Safety buffer calculations to prevent stockouts"
            ]
          },
          {
            title: "HOW IT WORKS",
            icon: "🎯",
            items: [
              "1. Upload packaging types or enter specifications manually",
              "2. Choose between historical tracking or manual usage mix",
              "3. Set forecast parameters (total orders, safety buffer)",
              "4. Generate demand forecast with quantities and costs"
            ]
          }
        ]}
      />
    </div>
  );
};