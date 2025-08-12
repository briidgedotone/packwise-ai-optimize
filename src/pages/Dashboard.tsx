
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
  Scale
} from 'lucide-react';
import { PackagingSuiteAnalyzerBackend } from '@/components/PackagingSuiteAnalyzerBackend';
import { SpecGenerator } from '@/components/SpecGenerator';
import { PackagingDemandPlanner } from '@/components/PackagingDemandPlanner';
import { PDPAnalyzer } from '@/components/PDPAnalyzer';
import { DesignComparator } from '@/components/DesignComparator';
import { AIAssistant } from '@/components/AIAssistant';
import { MonthlyChart, PackagingChart, EfficiencyChart } from '@/components/charts';

const Dashboard = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

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
    { id: 'pdp-analyzer', label: 'PDP Analyzer', icon: Eye },
    { id: 'design-comparator', label: 'Design Comparator', icon: Scale },
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
      case 'design-comparator':
        return <DesignComparator />;
      case 'reports':
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
                        Access comprehensive analysis reports and insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg">
                    <BarChart3 className="h-3 w-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">Analytics Hub</span>
                  </div>
                </div>
              </div>

              {/* Report Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: 'Suite Analysis Report',
                    description: 'Comprehensive packaging optimization analysis',
                    icon: Package,
                    color: 'blue',
                    status: 'ready'
                  },
                  {
                    title: 'Spec Generation Report',
                    description: 'AI-generated product specifications',
                    icon: Calculator,
                    color: 'purple',
                    status: 'processing'
                  },
                  {
                    title: 'Demand Planning Report',
                    description: 'Future packaging quantity forecasts',
                    icon: TrendingUp,
                    color: 'emerald',
                    status: 'pending'
                  },
                  {
                    title: 'PDP Analysis Report',
                    description: 'Visual analysis and competitor benchmarks',
                    icon: Eye,
                    color: 'pink',
                    status: 'ready'
                  },
                  {
                    title: 'Cost Optimization Report',
                    description: 'Detailed cost savings analysis',
                    icon: DollarSign,
                    color: 'orange',
                    status: 'ready'
                  },
                  {
                    title: 'Executive Summary',
                    description: 'High-level insights and recommendations',
                    icon: BarChart3,
                    color: 'indigo',
                    status: 'processing'
                  }
                ].map((report, index) => (
                  <Card key={index} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 bg-${report.color}-50 rounded-lg flex items-center justify-center group-hover:bg-${report.color}-100 transition-colors`}>
                          <report.icon className={`h-5 w-5 text-${report.color}-600`} />
                        </div>
                        {report.status === 'ready' && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                        {report.status === 'processing' && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Processing
                          </Badge>
                        )}
                        {report.status === 'pending' && (
                          <Badge variant="outline" className="text-slate-600 border-slate-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-medium text-gray-900">{report.title}</CardTitle>
                      <CardDescription className="text-gray-500">
                        {report.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {report.status === 'ready' ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Last updated: 2 hours ago</span>
                              <span>12 pages</span>
                            </div>
                            <Button 
                              className={`w-full bg-${report.color}-600 hover:bg-${report.color}-700 text-white`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        ) : report.status === 'processing' ? (
                          <div className="text-center py-4">
                            <div className="flex items-center justify-center gap-2 text-blue-600">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm">Generating report...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-3">Run analysis to generate report</p>
                            <Button variant="outline" className="w-full border-gray-200 text-gray-700">
                              Start Analysis
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Savings */}
              <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                    <TrendingUp className="h-2.5 w-2.5" />
                    +12.3%
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xl font-semibold text-gray-900">$34,250</h3>
                  <p className="text-xs text-gray-500">Total Savings</p>
                </div>
              </Card>

              {/* Cost Reduction */}
              <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                    <TrendingUp className="h-2.5 w-2.5" />
                    +2.1%
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xl font-semibold text-gray-900">23.8%</h3>
                  <p className="text-xs text-gray-500">Cost Reduction</p>
                </div>
              </Card>

              {/* Waste Reduction */}
              <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Recycle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                    <TrendingUp className="h-2.5 w-2.5" />
                    +5.7%
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xl font-semibold text-gray-900">19.9%</h3>
                  <p className="text-xs text-gray-500">Waste Reduction</p>
                </div>
              </Card>

              {/* Processed Orders */}
              <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                    <TrendingUp className="h-2.5 w-2.5" />
                    +8.4%
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xl font-semibold text-gray-900">12,847</h3>
                  <p className="text-xs text-gray-500">Processed Orders</p>
                </div>
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
                    title: 'PDP Analyzer',
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

            {/* Recent Activity */}
            <Card className="border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { text: 'Suite analysis completed for Q4 orders', time: '10:15 AM', type: 'success' },
                    { text: 'Generated specs for 247 new products', time: '10:15 AM', type: 'info' },
                    { text: 'Demand planning report exported', time: '10:15 AM', type: 'warning' },
                    { text: 'PDP analysis saved to reports', time: '10:15 AM', type: 'success' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-emerald-500' :
                        activity.type === 'info' ? 'bg-blue-500' :
                        activity.type === 'warning' ? 'bg-orange-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-gray-700 flex-1">{activity.text}</span>
                      <span className="text-gray-400 text-xs">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
