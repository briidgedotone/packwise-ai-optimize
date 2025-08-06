import React, { useMemo } from 'react';
import { CheckCircle, AlertCircle, XCircle, Download } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { validateCSVStructure, generateCSVTemplate } from '@/lib/data/csvParser';

interface CSVValidatorProps {
  csvContent: string;
  expectedType: 'orders' | 'usage_log' | 'catalog';
  onTemplateDownload?: (type: 'orders' | 'usage_log' | 'catalog') => void;
}

export const CSVValidator: React.FC<CSVValidatorProps> = ({
  csvContent,
  expectedType,
  onTemplateDownload
}) => {
  const validation = useMemo(() => {
    if (!csvContent.trim()) {
      return null;
    }
    return validateCSVStructure(csvContent, expectedType);
  }, [csvContent, expectedType]);

  const downloadTemplate = () => {
    const template = generateCSVTemplate(expectedType);
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${expectedType}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (onTemplateDownload) {
      onTemplateDownload(expectedType);
    }
  };

  if (!validation) {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Need help with CSV format?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Download our template to see the expected column structure
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>
      </div>
    );
  }

  const { isValid, issues, suggestions, detectedColumns, missingColumns } = validation;

  return (
    <div className="mt-4 space-y-4">
      {/* Validation Status */}
      <div className={`p-4 rounded-lg border ${
        isValid 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <h4 className={`font-medium ${
            isValid ? 'text-green-900' : 'text-red-900'
          }`}>
            {isValid ? 'CSV Format Valid' : 'CSV Format Issues Found'}
          </h4>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-red-800 mb-2">Issues:</p>
            <ul className="space-y-1">
              {issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-red-800 mb-2">Suggestions:</p>
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">💡</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Template Download for Invalid CSV */}
        {!isValid && (
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Correct Template
          </Button>
        )}
      </div>

      {/* Column Detection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detected Columns */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-3">Detected Columns</h5>
          <div className="flex flex-wrap gap-2">
            {detectedColumns.length > 0 ? (
              detectedColumns.map((column) => (
                <Badge key={column} variant="secondary" className="bg-green-100 text-green-800">
                  {column}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">No columns detected</span>
            )}
          </div>
        </div>

        {/* Missing Columns */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-3">Missing Columns</h5>
          <div className="flex flex-wrap gap-2">
            {missingColumns.length > 0 ? (
              missingColumns.map((column) => (
                <Badge key={column} variant="destructive" className="bg-red-100 text-red-800">
                  {column}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                All required columns present
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Expected Columns Reference */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Expected Column Names</h5>
        <div className="text-sm text-blue-700">
          {expectedType === 'orders' && (
            <p>
              <strong>Required:</strong> order_id, sku, product_name, quantity<br />
              <strong>Optional:</strong> date, length, width, height, weight, value, category, customer_id
            </p>
          )}
          {expectedType === 'usage_log' && (
            <p>
              <strong>Required:</strong> date, package_type, quantity<br />
              <strong>Optional:</strong> total_orders, percentage, cost_per_unit
            </p>
          )}
          {expectedType === 'catalog' && (
            <p>
              <strong>Required:</strong> sku, name<br />
              <strong>Optional:</strong> description, category, length, width, height, weight
            </p>
          )}
        </div>
      </div>
    </div>
  );
};