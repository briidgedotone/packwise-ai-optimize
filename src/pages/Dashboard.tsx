import React, { useState, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import {
  ChatBubbleLeftRightIcon as MessageSquare,
  Bars3Icon as Menu,
  XMarkIcon as X,
  ExclamationCircleIcon as AlertCircle,
  ArrowLeftOnRectangleIcon as LogOut,
  ChevronDownIcon as ChevronDown,
  EllipsisHorizontalIcon as MoreHorizontal,
  BoltIcon as Activity,
  BoltIcon as Zap,
  FolderOpenIcon as FolderOpen,
  ArrowPathIcon as RefreshCw,
  ArrowTopRightOnSquareIcon as ExternalLink,
  DocumentTextIcon as FileText,
  ChartBarIcon as BarChart3,
  Cog6ToothIcon as SettingsIcon
} from '@heroicons/react/24/outline';
import {
  ArchiveBoxIcon as PackageSolid,
  SparklesIcon as SparklesSolid,
  ArrowTrendingUpIcon as TrendingUpSolid,
  EyeIcon as EyeSolid
} from '@heroicons/react/24/solid';
import {
  HomeIcon,
  ArchiveBoxIcon,
  DocumentPlusIcon,
  ChartBarSquareIcon,
  EyeIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { PackagingSuiteAnalyzerBackend } from '@/components/PackagingSuiteAnalyzerBackend';
import { SpecGenerator } from '@/components/SpecGenerator';
import { ImprovedPackagingDemandPlanner } from '@/components/ImprovedPackagingDemandPlanner';
import { PDPAnalyzer } from '@/components/PDPAnalyzer';
import { InlineAIAssistant } from '@/components/InlineAIAssistant';
import Settings from '@/pages/Settings';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Dashboard = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Handle navigation from footer links
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to avoid re-triggering on future navigations
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  // Token and subscription data
  const tokenBalance = useQuery(api.tokens.getTokenBalance);
  const subscriptionStatus = useQuery(api.tokens.getSubscriptionStatus);

  // Get current user from database
  const currentUser = useQuery(api.users.getCurrentUser);




  // Fallback data when backend is unavailable
  const fallbackMetrics = {
    tokensUsed: 0,
    tokensLimit: 10,
    tokensRemaining: 10,
  };

  const fallbackActivity = [];
  const fallbackToolStats = [];
  const fallbackFiles = [];

  // Use real token data when available, otherwise fallback
  const safeMetrics = tokenBalance ? {
    tokensUsed: tokenBalance.usedTokens,
    tokensLimit: tokenBalance.monthlyTokens + tokenBalance.additionalTokens,
    tokensRemaining: tokenBalance.remainingTokens,
  } : (isBackendUnavailable || !dashboardMetrics ? fallbackMetrics : dashboardMetrics);
  const safeActivity = isBackendUnavailable || !recentActivity ? fallbackActivity : recentActivity;
  const safeToolStats = isBackendUnavailable || !toolUsageStats ? fallbackToolStats : toolUsageStats;
  const safeFiles = isBackendUnavailable || !recentFiles ? fallbackFiles : recentFiles;
  // Use recentActivity for analyses (not safeFiles which is for file uploads)
  const safeAnalyses = isBackendUnavailable || !recentActivity ? [] : recentActivity;

  // Listen for custom tab change events (from PDP results navigation)
  useEffect(() => {
    const handleSetActiveTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    const handleAnalysisCreated = (event: CustomEvent) => {
      console.log('Analysis created event received:', event.detail);
      // Force refresh of dashboard queries by triggering a re-render
      // This will cause useQuery hooks to re-fetch data
      window.location.reload();
    };

    window.addEventListener('setActiveTab', handleSetActiveTab as EventListener);
    window.addEventListener('analysisCreated', handleAnalysisCreated as EventListener);

    return () => {
      window.removeEventListener('setActiveTab', handleSetActiveTab as EventListener);
      window.removeEventListener('analysisCreated', handleAnalysisCreated as EventListener);
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

  // Listen for token consumption events to refresh token display
  useEffect(() => {
    const handleTokenConsumed = (event: CustomEvent) => {
      console.log('Dashboard received token consumption event:', event.detail);
      // Force a small re-render to refresh token queries
      setTimeout(() => {
        window.dispatchEvent(new Event('focus'));
      }, 100);
    };

    window.addEventListener('tokenConsumed', handleTokenConsumed as EventListener);

    return () => {
      window.removeEventListener('tokenConsumed', handleTokenConsumed as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: HomeIcon },
    { id: 'suite-analyzer-backend', label: 'Suite Analyzer', icon: ArchiveBoxIcon },
    { id: 'spec-generator', label: 'Spec Generator', icon: DocumentPlusIcon },
    { id: 'demand-planner-v2', label: 'Demand Planner', icon: ChartBarSquareIcon },
    { id: 'pdp-analyzer', label: 'Design Analyzer', icon: EyeIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  // Get current page info
  const getCurrentPageInfo = () => {
    const currentItem = menuItems.find(item => item.id === activeTab);
    return {
      title: currentItem?.label || 'Dashboard',
      icon: currentItem?.icon || HomeIcon
    };
  };

  // Render header component
  const renderHeader = () => {
    return (
      <div className="sticky top-0 z-40 bg-white border-b border-[#E3E7EA] px-3 sm:px-4" style={{ height: '60px' }}>
        <div className="flex items-center justify-end h-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Feature Temporarily Unavailable</h3>
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
        return <ImprovedPackagingDemandPlanner />;
      case 'pdp-analyzer':
        return <PDPAnalyzer />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="min-h-screen bg-white">
            <div>
              
              {/* Backend Unavailable Warning */}
              {isBackendUnavailable && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-4 mb-3">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">Backend Deployments Disabled</h3>
                      <p className="text-sm text-red-800 mb-3">
                        Convex free plan limits exceeded. All backend functions are disabled until limits are restored.
                        The application is running in offline mode with limited functionality.
                      </p>
                      <div className="bg-red-100 border border-red-200 rounded-2xl p-3 mb-3">
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

              {/* Welcome Message */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {user?.firstName || user?.fullName || 'there'}!
                </h1>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                
                {/* Key Metrics Cards */}
                <div className="lg:col-span-4">
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-4 transition-all duration-300 h-full flex flex-col shadow-md hover:shadow-lg hover:scale-[1.01]">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-sm font-semibold text-gray-900">Token Usage</h2>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="mb-3">
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {safeMetrics?.tokensRemaining || safeMetrics?.tokensLimit || '10'}
                            </span>
                            <span className="text-sm text-gray-600 font-medium">
                              / {safeMetrics?.tokensLimit || '10'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Tokens Remaining</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm mb-0.5">
                          <span className="text-gray-500">Used</span>
                          <span className="font-medium text-gray-700">
                            {safeMetrics?.tokensUsed || '0'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
                            style={{
                              width: `${Math.min(100, ((safeMetrics?.tokensRemaining || safeMetrics?.tokensLimit || 10) / (safeMetrics?.tokensLimit || 10)) * 100)}%`
                            }}
                          >
                            <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Quick Actions - Modern Card Design */}
                <div className="lg:col-span-8">
                  <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl border border-indigo-100 p-6 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="grid gap-2 grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-auto p-4 border-0 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 justify-start group transition-all duration-300 rounded-3xl shadow-md hover:shadow-lg hover:scale-105 transform"
                        onClick={() => setActiveTab('suite-analyzer-backend')}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 shadow-lg">
                            <PackageSolid className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">Suite Analyzer</div>
                            <div className="text-xs text-gray-600 group-hover:text-blue-700 transition-colors">Optimize packaging</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 border-0 bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 justify-start group transition-all duration-300 rounded-3xl shadow-md hover:shadow-lg hover:scale-105 transform"
                        onClick={() => setActiveTab('demand-planner-v2')}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 group-hover:from-green-600 group-hover:to-emerald-700 shadow-lg">
                            <TrendingUpSolid className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-green-900 transition-colors">Demand Planner</div>
                            <div className="text-xs text-gray-600 group-hover:text-green-700 transition-colors">Forecast needs</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 border-0 bg-gradient-to-r from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 justify-start group transition-all duration-300 rounded-3xl shadow-md hover:shadow-lg hover:scale-105 transform"
                        onClick={() => setActiveTab('spec-generator')}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-purple-500 to-violet-600 group-hover:from-purple-600 group-hover:to-violet-700 shadow-lg">
                            <SparklesSolid className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">Spec Generator</div>
                            <div className="text-xs text-gray-600 group-hover:text-purple-700 transition-colors">AI specifications</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 border-0 bg-gradient-to-r from-pink-50 to-rose-100 hover:from-pink-100 hover:to-rose-200 justify-start group transition-all duration-300 rounded-3xl shadow-md hover:shadow-lg hover:scale-105 transform"
                        onClick={() => setActiveTab('pdp-analyzer')}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-pink-500 to-rose-600 group-hover:from-pink-600 group-hover:to-rose-700 shadow-lg">
                            <EyeSolid className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-pink-900 transition-colors">Design Analyzer</div>
                            <div className="text-xs text-gray-600 group-hover:text-pink-700 transition-colors">Visual analysis</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>


              {/* AI Chat Interface - Inline */}
              <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-2xl border border-purple-100 p-4 shadow-md hover:shadow-lg transition-all duration-300 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 shadow-md">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">AI Assistant</h3>
                    <p className="text-xs text-gray-600">Your intelligent packaging optimization companion</p>
                  </div>
                </div>
                <InlineAIAssistant currentFeature={activeTab} />
              </div>

              {/* Analytics and Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                
                {/* Tool Analytics - Blue Gradient Style */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl border border-blue-100 p-6 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Tool Analytics</h3>
                  </div>
                  <div className="space-y-3">
                    {toolUsageStats ? (
                      toolUsageStats.map((tool) => (
                        <div key={tool.name} className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/60 hover:bg-white/80 transition-colors">
                          <span className="text-sm font-medium text-gray-700">{tool.name}</span>
                          <span className="text-sm font-bold text-blue-600">{tool.count} {tool.count === 1 ? 'use' : 'uses'}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/60">
                          <span className="text-sm font-medium text-gray-700">Suite Analyzer</span>
                          <span className="text-sm font-bold text-blue-600">0 uses</span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/60">
                          <span className="text-sm font-medium text-gray-700">Spec Generator</span>
                          <span className="text-sm font-bold text-blue-600">0 uses</span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/60">
                          <span className="text-sm font-medium text-gray-700">Design Analyzer</span>
                          <span className="text-sm font-bold text-blue-600">0 uses</span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/60">
                          <span className="text-sm font-medium text-gray-700">Demand Planner</span>
                          <span className="text-sm font-bold text-blue-600">0 uses</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Recent Analyses - Blue Gradient Style */}
                <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl border border-indigo-100 p-6 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Analyses</h3>
                  </div>
                  {recentActivity && recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="py-3 px-3 rounded-xl bg-white/60 hover:bg-white/80 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-1">{activity.title}</p>
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg ml-2">{activity.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <FolderOpen className="h-6 w-6 text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">No analyses yet</p>
                      <p className="text-xs text-gray-400 mt-1">Your work will appear here</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#E3E7EA]">
        <img src="/logo.svg" alt="QuantiPackAI Logo" className="h-8" />
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
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-60 h-full bg-gradient-to-b from-white via-blue-50 to-indigo-100 border-r border-indigo-200 transition-transform duration-200 ease-in-out shadow-xl`}>
          {/* Sidebar Header */}
          <div className="border-b border-gray-200 px-3 flex items-center bg-white" style={{ height: '50px' }}>
            <img src="/logo.svg" alt="QuantiPackAI Logo" className="h-8" />
          </div>

          {/* Sidebar Content */}
          <div className="p-1.5">
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isDisabled = isBackendUnavailable && 
                  ['suite-analyzer-backend', 'demand-planner-v2', 'pdp-analyzer'].includes(item.id);
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start text-left h-10 text-sm rounded-xl transition-all duration-300 px-2.5 ${
                      activeTab === item.id 
                        ? "font-medium text-blue-600 bg-white/60" 
                        : isDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                    onClick={() => {
                      if (!isDisabled) {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    <item.icon className="h-4 w-4 mr-1" style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', flex: 'none' }} />
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
          <div className="absolute bottom-1.5 left-1.5 right-1.5 space-y-1">

            {/* User Profile Section */}
            <div className="relative" data-user-dropdown>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-full bg-white/50 backdrop-blur rounded-xl p-1.5 border border-white/20 hover:bg-white/70 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs">
                    {(currentUser?.name || user?.firstName || user?.fullName || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {currentUser?.name || user?.fullName || user?.firstName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser?.email || user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-2xl border border-gray-200 py-1.5 z-50 shadow-lg">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <SettingsIcon className="h-3 w-3 text-gray-400" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut className="h-3 w-3 text-gray-400" />
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
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-100/50">
          <div className="flex-1 overflow-auto px-3 sm:px-4 pb-4 pt-4">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;