import React, { useState, useEffect } from 'react';
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
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
  Settings as SettingsIcon,
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
  Sparkles,
  Upload
} from 'lucide-react';
import { PackagingSuiteAnalyzerBackend } from '@/components/PackagingSuiteAnalyzerBackend';
import { SpecGenerator } from '@/components/SpecGenerator';
import { PackagingDemandPlanner } from '@/components/PackagingDemandPlanner';
import { PDPAnalyzer } from '@/components/PDPAnalyzer';
import { AIAssistant } from '@/components/AIAssistant';
import { Reports } from '@/pages/Reports';
import Settings from '@/pages/Settings';
import { MonthlyChart, PackagingChart, EfficiencyChart } from '@/components/charts';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Dashboard = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userDropdownOpen && !target.closest('[data-user-dropdown]')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

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
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
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
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">

              {/* Enhanced Metrics Cards with Trends */}
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-600">Total Savings</h3>
                    </div>
                    {dashboardMetrics?.totalSavingsTrend && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">{dashboardMetrics.totalSavingsTrend}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {dashboardMetrics?.totalSavings ? `$${Math.round(dashboardMetrics.totalSavings).toLocaleString()}` : '$0'}
                    </p>
                    <p className="text-sm text-gray-500">vs last month</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-600">Efficiency Score</h3>
                    </div>
                    {dashboardMetrics?.efficiencyTrend && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
                        <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">{dashboardMetrics.efficiencyTrend}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {dashboardMetrics?.efficiencyScore ? `${dashboardMetrics.efficiencyScore.toFixed(1)}%` : '0%'}
                    </p>
                    <p className="text-sm text-gray-500">Packaging optimization</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Hash className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-600">Products Analyzed</h3>
                    </div>
                    {dashboardMetrics?.productsAnalyzedTrend && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full">
                        <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700">{dashboardMetrics.productsAnalyzedTrend}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {dashboardMetrics?.productsAnalyzed ? dashboardMetrics.productsAnalyzed.toLocaleString() : '0'}
                    </p>
                    <p className="text-sm text-gray-500">This month</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-orange-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-600">Active Projects</h3>
                    </div>
                    {dashboardMetrics?.activeProjectsTrend && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 rounded-full">
                        <TrendingUp className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-700">{dashboardMetrics.activeProjectsTrend}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {dashboardMetrics?.activeProjects || '0'}
                    </p>
                    <p className="text-sm text-gray-500">In progress</p>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Recent Activity & Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-16 border-gray-200 hover:bg-gray-50 justify-start"
                        onClick={() => setActiveTab('suite-analyzer-backend')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">New Analysis</div>
                            <div className="text-sm text-gray-500">Suite Analyzer</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 border-gray-200 hover:bg-gray-50 justify-start"
                        onClick={() => setActiveTab('spec-generator')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Generate Specs</div>
                            <div className="text-sm text-gray-500">AI-Powered</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 border-gray-200 hover:bg-gray-50 justify-start"
                        onClick={() => setActiveTab('demand-planner')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Plan Demand</div>
                            <div className="text-sm text-gray-500">Forecasting</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 border-gray-200 hover:bg-gray-50 justify-start"
                        onClick={() => setActiveTab('pdp-analyzer')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                            <Eye className="h-5 w-5 text-pink-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Analyze Design</div>
                            <div className="text-sm text-gray-500">Visual AI</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        View All
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {recentActivity && recentActivity.length > 0 ? recentActivity.slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {activity.type}
                          </div>
                        </div>
                      )) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                              <Activity className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No recent activity</p>
                            <p className="text-xs text-gray-400 mt-1">Your activity will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Insights & Tools */}
                <div className="space-y-6">
                  {/* Tool Usage Stats */}
                  <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Tool Usage</h3>
                    </div>
                    {toolUsageStats && toolUsageStats.length > 0 && toolUsageStats.some((stat: any) => stat.count > 0) ? (
                      <div className="space-y-4">
                        {toolUsageStats.map((stat: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                <Package className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-sm text-gray-700">{stat.toolName}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{stat.count}</div>
                              <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <BarChart3 className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">No tool usage yet</p>
                          <p className="text-xs text-gray-400 mt-1">Start using tools to see statistics</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Files */}
                  <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                          <FolderOpen className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {recentFiles && recentFiles.length > 0 ? recentFiles.slice(0, 4).map((file: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.timestamp}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      )) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                              <FolderOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No recent files</p>
                            <p className="text-xs text-gray-400 mt-1">Uploaded files will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Smart Insights - Full Width */}
              <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Smart Insights</h3>
                </div>
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">No insights available yet</p>
                    <p className="text-xs text-gray-400">Insights will appear after you perform analyses</p>
                  </div>
                </div>
              </div>
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

            {/* User Profile Section */}
            <div className="relative" data-user-dropdown>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.firstName?.[0] || user?.fullName?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.fullName || user?.firstName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-gray-200 shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <SettingsIcon className="h-4 w-4 text-gray-400" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <LogOut className="h-4 w-4 text-gray-400" />
                    Logout
                  </button>
                </div>
              )}
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