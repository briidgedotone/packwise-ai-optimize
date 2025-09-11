import React, { useState, useEffect } from 'react';
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import { 
  Package, 
  BarChart3, 
  Eye, 
  TrendingUp, 
  FileText,
  MessageSquare,
  Menu,
  X,
  AlertCircle,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  MoreHorizontal,
  ArrowRight,
  Activity,
  Zap,
  FolderOpen,
  RefreshCw,
  Lightbulb,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { PackagingSuiteAnalyzerBackend } from '@/components/PackagingSuiteAnalyzerBackend';
import { SpecGenerator } from '@/components/SpecGenerator';
import { PackagingDemandPlanner } from '@/components/PackagingDemandPlanner';
import { PDPAnalyzer } from '@/components/PDPAnalyzer';
import { AIAssistant } from '@/components/AIAssistant';
import { Reports } from '@/pages/Reports';
import Settings from '@/pages/Settings';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Dashboard = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Backend availability state - now available with new Convex account
  const [isBackendUnavailable, setIsBackendUnavailable] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Function to test backend availability
  const testBackendConnection = async () => {
    setIsCheckingBackend(true);
    try {
      // If we get here without error, backend might be available
      // We'll set it as available and let the queries try
      setIsBackendUnavailable(false);
      
      // Refresh the page to reload with queries
      window.location.reload();
      
    } catch (error) {
      console.log('Backend still unavailable:', error);
      setIsBackendUnavailable(true);
      toast.error('Backend is still unavailable. Please try cleaning up data or upgrading your plan.');
    } finally {
      setIsCheckingBackend(false);
    }
  };

  // Fetch data from Convex backend
  const dashboardMetrics = useQuery(api.dashboard.getDashboardMetrics);
  const recentActivity = useQuery(api.dashboard.getRecentActivity);
  const toolUsageStats = useQuery(api.dashboard.getToolUsageStats);
  const recentFiles = useQuery(api.dashboard.getRecentFiles);

  // Fallback data when backend is unavailable
  const fallbackMetrics = {
    tokensUsed: 0,
    tokensLimit: 10,
    tokensRemaining: 10,
  };

  const fallbackActivity = [];
  const fallbackToolStats = [];
  const fallbackFiles = [];

  // Use fallback data when backend is unavailable  
  const safeMetrics = isBackendUnavailable || !dashboardMetrics ? fallbackMetrics : dashboardMetrics;
  const safeActivity = isBackendUnavailable || !recentActivity ? fallbackActivity : recentActivity;
  const safeToolStats = isBackendUnavailable || !toolUsageStats ? fallbackToolStats : toolUsageStats;
  const safeFiles = isBackendUnavailable || !recentFiles ? fallbackFiles : recentFiles;

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

  // Auto-redirect to dashboard if on a disabled feature
  useEffect(() => {
    if (isBackendUnavailable && ['suite-analyzer-backend', 'spec-generator', 'demand-planner-v2', 'pdp-analyzer'].includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [isBackendUnavailable, activeTab]);

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'suite-analyzer-backend', label: 'Suite Analyzer', icon: Package },
    { id: 'spec-generator', label: 'Spec Generator', icon: Sparkles },
    { id: 'demand-planner-v2', label: 'Demand Planner', icon: TrendingUp },
    { id: 'pdp-analyzer', label: 'Design Analyzer', icon: Eye },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Get current page info
  const getCurrentPageInfo = () => {
    const currentItem = menuItems.find(item => item.id === activeTab);
    return {
      title: currentItem?.label || 'Dashboard',
      icon: currentItem?.icon || BarChart3
    };
  };

  // Render header component
  const renderHeader = () => {
    return (
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 mb-6" style={{ height: '65px' }}>
        <div className="flex items-center justify-end h-full">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
                userButtonPopoverCard: "rounded-xl",
                userButtonPopoverActionButton: "rounded-lg",
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // If backend is unavailable, redirect to settings for cleanup or show offline message
    if (isBackendUnavailable && ['suite-analyzer-backend', 'spec-generator', 'demand-planner-v2', 'pdp-analyzer'].includes(activeTab)) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Feature Temporarily Unavailable</h3>
            <p className="text-gray-600 mb-6">
              This feature requires backend connectivity. Please clean up data or upgrade your plan to restore functionality.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setActiveTab('settings')}>
                Clean Up Data
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://dashboard.convex.dev', '_blank')}
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'suite-analyzer-backend':
        return <PackagingSuiteAnalyzerBackend />;
      case 'spec-generator':
        return <SpecGenerator />;
      case 'demand-planner-v2':
        return <PackagingDemandPlanner />;
      case 'pdp-analyzer':
        return <PDPAnalyzer />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="min-h-screen" style={{ backgroundColor: '#F9FBFC' }}>
            <div>
              
              {/* Backend Unavailable Warning */}
              {isBackendUnavailable && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">Backend Deployments Disabled</h3>
                      <p className="text-sm text-red-800 mb-4">
                        Convex free plan limits exceeded. All backend functions are disabled until limits are restored.
                        The application is running in offline mode with limited functionality.
                      </p>
                      <div className="bg-red-100 border border-red-200 rounded-2xl p-4 mb-4">
                        <p className="text-xs text-red-800">
                          <strong>⚠️ Important:</strong> Data cleanup functions cannot work when backend is disabled. 
                          The only solution is to <strong>upgrade to Convex Pro plan ($25/month)</strong> to restore full functionality and enable data cleanup.
                        </p>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('settings')}
                          className="rounded-full" style={{ backgroundColor: designSystem.colors.error, color: 'white' }}
                        >
                          Clean Up Data
                        </Button>
                        <Button
                          size="sm"
                          onClick={testBackendConnection}
                          disabled={isCheckingBackend}
                          variant="outline"
                          className="rounded-full border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {isCheckingBackend ? 'Testing...' : 'Test Connection'}
                          <RefreshCw className={`w-3 h-3 ml-1 ${isCheckingBackend ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('https://dashboard.convex.dev', '_blank')}
                          className="rounded-full border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Upgrade Plan
                          <ExternalLink className="w-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                
                {/* Key Metrics Cards */}
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-3xl border border-gray-200 p-6 transition-all duration-200 h-full flex flex-col">
                    <div className="mb-4">
                      <h2 className="text-sm font-medium text-gray-900">Token Usage</h2>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-semibold text-gray-900">
                              {safeMetrics?.tokensUsed || '0'}
                            </span>
                            <span className="text-lg text-gray-500">
                              / {safeMetrics?.tokensLimit || '10'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Tokens Used</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                          <Zap className="h-6 w-6" style={{ color: designSystem.colors.primary }} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Available</span>
                          <span className="font-medium text-gray-700">
                            {safeMetrics?.tokensRemaining || safeMetrics?.tokensLimit || '10'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300" style={{ backgroundColor: designSystem.colors.primary }} 
                            style={{ 
                              width: `${Math.min(100, ((safeMetrics?.tokensUsed || 0) / (safeMetrics?.tokensLimit || 10)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions - Modern Card Design */}
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-3xl border border-gray-200 p-6 transition-all duration-200">
                    <div className="mb-4">
                      <h2 className="text-sm font-medium text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-auto p-4 border border-gray-200 hover:opacity-90 justify-start group transition-all duration-150 rounded-3xl"
                        onClick={() => setActiveTab('suite-analyzer-backend')}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                            <Package className="h-5 w-5" style={{ color: designSystem.colors.primary }} />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Suite Analyzer</div>
                            <div className="text-xs text-gray-500">Optimize packaging</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 border border-gray-200 hover:opacity-90 justify-start group transition-all duration-150 rounded-3xl"
                        onClick={() => setActiveTab('demand-planner-v2')}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                            <TrendingUp className="h-5 w-5" style={{ color: designSystem.colors.primary }} />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Demand Planner</div>
                            <div className="text-xs text-gray-500">Forecast needs</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 border border-gray-200 hover:opacity-90 justify-start group transition-all duration-150 rounded-3xl"
                        onClick={() => setActiveTab('spec-generator')}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                            <Sparkles className="h-5 w-5 text-gray-700" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Spec Generator</div>
                            <div className="text-xs text-gray-500">AI specifications</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 border border-gray-200 hover:opacity-90 justify-start group transition-all duration-150 rounded-3xl"
                        onClick={() => setActiveTab('pdp-analyzer')}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                            <Eye className="h-5 w-5 text-gray-700" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Design Analyzer</div>
                            <div className="text-xs text-gray-500">Visual analysis</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics and Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                
                {/* Tool Usage Stats - Enhanced */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Tool Analytics</h3>
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                  </div>
                  {safeToolStats && safeToolStats.length > 0 && safeToolStats.some((stat: any) => stat.count > 0) ? (
                    <div className="space-y-4">
                      {safeToolStats.map((stat: any, index: number) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            <span className="text-sm text-gray-600">{stat.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                              <span className="text-xs text-gray-500">uses</span>
                            </div>
                            <div className="w-16">
                              <div className="w-full bg-gray-100 rounded-full h-1">
                                <div 
                                  className="bg-gray-600 h-1 rounded-full" 
                                  style={{ width: `${stat.usage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No usage data yet</p>
                        <p className="text-xs text-gray-400 mt-1">Analytics will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Analyses - Enhanced */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Recent Analyses</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-gray-500 hover:text-gray-700 -mr-2"
                      onClick={() => setActiveTab('reports')}
                    >
                      View all
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {safeFiles && safeFiles.length > 0 ? safeFiles.slice(0, 4).map((analysis: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {analysis.type === 'suite_analyzer' ? <Package className="h-4 w-4 text-gray-600" /> :
                           analysis.type === 'pdp_analyzer' ? <Eye className="h-4 w-4 text-gray-600" /> :
                           analysis.type === 'demand_planner' || analysis.type === 'demand_planner_v2' ? <TrendingUp className="h-4 w-4 text-gray-600" /> :
                           analysis.type === 'spec_generator' ? <Sparkles className="h-4 w-4 text-gray-600" /> :
                           <FileText className="h-4 w-4 text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{analysis.name}</p>
                          <p className="text-xs text-gray-500">{analysis.time} • {analysis.tool}</p>
                        </div>
                        {analysis.status === 'completed' && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        )}
                        {analysis.status === 'processing' && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        )}
                        {analysis.status === 'failed' && (
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        )}
                      </div>
                    )) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <FolderOpen className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">No analyses yet</p>
                          <p className="text-xs text-gray-400 mt-1">Your work will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Chat Interface - Enhanced */}
              <div className="mb-8">
                <AIAssistant />
              </div>

              {/* Smart Insights - Premium Design */}
              <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Smart Insights</h3>
                </div>
                
                {/* Rotating Insights - Enhanced */}
                {(() => {
                  const insights = [
                    {
                      title: "Packaging Optimization Opportunity",
                      description: "Based on your usage patterns, switching to medium boxes for 20% of your shipments could reduce costs by an estimated 15%.",
                      color: "blue"
                    },
                    {
                      title: "Sustainable Packaging Benefits", 
                      description: "Implementing eco-friendly packaging materials could improve your sustainability score by 25% while maintaining cost efficiency.",
                      color: "green"
                    },
                    {
                      title: "Shipping Volume Analysis",
                      description: "Your peak shipping days are Tuesday-Thursday. Consider bulk packaging preparation on Mondays to optimize workflow.",
                      color: "purple"
                    },
                    {
                      title: "Material Waste Reduction",
                      description: "Using right-sized packaging could eliminate 30% of void fill material, reducing both costs and environmental impact.",
                      color: "orange"
                    },
                    {
                      title: "Seasonal Demand Planning",
                      description: "Historical data shows 40% increase in demand during Q4. Consider scaling packaging inventory 6 weeks prior.",
                      color: "indigo"
                    },
                    {
                      title: "Multi-Item Shipping Efficiency",
                      description: "Consolidating orders with 2-3 items into single packages could reduce shipping costs by 22% on average.",
                      color: "teal"
                    },
                    {
                      title: "Packaging Performance Metrics",
                      description: "Your current packaging efficiency is 78%. Implementing automated size selection could boost this to 92%.",
                      color: "red"
                    }
                  ];
                  
                  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
                  const insight = insights[today];
                  const colorClasses = {
                    blue: { bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100", iconText: "text-blue-600", title: "text-blue-900", text: "text-blue-700" },
                    green: { bg: "bg-green-50", border: "border-green-200", iconBg: "bg-green-100", iconText: "text-green-600", title: "text-green-900", text: "text-green-700" },
                    purple: { bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-100", iconText: "text-purple-600", title: "text-purple-900", text: "text-purple-700" },
                    orange: { bg: "bg-orange-50", border: "border-orange-200", iconBg: "bg-orange-100", iconText: "text-orange-600", title: "text-orange-900", text: "text-orange-700" },
                    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", iconBg: "bg-indigo-100", iconText: "text-indigo-600", title: "text-indigo-900", text: "text-indigo-700" },
                    teal: { bg: "bg-teal-50", border: "border-teal-200", iconBg: "bg-teal-100", iconText: "text-teal-600", title: "text-teal-900", text: "text-teal-700" },
                    red: { bg: "bg-red-50", border: "border-red-200", iconBg: "bg-red-100", iconText: "text-red-600", title: "text-red-900", text: "text-red-700" }
                  };
                  const colors = colorClasses[insight.color];
                  
                  return (
                    <div className="bg-white border border-gray-200 rounded-3xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                          <Lightbulb className="h-4 w-4" style={{ color: designSystem.colors.primary }} />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${colors.title} text-base mb-2`}>{insight.title}</h4>
                          <p className={`${colors.text} leading-relaxed`}>
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FBFC' }}>
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
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-60 h-full bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out`}>
          {/* Sidebar Header */}
          <div className="border-b border-gray-200 px-4 flex items-center" style={{ height: '65px' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
                <Package className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base font-medium text-gray-900">QuantiPackAI</h1>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="p-2 sm:p-3">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isDisabled = isBackendUnavailable && 
                  ['suite-analyzer-backend', 'demand-planner-v2', 'pdp-analyzer'].includes(item.id);
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start text-left h-10 text-sm rounded-lg transition-all duration-200 px-3 ${
                      activeTab === item.id 
                        ? "font-medium shadow-sm" 
                        : isDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    style={activeTab === item.id ? { 
                      color: '#000000',
                      backgroundColor: '#F5F7F9' 
                    } : {}}
                    onClick={() => {
                      if (!isDisabled) {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    <item.icon className="h-8 w-8 mr-1" />
                    {item.label}
                    {isDisabled && (
                      <span className="ml-auto text-xs text-gray-400">Offline</span>
                    )}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 space-y-3">
            {/* Upgrade Card */}
            <div className="bg-white rounded-3xl p-3 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Upgrade to Pro</h4>
              <p className="text-xs text-gray-600 mb-3">
                Get 1 month free and unlock advanced features
              </p>
              <Button size="sm" className="w-full text-white text-xs rounded-full" style={{ backgroundColor: designSystem.colors.primary }}>
                Upgrade
              </Button>
            </div>

            {/* User Profile Section */}
            <div className="relative" data-user-dropdown>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors"
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
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-3xl border border-gray-200 py-2 z-50">
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
        <div className="flex-1 overflow-auto" style={{ backgroundColor: '#F9FBFC' }}>
          {renderHeader()}
          <div className="px-4 sm:px-6 pb-6">
            {renderContent()}
          </div>
        </div>

        {/* Floating AI Assistant Button */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
          <Button
            onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
            className="h-12 w-12 rounded-full text-white transition-all duration-300 hover:opacity-90" style={{ backgroundColor: designSystem.colors.primary }}
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