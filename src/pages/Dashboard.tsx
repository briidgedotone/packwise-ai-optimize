
import { useState } from "react";
import { Package, Upload, BarChart3, MessageSquare, Settings, FileText, TrendingUp, DollarSign, Brain, Eye, Plus, Calendar, MoreHorizontal, User, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("overview");

  const stats = [
    {
      title: "Orders Analyzed",
      value: "1,247",
      subtitle: "+8 this week",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Cost Savings",
      value: "$12,450",
      subtitle: "This month",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Fill Efficiency",
      value: "87%",
      subtitle: "+12% improved",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const recentActivity = [
    { 
      user: "Packaging Suite Analyzer",
      action: "Analyzed 45 orders from batch #1247",
      time: "2 hours ago",
      avatar: "📦",
      status: "success"
    },
    { 
      user: "Spec Generator",
      action: "Generated dimensions for 23 products",
      time: "4 hours ago",
      avatar: "🧠",
      status: "success"
    },
    { 
      user: "Demand Planner",
      action: "Forecast completed for Q1 2024",
      time: "6 hours ago",
      avatar: "📊",
      status: "success"
    },
    { 
      user: "PDP Analyzer",
      action: "Analyzed 5 competitor PDPs",
      time: "1 day ago",
      avatar: "👁️",
      status: "info"
    }
  ];

  const quickActions = [
    {
      title: "Upload Order History",
      description: "Analyze packaging efficiency",
      icon: Upload,
      color: "bg-blue-500",
      action: "suite-analyzer"
    },
    {
      title: "Generate Product Specs",
      description: "AI-powered dimension estimation",
      icon: Brain,
      color: "bg-green-500",
      action: "spec-generator"
    },
    {
      title: "Plan Packaging Demand",
      description: "Forecast packaging needs",
      icon: TrendingUp,
      color: "bg-purple-500",
      action: "demand-planner"
    },
    {
      title: "Analyze PDP Design",
      description: "Score shelf performance",
      icon: Eye,
      color: "bg-orange-500",
      action: "pdp-analyzer"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">QuantiPackAI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeView === "overview" ? "default" : "ghost"}
            className={`w-full justify-start ${activeView === "overview" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveView("overview")}
          >
            <BarChart3 className="h-4 w-4 mr-3" />
            Overview
          </Button>
          
          <div className="py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Core Features</p>
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeView === "suite-analyzer" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setActiveView("suite-analyzer")}
            >
              <Package className="h-4 w-4 mr-3" />
              Suite Analyzer
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeView === "spec-generator" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setActiveView("spec-generator")}
            >
              <Brain className="h-4 w-4 mr-3" />
              Spec Generator
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeView === "demand-planner" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setActiveView("demand-planner")}
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              Demand Planner
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeView === "pdp-analyzer" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setActiveView("pdp-analyzer")}
            >
              <Eye className="h-4 w-4 mr-3" />
              PDP Analyzer
            </Button>
          </div>

          <Button
            variant="ghost"
            className={`w-full justify-start ${activeView === "reports" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveView("reports")}
          >
            <FileText className="h-4 w-4 mr-3" />
            Reports
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${activeView === "settings" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveView("settings")}
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
        </nav>

        {/* Upgrade Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Upgrade to Corporate</h4>
            <p className="text-sm text-gray-600 mb-3">Unlock advanced features and higher limits</p>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              Upgrade Now
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Good morning, Manager</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <p className="text-gray-600">Your packaging optimization dashboard is ready. Let's make smarter decisions together.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold text-gray-900">QuantiPack User</div>
                <div className="text-sm text-gray-500">Individual Plan</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">Q</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          {activeView === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Stats & Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className={`text-xs ${stat.color}`}>{stat.subtitle}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                    <CardDescription>Start analyzing your packaging data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quickActions.map((action, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setActiveView(action.action)}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                              <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{action.title}</p>
                              <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Chart Placeholder */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Packaging Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <p className="text-gray-500">Performance charts will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Activity Feed */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">{activity.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 text-sm">{activity.user}</p>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* AI Chat */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">Hi! I'm your packaging AI assistant. Ask me about CUIN calculations, optimization strategies, or any packaging questions.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Ask about packaging optimization..."
                          className="flex-1 px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Suite Analyzer View */}
          {activeView === "suite-analyzer" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Packaging Suite Analyzer</h2>
                <p className="text-gray-600">Upload your order history and packaging types to optimize your packaging allocation</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Order History
                    </CardTitle>
                    <CardDescription>
                      Each row = one product in one order. Required: Order ID. Optional: L×W×H, CUIN, Quantity, Product Description
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your order history file here
                      </p>
                      <p className="text-gray-500 mb-4">
                        CSV or Excel files accepted
                      </p>
                      <Button>Select File</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Upload Packaging Suite
                    </CardTitle>
                    <CardDescription>
                      Define your available packaging types with dimensions and costs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your packaging suite file here
                      </p>
                      <p className="text-gray-500 mb-4">
                        Required: Package Name, L×W×H, Cost per unit
                      </p>
                      <Button>Select File</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Optional: Baseline Packaging Mix</CardTitle>
                  <CardDescription>
                    Upload your current packaging usage percentages or quantities for comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Upload File</h4>
                      <div className="border border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">CSV with package types and percentages</p>
                        <Button variant="outline" size="sm" className="mt-2">Upload</Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Manual Entry</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="text" placeholder="Package Type" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                          <input type="number" placeholder="%" className="w-16 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        </div>
                        <Button variant="outline" size="sm">Add More</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fallback Dimensions</CardTitle>
                  <CardDescription>
                    Used when product dimensions are missing. Enter your typical product size ranges.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Smallest Product</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" placeholder="L" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        <input type="number" placeholder="W" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        <input type="number" placeholder="H" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Average Product</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" placeholder="L" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        <input type="number" placeholder="W" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        <input type="number" placeholder="H" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Largest Product</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" placeholder="L" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        <input type="number" placeholder="W" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        <input type="number" placeholder="H" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Analyze Packaging Suite
                </Button>
              </div>
            </div>
          )}

          {/* Spec Generator View */}
          {activeView === "spec-generator" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Spec Generator</h2>
                <p className="text-gray-600">Generate AI-estimated L×W×H and CUIN for products using industry knowledge and your dimensional boundaries</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      Product List Upload
                    </CardTitle>
                    <CardDescription>
                      Upload a list of product names or descriptions for dimension estimation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your product list here
                      </p>
                      <p className="text-gray-500 mb-4">
                        Each row = one product name/description
                      </p>
                      <Button>Select File</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bounding Dimensions</CardTitle>
                    <CardDescription>
                      Define size ranges to calibrate AI predictions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Min Dimensions (inches)</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="number" placeholder="L" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                          <input type="number" placeholder="W" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                          <input type="number" placeholder="H" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Average Dimensions</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="number" placeholder="L" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                          <input type="number" placeholder="W" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                          <input type="number" placeholder="H" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Max Dimensions</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="number" placeholder="L" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                          <input type="number" placeholder="W" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                          <input type="number" placeholder="H" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Optional Enhancement Fields</CardTitle>
                  <CardDescription>
                    Additional information to improve estimation accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input type="text" placeholder="e.g., Electronics, Cosmetics" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
                      <input type="text" placeholder="e.g., Plastic, Metal" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Size Range</label>
                      <input type="text" placeholder="e.g., S, M, L" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Generate Product Specs
                </Button>
              </div>
            </div>
          )}

          {/* Demand Planner View */}
          {activeView === "demand-planner" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Packaging Demand Planner</h2>
                <p className="text-gray-600">Forecast packaging quantities needed based on product volumes and packaging efficiency</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Forecasted Products
                    </CardTitle>
                    <CardDescription>
                      Upload your forecasted product volumes and quantities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your forecast file here
                      </p>
                      <p className="text-gray-500 mb-4">
                        Required: Product Name, Forecasted Quantity
                      </p>
                      <Button>Select File</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Packaging Suite
                    </CardTitle>
                    <CardDescription>
                      Define available packaging types for demand calculation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your packaging suite file here
                      </p>
                      <p className="text-gray-500 mb-4">
                        Required: Package Name, L×W×H, Cost per Unit
                      </p>
                      <Button>Select File</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sample Demand Plan Output</CardTitle>
                  <CardDescription>
                    Preview of what your packaging demand forecast will look like
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Package Type</TableHead>
                        <TableHead>Quantity Needed</TableHead>
                        <TableHead>% of Total</TableHead>
                        <TableHead>Average Fill Rate</TableHead>
                        <TableHead>Estimated Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Small Box</TableCell>
                        <TableCell>14,000</TableCell>
                        <TableCell>35%</TableCell>
                        <TableCell>89%</TableCell>
                        <TableCell>$1,680</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Medium Mailer</TableCell>
                        <TableCell>21,500</TableCell>
                        <TableCell>54%</TableCell>
                        <TableCell>81%</TableCell>
                        <TableCell>$3,010</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Large Carton</TableCell>
                        <TableCell>4,000</TableCell>
                        <TableCell>11%</TableCell>
                        <TableCell>74%</TableCell>
                        <TableCell>$720</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Generate Demand Forecast
                </Button>
              </div>
            </div>
          )}

          {/* PDP Analyzer View */}
          {activeView === "pdp-analyzer" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">PDP Analyzer</h2>
                <p className="text-gray-600">Analyze your Principal Display Panel's shelf performance and compare against competitors</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Upload Your PDP
                    </CardTitle>
                    <CardDescription>
                      Upload your product's Principal Display Panel for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your PDP image here
                      </p>
                      <p className="text-gray-500 mb-4">
                        JPG, PNG, or PDF accepted
                      </p>
                      <Button>Select Image</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Competitor PDPs (Optional)</CardTitle>
                    <CardDescription>
                      Upload up to 4 competitor PDPs for benchmarking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop competitor images here
                      </p>
                      <p className="text-gray-500 mb-4">
                        Up to 4 images for comparison
                      </p>
                      <Button>Select Images</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Parameters</CardTitle>
                  <CardDescription>
                    Optional information to enhance analysis accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                      <input type="text" placeholder="e.g., snacks, cosmetics" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Type</label>
                      <input type="text" placeholder="e.g., vertical peg, laydown" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Claims</label>
                      <input type="text" placeholder="e.g., Organic, New Formula" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Scoring Factors</CardTitle>
                  <CardDescription>
                    Your PDP will be scored on these 8 shelf visibility factors (0-10 scale)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Hierarchy</span>
                        <span className="text-sm text-gray-500">Visual flow guidance</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Readability</span>
                        <span className="text-sm text-gray-500">Message clarity at distance</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Color Impact</span>
                        <span className="text-sm text-gray-500">Contrast and eye-catching use</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Logo Visibility</span>
                        <span className="text-sm text-gray-500">Size, clarity, positioning</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Emotional Appeal</span>
                        <span className="text-sm text-gray-500">Visual storytelling</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Claims Communication</span>
                        <span className="text-sm text-gray-500">Clarity and effectiveness</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Font Choice</span>
                        <span className="text-sm text-gray-500">Appropriateness and legibility</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">White Space Balance</span>
                        <span className="text-sm text-gray-500">Spacing to avoid clutter</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Analyze PDP Performance
                </Button>
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeView === "reports" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
                <p className="text-gray-600">Download comprehensive reports and insights from your packaging analysis</p>
              </div>

              <Tabs defaultValue="suite" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="suite">Suite Analysis</TabsTrigger>
                  <TabsTrigger value="specs">Spec Generation</TabsTrigger>
                  <TabsTrigger value="demand">Demand Planning</TabsTrigger>
                  <TabsTrigger value="pdp">PDP Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="suite" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Packaging Optimization Report</CardTitle>
                        <CardDescription>Complete analysis with savings calculations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Orders Analyzed</span>
                            <span className="font-semibold">1,247</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Total Savings</span>
                            <span className="font-semibold text-green-600">$12,450</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Efficiency Improvement</span>
                            <span className="font-semibold text-blue-600">+12%</span>
                          </div>
                          <Button className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            Download PDF Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Raw Data Export</CardTitle>
                        <CardDescription>Detailed order-by-order allocation data</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Format</span>
                            <span className="font-semibold">Excel (.xlsx)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Includes</span>
                            <span className="font-semibold">All optimizations</span>
                          </div>
                          <Button variant="outline" className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            Download Excel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="specs">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Specifications Report</CardTitle>
                      <CardDescription>
                        AI-estimated dimensions with reasoning and confidence levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">Complete your spec generation analysis to download reports</p>
                      <Button disabled>
                        <FileText className="h-4 w-4 mr-2" />
                        Download Specs Report
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="demand">
                  <Card>
                    <CardHeader>
                      <CardTitle>Packaging Demand Forecast</CardTitle>
                      <CardDescription>
                        Comprehensive demand planning with quantity recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">Complete your demand planning analysis to download reports</p>
                      <Button disabled>
                        <FileText className="h-4 w-4 mr-2" />
                        Download Demand Report
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pdp">
                  <Card>
                    <CardHeader>
                      <CardTitle>PDP Performance Analysis</CardTitle>
                      <CardDescription>
                        Detailed scoring with competitor comparison and design recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">Complete your PDP analysis to download reports</p>
                      <Button disabled>
                        <FileText className="h-4 w-4 mr-2" />
                        Download PDP Report
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Settings View */}
          {activeView === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
                <p className="text-gray-600">Manage your account preferences and subscription</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" value="user@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input type="text" placeholder="Your Company" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <Button>Update Profile</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Current Plan</span>
                      <Badge>Individual</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Monthly Usage</span>
                      <span className="font-semibold">75 / 100 orders</span>
                    </div>
                    <Progress value={75} className="w-full" />
                    <Button className="w-full">Upgrade Plan</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
