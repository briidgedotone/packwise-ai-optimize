
import React, { useState, useEffect } from 'react';
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  BarChart3, 
  Calculator, 
  Eye, 
  TrendingUp, 
  DollarSign, 
  Recycle, 
  FileText,
  MessageSquare,
  Menu,
  X,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Home,
  Users,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  Calendar,
  Plus,
  ChevronDown,
  MoreHorizontal,
  ArrowRight,
  Target,
  Activity,
  Zap,
  Award,
  TrendingDown,
  Info,
  FolderOpen,
  PlayCircle,
  RefreshCw,
  BookOpen,
  Lightbulb,
  ChevronRight,
  ArrowUpRight,
  Timer,
  Hash,
  History,
  Save,
  Star,
  Percent,
  TrendingDown as TrendingDownIcon,
  Brain,
  Smartphone,
  Filter,
  Copy,
  ExternalLink,
  Gift,
  Shield,
  Sparkles
} from 'lucide-react';
import { PackagingSuiteAnalyzerBackend } from '@/components/PackagingSuiteAnalyzerBackend';
import { SpecGenerator } from '@/components/SpecGenerator';
import { PackagingDemandPlanner } from '@/components/PackagingDemandPlanner';
import { PDPAnalyzer } from '@/components/PDPAnalyzer';
import { AIAssistant } from '@/components/AIAssistant';
import { Reports } from '@/pages/Reports';
import { MonthlyChart, PackagingChart, EfficiencyChart } from '@/components/charts';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Dashboard = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // Convex queries for real data
  const dashboardMetrics = useQuery(api.dashboard.getDashboardMetrics);
  const recentActivity = useQuery(api.dashboard.getRecentActivity);
  const toolUsageStats = useQuery(api.dashboard.getToolUsageStats);
  const recentFiles = useQuery(api.dashboard.getRecentFiles);

  // Listen for custom tab change events (from PDP results navigation)
  useEffect(() => {
    const handleSetActiveTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('setActiveTab', handleSetActiveTab as EventListener);
    
    return () => {
      window.removeEventListener('setActiveTab', handleSetActiveTab as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'suite-analyzer-backend', label: 'Suite Analyzer', icon: Package },
    { id: 'spec-generator', label: 'Spec Generator', icon: Calculator },
    { id: 'demand-planner', label: 'Demand Planner', icon: TrendingUp },
    { id: 'pdp-analyzer', label: 'Design Analyzer', icon: Eye },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'suite-analyzer-backend':
        return <PackagingSuiteAnalyzerBackend />;
      case 'spec-generator':
        return <SpecGenerator />;
      case 'demand-planner':
        return <PackagingDemandPlanner />;
      case 'pdp-analyzer':
        return <PDPAnalyzer />;
      case 'reports':
        return <Reports />;
      default:
        return (
          <div className="space-y-6">
            {/* Enhanced Metrics Grid with Real Business Value */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Savings Achieved */}
              <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      12.3%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      ${dashboardMetrics?.totalSavings ? Math.round(dashboardMetrics.totalSavings).toLocaleString() : '0'}
                    </h3>
                    <p className="text-xs text-gray-500">Total Savings Achieved</p>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-emerald-500 rounded-full transition-all duration-1000`} style={{ width: `${Math.min((dashboardMetrics?.totalSavings || 0) / 200000 * 100, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">YTD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Packaging Efficiency Score */}
              <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      <Award className="h-3 w-3 mr-1" />
                      A+
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics?.efficiencyScore ? dashboardMetrics.efficiencyScore.toFixed(1) : '0.0'}%
                    </h3>
                    <p className="text-xs text-gray-500">Efficiency Score</p>
                    <div className="flex items-center gap-1 pt-2">
                      <span className="text-xs text-gray-400">vs industry avg:</span>
                      <span className="text-xs font-medium text-emerald-600">
                        +{dashboardMetrics?.efficiencyScore ? Math.max(0, dashboardMetrics.efficiencyScore - 65).toFixed(0) : '0'}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Analyzed */}
              <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Hash className="h-5 w-5 text-white" />
                    </div>
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                      <Activity className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics?.productsAnalyzed ? dashboardMetrics.productsAnalyzed.toLocaleString() : '0'}
                    </h3>
                    <p className="text-xs text-gray-500">Products Analyzed</p>
                    <div className="flex items-center gap-1 pt-2">
                      <span className="text-xs text-gray-400">This month:</span>
                      <span className="text-xs font-medium text-purple-600">
                        +{dashboardMetrics?.thisMonthAnalyses || '0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Projects */}
              <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics?.activeProjects || '0'}
                    </h3>
                    <p className="text-xs text-gray-500">Active Projects</p>
                    <div className="flex items-center gap-1 pt-2">
                      <span className="text-xs text-emerald-600">
                        {dashboardMetrics?.totalAnalyses || '0'} total analyses
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Hub */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              {/* Quick Launch */}
              <Card className="border-gray-100 bg-white shadow-sm lg:col-span-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      Quick Actions
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Frequently Used
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300 group"
                      onClick={() => setActiveTab('suite-analyzer-backend')}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-sm text-gray-900">Analyze New Suite</p>
                          <p className="text-xs text-gray-500 mt-0.5">Upload CSV for optimization</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 hover:bg-purple-50 hover:border-purple-300 group"
                      onClick={() => setActiveTab('spec-generator')}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Calculator className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-sm text-gray-900">Generate Specs</p>
                          <p className="text-xs text-gray-500 mt-0.5">Quick L×W×H estimation</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 hover:bg-pink-50 hover:border-pink-300 group"
                      onClick={() => setActiveTab('pdp-analyzer')}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                          <Eye className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-sm text-gray-900">Analyze Design</p>
                          <p className="text-xs text-gray-500 mt-0.5">Score packaging visuals</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-pink-600 transition-colors" />
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 hover:bg-indigo-50 hover:border-indigo-300 group"
                      onClick={() => setActiveTab('reports')}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <FileText className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-sm text-gray-900">View Reports</p>
                          <p className="text-xs text-gray-500 mt-0.5">Access all analyses</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Recommendations */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Review Q4 Packaging</p>
                        <p className="text-xs text-gray-600 mt-0.5">15 SKUs haven't been analyzed in 90+ days</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Optimization Found</p>
                        <p className="text-xs text-gray-600 mt-0.5">Potential $12K savings in beverage line</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <RefreshCw className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Update Forecasts</p>
                        <p className="text-xs text-gray-600 mt-0.5">Run demand planner for holiday season</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Files & ROI Calculator */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Recent Files & Templates */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <History className="h-5 w-5 text-green-500" />
                    Recent Files & Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Recent Uploads
                    </h4>
                    {(recentFiles || []).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.tool} • {file.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {file.size ? `${Math.round(file.size / 1024)}KB` : 'File'}
                          </Badge>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <Save className="h-4 w-4" />
                      Saved Templates
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Beverage Dims', type: 'Spec Template' },
                        { name: 'Cosmetics Mix', type: 'Suite Config' },
                      ].map((template, index) => (
                        <Button key={index} variant="outline" size="sm" className="justify-start h-auto p-2 text-xs">
                          <Star className="h-3 w-3 mr-2 text-yellow-500" />
                          <div className="text-left">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-gray-500">{template.type}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ROI Calculator */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-purple-500" />
                    ROI Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-700 mb-1">
                          {dashboardMetrics?.totalSavings && dashboardMetrics.totalSavings > 0 
                            ? Math.round((dashboardMetrics.totalSavings / 4475) * 100).toLocaleString() + '%'
                            : '0%'
                          }
                        </div>
                        <p className="text-sm text-purple-600">Platform ROI</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">
                          ${dashboardMetrics?.totalSavings ? Math.round(dashboardMetrics.totalSavings).toLocaleString() : '0'}
                        </div>
                        <p className="text-xs text-green-600">Total Savings</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">$4,475</div>
                        <p className="text-xs text-blue-600">Platform Cost (YTD)</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payback Period</span>
                        <span className="font-medium text-gray-900">2.1 weeks</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monthly Savings Rate</span>
                        <span className="font-medium text-green-600">
                          ${dashboardMetrics?.totalSavings ? Math.round(dashboardMetrics.totalSavings / 6).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Projected Annual ROI</span>
                        <span className="font-medium text-purple-600">4,200%</span>
                      </div>
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Export ROI Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Global Search & Mobile Executive Summary */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              {/* Global Search */}
              <Card className="border-gray-100 bg-white shadow-sm lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Search className="h-5 w-5 text-indigo-500" />
                    Smart Search & Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search analyses, reports, files... (e.g., 'beverage savings >20%')"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700">
                        Search
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="text-xs text-gray-500 mr-2">Quick filters:</div>
                      {[
                        { label: 'High Savings (>20%)', icon: TrendingUp, color: 'green' },
                        { label: 'Recent (Last 7 days)', icon: Clock, color: 'blue' },
                        { label: 'Beverage Category', icon: Filter, color: 'orange' },
                        { label: 'Design Score >85', icon: Award, color: 'purple' },
                      ].map((filter, index) => (
                        <Button key={index} variant="outline" size="sm" className="h-auto px-2 py-1 text-xs">
                          <filter.icon className={`h-3 w-3 mr-1 text-${filter.color}-600`} />
                          {filter.label}
                        </Button>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h4>
                      <div className="space-y-1">
                        {[
                          'beverage cost reduction Q4',
                          'cosmetics packaging efficiency',
                          'holiday season demand forecast'
                        ].map((search, index) => (
                          <button key={index} className="block text-xs text-gray-600 hover:text-indigo-600 transition-colors">
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Executive Summary */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-pink-500" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Packaging Health</h3>
                      <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-2xl font-bold mb-1">Excellent</div>
                    <p className="text-xs text-green-100">
                      {dashboardMetrics?.efficiencyScore ? dashboardMetrics.efficiencyScore.toFixed(1) : '0.0'}% efficiency • 
                      ${dashboardMetrics?.totalSavings ? Math.round(dashboardMetrics.totalSavings / 1000) : '0'}K saved
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-700">
                        {dashboardMetrics?.activeProjects || '0'}
                      </div>
                      <p className="text-xs text-blue-600">Active Projects</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-purple-700">
                        {dashboardMetrics?.productsAnalyzed 
                          ? dashboardMetrics.productsAnalyzed > 1000 
                            ? (dashboardMetrics.productsAnalyzed / 1000).toFixed(1) + 'K'
                            : dashboardMetrics.productsAnalyzed.toString()
                          : '0'
                        }
                      </div>
                      <p className="text-xs text-purple-600">Products Analyzed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-auto p-2 text-xs">
                        <Package className="h-3 w-3 mr-1" />
                        New Analysis
                      </Button>
                      <Button variant="outline" size="sm" className="h-auto p-2 text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        Export Report
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share with Team
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Educational Content & Scheduled Analyses */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Educational Content */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-teal-500" />
                    Packaging Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-teal-900 mb-1">Today's Tip</h4>
                        <p className="text-sm text-teal-700">Beverage packaging with 15-20% void space typically reduces shipping costs by 8-12% while maintaining product protection.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Recommended Reading</h4>
                    {[
                      { title: 'Q4 Packaging Optimization Guide', category: 'Best Practices', readTime: '5 min' },
                      { title: 'Design Psychology for CPG Brands', category: 'Case Study', readTime: '8 min' },
                      { title: 'Sustainable Packaging ROI Calculator', category: 'Tool Guide', readTime: '3 min' },
                    ].map((article, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{article.title}</p>
                            <p className="text-xs text-gray-500">{article.category} • {article.readTime}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Feature Spotlight</span>
                    </div>
                    <p className="text-xs text-amber-700">Try the new batch comparison feature in Design Analyzer to evaluate multiple SKUs simultaneously.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Analyses */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    Scheduled Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { 
                        title: 'Monthly Beverage Suite Review', 
                        type: 'Suite Analyzer', 
                        schedule: 'Every 1st Monday', 
                        next: 'Dec 2, 2024',
                        status: 'active'
                      },
                      { 
                        title: 'Quarterly Design Audit', 
                        type: 'Design Analyzer', 
                        schedule: 'Every Quarter', 
                        next: 'Jan 15, 2025',
                        status: 'active'
                      },
                      { 
                        title: 'Holiday Demand Forecast', 
                        type: 'Demand Planner', 
                        schedule: 'Seasonal', 
                        next: 'Feb 1, 2025',
                        status: 'paused'
                      },
                    ].map((schedule, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{schedule.title}</h4>
                          <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {schedule.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>{schedule.type} • {schedule.schedule}</p>
                          <p>Next run: {schedule.next}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Analysis
                  </Button>

                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-800">Automation Benefits</span>
                    </div>
                    <ul className="text-xs text-indigo-700 space-y-1">
                      <li>• Never miss critical packaging reviews</li>
                      <li>• Automatic trend detection and alerts</li>
                      <li>• Consistent optimization tracking</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Section */}
            <Card className="border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg font-medium text-gray-900">Performance</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs border-gray-200 text-gray-600 hidden sm:flex">
                      01-07 May
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <MonthlyChart />
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Packaging Distribution */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-lg font-medium text-gray-900">Packaging Distribution</CardTitle>
                  <CardDescription className="text-gray-500">
                    Current packaging type usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <PackagingChart />
                  </div>
                </CardContent>
              </Card>

              {/* Efficiency Improvements */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-lg font-medium text-gray-900">Efficiency Improvements</CardTitle>
                  <CardDescription className="text-gray-500">
                    Performance comparison before and after QuantiPackAI implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <EfficiencyChart />
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Core Features Grid */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Core Features</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {[
                  {
                    id: 'suite-analyzer-backend',
                    title: 'Packaging Suite Analyzer',
                    description: 'Optimize your packaging mix and identify cost savings',
                    icon: Package,
                    status: 'Ready',
                    color: 'blue',
                  },
                  {
                    id: 'spec-generator',
                    title: 'Spec Generator',
                    description: 'Generate realistic packaging specs from product descriptions',
                    icon: Calculator,
                    status: 'Ready',
                    color: 'purple',
                  },
                  {
                    id: 'demand-planner',
                    title: 'Packaging Demand Planner',
                    description: 'Calculate exact packaging quantities needed',
                    icon: TrendingUp,
                    status: 'Ready',
                    color: 'orange',
                  },
                  {
                    id: 'pdp-analyzer',
                    title: 'Design Analyzer',
                    description: 'Score and improve your product display panels',
                    icon: Eye,
                    status: 'Ready',
                    color: 'purple',
                  },
                ].map((feature) => (
                  <Card key={feature.id} className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`h-10 w-10 bg-${feature.color}-50 rounded-lg flex items-center justify-center group-hover:bg-${feature.color}-100 transition-colors`}>
                          <feature.icon className={`h-5 w-5 text-${feature.color}-600`} />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          {feature.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-medium text-gray-900">{feature.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-500 mt-1">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                        onClick={() => setActiveTab(feature.id)}
                      >
                        Launch Tool
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Activity Dashboard */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              {/* Recent Activity Timeline */}
              <Card className="border-gray-100 bg-white shadow-sm lg:col-span-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Activity Timeline
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(recentActivity || []).map((activity, index) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'suite': return Package;
                          case 'spec': return Calculator;
                          case 'pdp': return Eye;
                          case 'demand': return TrendingUp;
                          default: return Package;
                        }
                      };

                      const getActivityColor = (type: string) => {
                        switch (type) {
                          case 'suite': return 'blue';
                          case 'spec': return 'purple';
                          case 'pdp': return 'pink';
                          case 'demand': return 'orange';
                          default: return 'gray';
                        }
                      };

                      const ActivityIcon = getActivityIcon(activity.type);
                      const color = getActivityColor(activity.type);

                      return (
                      <div key={index} className="flex gap-4 group cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-${color}-200 transition-colors`}>
                          <ActivityIcon className={`h-5 w-5 text-${color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">{activity.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {activity.value}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Tool Usage Stats */}
              <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                    Tool Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(toolUsageStats || []).map((tool, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{tool.name}</span>
                        <span className="text-xs text-gray-500">{tool.count} uses</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${tool.color}-500 rounded-full transition-all duration-500`}
                          style={{ width: `${tool.usage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total analyses this month</span>
                      <span className="font-semibold text-gray-900">{dashboardMetrics?.thisMonthAnalyses || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-medium text-gray-900">QuantiPackAI</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-64 h-full bg-white border-r border-gray-100 transition-transform duration-200 ease-in-out`}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base sm:text-lg font-medium text-gray-900">QuantiPackAI</h1>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start text-left h-9 sm:h-10 text-sm sm:text-base ${
                    activeTab === item.id 
                      ? "bg-gray-100 text-gray-900 font-medium" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 space-y-4">
            {/* Upgrade Card */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">Upgrade to Pro</h4>
              <p className="text-xs text-blue-700 mb-3">
                Get 1 month free and unlock advanced features
              </p>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                Upgrade
              </Button>
            </div>

            {/* Help Links */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm h-8"
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                Help & Information
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm h-8"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Log out
              </Button>
            </div>
          </div>

        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-white">
          {/* Top Header - Only show on dashboard */}
          {activeTab === 'overview' && (
            <div className="border-b border-gray-100 bg-white px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-medium text-gray-900">
                    Hello, {user?.firstName || user?.username || 'User'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Track your packaging optimization progress here. You almost reach a goal!</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                  <div className="w-8 h-8 bg-gray-100 rounded-full hidden sm:flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="relative">
                    <div className="w-2 h-2 bg-orange-500 rounded-full absolute top-1 right-1 z-10"></div>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8",
                          userButtonPopoverCard: "shadow-lg border border-gray-200",
                          userButtonPopoverActionButton: "text-gray-700 hover:bg-gray-100",
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={activeTab === 'overview' ? 'p-4 sm:p-6' : 'p-0'}>
            {renderContent()}
          </div>
        </div>

        {/* Floating AI Assistant Button */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
          <Button
            onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>

        {/* Universal AI Assistant */}
        <AIAssistant 
          isOpen={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
          currentFeature={activeTab}
        />
      </div>
    </div>
  );
};

export default Dashboard;
