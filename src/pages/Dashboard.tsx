
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
    { id: 'overview', label: 'Overview', icon: BarChart3 },
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
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Reports & Analytics</h2>
              <p className="text-muted-foreground">
                Access and download your packaging analysis reports
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {['Suite Analysis Report', 'Spec Generation Report', 'Demand Planning Report', 'PDP Analysis Report'].map((report, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{report}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
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
                <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
                <p className="text-muted-foreground">Here's your packaging optimization overview</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                All Systems Active
              </Badge>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$24,500</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volume Efficiency</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87.2%</div>
                  <p className="text-xs text-muted-foreground">+3.1% improvement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Waste Reduction</CardTitle>
                  <Recycle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,340 lbs</div>
                  <p className="text-xs text-muted-foreground">Material saved this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders Analyzed</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15,847</div>
                  <p className="text-xs text-muted-foreground">Since last analysis</p>
                </CardContent>
              </Card>
            </div>

            {/* Core Features Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Core Features</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    id: 'suite-analyzer',
                    title: 'Packaging Suite Analyzer',
                    description: 'Optimize your packaging mix and identify cost savings',
                    icon: Package,
                    status: 'Ready',
                  },
                  {
                    id: 'spec-generator',
                    title: 'Spec Generator',
                    description: 'Generate realistic packaging specs from product descriptions',
                    icon: Calculator,
                    status: 'Ready',
                  },
                  {
                    id: 'demand-planner',
                    title: 'Packaging Demand Planner',
                    description: 'Calculate exact packaging quantities needed',
                    icon: TrendingUp,
                    status: 'Ready',
                  },
                  {
                    id: 'pdp-analyzer',
                    title: 'PDP Analyzer',
                    description: 'Score and improve your product display panels',
                    icon: Eye,
                    status: 'Ready',
                  },
                ].map((feature) => (
                  <Card key={feature.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <feature.icon className="h-8 w-8 text-primary" />
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {feature.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    'Suite analysis completed for Q4 orders',
                    'Generated specs for 247 new products',
                    'Demand planning report exported',
                    'PDP analysis saved to reports',
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground">{activity}</span>
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
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">QuantiPackAI</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-64 h-screen bg-card border-r transition-transform duration-200 ease-in-out`}>
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">QuantiPackAI</h1>
            <p className="text-sm text-muted-foreground">Packaging Analysis AI</p>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  Need help with packaging optimization?
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Ask AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
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
