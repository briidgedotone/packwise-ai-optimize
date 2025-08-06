/**
 * CUIN Calculation Demo Component
 * 
 * Demonstrates the CUIN calculation module functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Info
} from 'lucide-react';

import {
  calculateCUINWithValidation,
  calculateVolumeInUnits,
  findOptimalContainer,
  formatCUIN,
  formatDimensions,
  type Dimensions,
  type LengthUnit
} from '@/lib/calculations/cuin';

import {
  findBestPackageForItem,
  analyzeOrderPacking,
  STANDARD_PACKAGES,
  type OrderItem,
  type PackageType
} from '@/lib/calculations/packaging';

import {
  generateSmartRecommendations,
  calculateRecommendationImpact,
  generateExecutiveSummary,
  type SmartRecommendation
} from '@/lib/calculations/recommendations';

const CUINDemo: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    length: 10,
    width: 8,
    height: 6,
    unit: 'in' as LengthUnit
  });

  const [result, setResult] = useState<any>(null);
  const [packagingResult, setPackagingResult] = useState<any>(null);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
  const [itemWeight, setItemWeight] = useState(2);

  // Calculate CUIN whenever dimensions change
  useEffect(() => {
    const cuinResult = calculateCUINWithValidation(dimensions);
    const volumes = calculateVolumeInUnits(dimensions);
    
    // Find optimal container
    const sampleContainers: Dimensions[] = STANDARD_PACKAGES.map(pkg => pkg.dimensions);
    const containerResult = findOptimalContainer(dimensions, sampleContainers);

    setResult({
      cuin: cuinResult,
      volumes,
      container: containerResult
    });

    // Test packaging analysis
    const sampleItem: OrderItem = {
      id: '1',
      name: 'Sample Item',
      dimensions,
      weight: itemWeight,
      quantity: 1
    };

    const packingAnalysis = findBestPackageForItem(sampleItem);
    setPackagingResult(packingAnalysis);

    // Generate smart recommendations
    if (packingAnalysis) {
      const recommendations = generateSmartRecommendations(packingAnalysis, sampleItem);
      setSmartRecommendations(recommendations);
    } else {
      setSmartRecommendations([]);
    }

  }, [dimensions, itemWeight]);

  const updateDimension = (field: keyof Dimensions, value: string | LengthUnit) => {
    setDimensions(prev => ({
      ...prev,
      [field]: field === 'unit' ? value : parseFloat(value) || 0
    }));
  };

  const demoScenarios = [
    { name: 'Small Item', length: 4, width: 3, height: 2, unit: 'in' as LengthUnit },
    { name: 'Medium Box', length: 12, width: 10, height: 8, unit: 'in' as LengthUnit },
    { name: 'Large Package', length: 20, width: 16, height: 12, unit: 'in' as LengthUnit },
    { name: 'Metric Example', length: 30, width: 20, height: 15, unit: 'cm' as LengthUnit },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CUIN Calculation Demo</h1>
        <p className="text-gray-600">Test the packaging volume calculation engine</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dimension Input
          </CardTitle>
          <CardDescription>
            Enter dimensions to calculate volume and find optimal packaging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                value={dimensions.length}
                onChange={(e) => updateDimension('length', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                value={dimensions.width}
                onChange={(e) => updateDimension('width', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={dimensions.height}
                onChange={(e) => updateDimension('height', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={dimensions.unit} onValueChange={(value) => updateDimension('unit', value as LengthUnit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Inches</SelectItem>
                  <SelectItem value="ft">Feet</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                  <SelectItem value="mm">Millimeters</SelectItem>
                  <SelectItem value="m">Meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Weight Input */}
          <div className="mt-4">
            <Label htmlFor="weight">Item Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={itemWeight}
              onChange={(e) => setItemWeight(parseFloat(e.target.value) || 0)}
              className="w-32"
            />
            <p className="text-xs text-gray-500 mt-1">Used for dimensional weight comparison</p>
          </div>

          {/* Quick Demo Scenarios */}
          <div className="flex flex-wrap gap-2">
            <Label className="text-sm text-gray-600 w-full">Quick Examples:</Label>
            {demoScenarios.map((scenario, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setDimensions(scenario)}
              >
                {scenario.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* CUIN Calculation Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Volume Calculations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Validation Status */}
              {result.cuin.isValid ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Dimensions are valid for packaging calculations
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {result.cuin.warnings.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Dimension Display */}
              <div>
                <Label className="text-sm font-medium">Dimensions</Label>
                <p className="text-lg font-mono">{formatDimensions(dimensions)}</p>
              </div>

              {/* Volume Results */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Volume</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Cubic Inches:</span>
                    <Badge variant="secondary" className="ml-2">
                      {formatCUIN(result.volumes.cuin)}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Cubic Feet:</span>
                    <Badge variant="secondary" className="ml-2">
                      {result.volumes.cuft.toFixed(3)} cu ft
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Liters:</span>
                    <Badge variant="secondary" className="ml-2">
                      {result.volumes.liters.toFixed(2)} L
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Milliliters:</span>
                    <Badge variant="secondary" className="ml-2">
                      {result.volumes.ml.toFixed(0)} ml
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {result.cuin.warnings.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {result.cuin.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Packaging Optimization Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Packaging Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {packagingResult ? (
                <>
                  {/* Best Package */}
                  <div>
                    <Label className="text-sm font-medium">Recommended Package</Label>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">{packagingResult.packageType.name}</p>
                      <p className="text-sm text-blue-700">
                        {formatDimensions(packagingResult.packageType.dimensions)}
                      </p>
                    </div>
                  </div>

                  {/* Efficiency Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Fill Rate</Label>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={packagingResult.fillRate > 70 ? "default" : packagingResult.fillRate > 40 ? "secondary" : "destructive"}
                        >
                          {packagingResult.fillRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Efficiency Score</Label>
                      <Badge variant="outline">
                        {packagingResult.efficiency.toFixed(1)}%
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Package Cost</Label>
                      <Badge variant="outline">
                        ${packagingResult.packageType.cost.toFixed(2)}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Dim Weight</Label>
                      <Badge variant="outline">
                        {packagingResult.dimensionalWeight.toFixed(2)} lbs
                      </Badge>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {packagingResult.recommendations.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Recommendations</Label>
                      <ul className="mt-2 space-y-1">
                        {packagingResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No suitable packaging found for these dimensions
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Recommendations Section */}
      {smartRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered optimization suggestions with business impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {smartRecommendations.map((rec) => (
              <div 
                key={rec.id}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'critical' 
                    ? 'border-red-500 bg-red-50' 
                    : rec.priority === 'high'
                    ? 'border-orange-500 bg-orange-50'
                    : rec.priority === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {rec.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <Badge 
                        variant={rec.priority === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.businessImpact} impact
                      </Badge>
                      {rec.estimatedSavings && rec.estimatedSavings > 0 && (
                        <Badge variant="secondary" className="text-xs text-green-700">
                          ${rec.estimatedSavings.toFixed(2)} savings
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specific Actions */}
                {rec.specificActions && rec.specificActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Recommended Actions:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {rec.specificActions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {/* Business Impact Summary */}
            {smartRecommendations.some(rec => rec.estimatedSavings) && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">💰 Potential Monthly Impact</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Per Shipment Savings:</span>
                    <span className="ml-2 font-medium">
                      ${smartRecommendations.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Monthly (100 shipments):</span>
                    <span className="ml-2 font-medium">
                      ${(smartRecommendations.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0) * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Packages Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available Standard Packages</CardTitle>
          <CardDescription>
            Standard packaging options used for optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {STANDARD_PACKAGES.slice(0, 9).map((pkg) => (
              <div key={pkg.id} className="p-3 border rounded-lg">
                <p className="font-medium text-sm">{pkg.name}</p>
                <p className="text-xs text-gray-600">{formatDimensions(pkg.dimensions)}</p>
                <div className="flex justify-between items-center mt-1">
                  <Badge variant="outline" className="text-xs">
                    {pkg.category}
                  </Badge>
                  <span className="text-xs text-gray-500">${pkg.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CUINDemo;