import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Download,
  FileDown,
  CheckCircle,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Calculator,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  Info,
} from 'lucide-react';

interface ReportViewerProps {
  reportId: Id<'analyses'> | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ reportId, isOpen, onClose }) => {
  const report = useQuery(
    api.reports.getReport,
    reportId ? { reportId } : 'skip'
  );

  if (!isOpen || !reportId) return null;

  const renderReportContent = () => {
    if (!report) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (report.status === 'processing') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis in Progress</h3>
          <p className="text-sm text-gray-500">This report is still being generated. Please check back later.</p>
        </div>
      );
    }

    if (report.status === 'failed') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
          <p className="text-sm text-gray-500 mb-2">An error occurred during analysis:</p>
          <p className="text-sm text-red-600">{report.error || 'Unknown error'}</p>
        </div>
      );
    }

    // Render based on report type
    switch (report.type) {
      case 'suite_analyzer':
        return renderSuiteAnalyzerReport(report.results);
      case 'spec_generator':
        return renderSpecGeneratorReport(report.results);
      case 'demand_planner':
        return renderDemandPlannerReport(report.results);
      case 'pdp_analyzer':
        return renderDesignAnalyzerReport(report.results);
      default:
        return renderGenericReport(report.results);
    }
  };

  const renderSuiteAnalyzerReport = (results: Record<string, unknown>) => {
    if (!results) return null;

    return (
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600">
                    ${results.costSavings?.amount?.toLocaleString() || '0'}
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-700">
                    {results.costSavings?.percentage || '0'}% reduction
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Products Analyzed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {results.totalProducts || '0'}
                  </span>
                  <span className="text-sm text-gray-500">unique SKUs</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {results.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{results.summary}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {results.optimizedMix && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Optimized Package Mix</CardTitle>
                <CardDescription>Recommended packaging configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(results.optimizedMix as Record<string, number>).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-sm text-gray-600">{count} units</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Key Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(results.recommendations as string[])?.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                )) || (
                  <li className="text-sm text-gray-500">No recommendations available</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };

  const renderSpecGeneratorReport = (results: Record<string, unknown>) => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Generated Specifications</CardTitle>
            <CardDescription>AI-generated product specifications</CardDescription>
          </CardHeader>
          <CardContent>
            {(results.specifications as Array<Record<string, string>>)?.map((spec, index: number) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">{spec.name || `Specification ${index + 1}`}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {spec.dimensions && <p>Dimensions: {spec.dimensions}</p>}
                  {spec.material && <p>Material: {spec.material}</p>}
                  {spec.weight && <p>Weight: {spec.weight}</p>}
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500">No specifications generated</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDemandPlannerReport = (results: Record<string, unknown>) => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Demand Forecast</CardTitle>
            <CardDescription>Predicted packaging requirements</CardDescription>
          </CardHeader>
          <CardContent>
            {(results.forecast as Array<{packageType: string; quantity: number; estimatedCost: number}>)?.map((item, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-medium">{item.packageType}</span>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.quantity} units</p>
                  <p className="text-xs text-gray-500">${item.estimatedCost}</p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500">No forecast data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDesignAnalyzerReport = (results: Record<string, unknown>) => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Design Analysis Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-purple-600">
                {(results.score as number) || 0}/100
              </div>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${(results.score as number) || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {results.improvements && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Suggested Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(results.improvements as string[]).map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderGenericReport = (results: Record<string, unknown>) => {
    if (!results) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Report Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{report?.name || 'Report Details'}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            {report && (
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                  {report.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  Created: {new Date(report.createdAt).toLocaleDateString()}
                </span>
                {report.completedAt && (
                  <span className="text-xs text-gray-500">
                    Completed: {new Date(report.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {renderReportContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};