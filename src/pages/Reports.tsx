import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ReportViewer } from '@/components/ReportViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Package,
  Calculator,
  TrendingUp,
  BarChart3,
  FileDown,
  Calendar,
  Timer,
  Activity,
} from 'lucide-react';

export const Reports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteReportId, setDeleteReportId] = useState<Id<'analyses'> | null>(null);
  const [viewReportId, setViewReportId] = useState<Id<'analyses'> | null>(null);

  // Fetch reports
  const reports = useQuery(api.reports.getUserReports);
  const stats = useQuery(api.reports.getReportStats);
  const deleteReport = useMutation(api.reports.deleteReport);

  // Get icon for report type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suite_analyzer':
        return Package;
      case 'spec_generator':
        return Calculator;
      case 'demand_planner':
        return TrendingUp;
      case 'pdp_analyzer':
        return Eye;
      default:
        return FileText;
    }
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];

    return reports.filter((report) => {
      // Search filter
      if (searchQuery && !report.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && report.type !== selectedType) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && report.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [reports, searchQuery, selectedType, selectedStatus]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteReportId) return;

    try {
      await deleteReport({ reportId: deleteReportId });
      toast.success('Report deleted successfully');
      setDeleteReportId(null);
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!reports || !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage all your analysis reports
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg">
              <Activity className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">
                {stats.total} Total Reports
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-gray-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Processing</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.processing}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Failed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.failed}</p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reports.filter(r => {
                      const date = new Date(r.createdAt);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-gray-100 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="suite_analyzer">Suite Analysis</SelectItem>
                  <SelectItem value="spec_generator">Spec Generator</SelectItem>
                  <SelectItem value="demand_planner">Demand Planner</SelectItem>
                  <SelectItem value="pdp_analyzer">Design Analyzer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card className="border-gray-100 bg-white shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-sm text-gray-500">
                  {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Run an analysis to generate your first report'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => {
              const TypeIcon = getTypeIcon(report.type);
              return (
                <Card key={report._id} className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 bg-${report.typeColor}-50 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className={`h-5 w-5 text-${report.typeColor}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{report.typeDisplay}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {report.status === 'completed' && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                              {report.status === 'processing' && (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Clock className="h-3 w-3 mr-1 animate-pulse" />
                                  Processing
                                </Badge>
                              )}
                              {report.status === 'failed' && (
                                <Badge className="bg-red-50 text-red-700 border-red-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                            </div>
                          </div>

                          {report.resultSummary && (
                            <p className="text-sm text-gray-600 mb-3">{report.resultSummary}</p>
                          )}

                          {report.error && (
                            <p className="text-sm text-red-600 mb-3">{report.error}</p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(report.createdAt)}
                            </div>
                            {report.duration && (
                              <div className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {formatDuration(report.duration)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {report.status === 'completed' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => setViewReportId(report._id)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileDown className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export CSV
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeleteReportId(report._id)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteReportId} onOpenChange={() => setDeleteReportId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this report? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Report Viewer Modal */}
        <ReportViewer
          reportId={viewReportId}
          isOpen={!!viewReportId}
          onClose={() => setViewReportId(null)}
        />
      </div>
    </div>
  );
};