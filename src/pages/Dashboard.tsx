
import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { PackagingSuiteAnalyzer } from '@/components/PackagingSuiteAnalyzer';
import { SpecGenerator } from '@/components/SpecGenerator';
import { PackagingDemandPlanner } from '@/components/PackagingDemandPlanner';
import { PDPAnalyzer } from '@/components/PDPAnalyzer';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'suite-analyzer', label: 'Suite Analyzer', icon: Package },
    { id: 'spec-generator', label: 'Spec Generator', icon: Calculator },
    { id: 'demand-planner', label: 'Demand Planner', icon: TrendingUp },
    { id: 'pdp-analyzer', label: 'PDP Analyzer', icon: Eye },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'suite-analyzer':
        return <PackagingSuiteAnalyzer />;
      case 'spec-generator':
        return <SpecGenerator />;
      case 'demand-planner':
        return <PackagingDemandPlanner />;
      case 'pdp-analyzer':
        return <PDPAnalyzer />;
      case 'reports':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Reports & Analytics</h2>
              <p className="text-slate-500">
                Access and download your packaging analysis reports
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {['Suite Analysis Report', 'Spec Generation Report', 'Demand Planning Report', 'PDP Analysis Report'].map((report, index) => (
                <Card key={index} className="border-slate-200 hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-800">{report}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-slate-400">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No reports generated yet</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-800 mb-2">Hello, User</h1>
                <p className="text-slate-500">Track your packaging optimization progress here. You almost reach a goal!</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">16 May, 2024</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                  All Systems Active
                </Badge>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-600">Finished</CardTitle>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-semibold text-slate-800">18</span>
                      <span className="text-sm text-emerald-600">+8 tasks</span>
                    </div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-600">Tracked</CardTitle>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-semibold text-slate-800">31h</span>
                      <span className="text-sm text-red-500">-6 hours</span>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-600">Efficiency</CardTitle>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-semibold text-slate-800">93%</span>
                      <span className="text-sm text-emerald-600">+12%</span>
                    </div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-800">Performance</CardTitle>
                  <Badge variant="outline" className="text-slate-600 border-slate-300">
                    01-07 May
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Performance chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Features Grid */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Core Features</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    id: 'suite-analyzer',
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
                    color: 'emerald',
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
                  <Card key={feature.id} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 bg-${feature.color}-50 rounded-xl group-hover:bg-${feature.color}-100 transition-colors`}>
                          <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                        </div>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                          {feature.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-slate-800 mt-3">{feature.title}</CardTitle>
                      <CardDescription className="text-slate-500">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
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
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Recent Activity</CardTitle>
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
                        activity.type === 'warning' ? 'bg-orange-500' : 'bg-slate-400'
                      }`} />
                      <span className="text-slate-700 flex-1">{activity.text}</span>
                      <span className="text-slate-400 text-xs">{activity.time}</span>
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
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <h1 className="text-xl font-semibold text-slate-800">QuantiPackAI</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-600"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-64 h-screen bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out`}>
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">QuantiPackAI</h1>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-left ${
                  activeTab === item.id 
                    ? "bg-blue-50 text-blue-700 border-blue-200" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
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

          <div className="absolute bottom-4 left-4 right-4">
            <Card className="border-slate-200 bg-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <MessageSquare className="h-4 w-4" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3">
                  Need help with packaging optimization?
                </p>
                <Button size="sm" variant="outline" className="w-full text-slate-600 border-slate-300 hover:bg-white">
                  Ask AI
                </Button>
              </CardContent>
            </Card>
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
        <div className="flex-1 min-h-screen">
          <div className="p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
