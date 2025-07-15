import { useState } from "react";
import { Package, Upload, BarChart3, MessageSquare, Settings, FileText, TrendingUp, DollarSign, Boxes, PieChart, Plus, Calendar, Clock, MoreHorizontal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("overview");

  const stats = [
    {
      title: "Finished",
      value: "1,247",
      subtitle: "+8 orders",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Tracked",
      value: "$12,450",
      subtitle: "- $2,340 saved",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Efficiency",
      value: "87%",
      subtitle: "+12%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const recentActivity = [
    { 
      user: "System AI",
      action: "Optimized packaging for Order #4821",
      time: "10:15 AM",
      avatar: "🤖",
      details: "Recommended smaller box size, saved $4.50 on shipping"
    },
    { 
      user: "Processing Engine",
      action: "Uploaded order batch #1247",
      time: "10:15 AM",
      avatar: "⚙️",
      details: "45 orders processed successfully"
    },
    { 
      user: "Analytics Bot",
      action: "Generated monthly report",
      time: "10:15 AM",
      avatar: "📊",
      details: "Monthly packaging analysis complete"
    },
    { 
      user: "AI Assistant",
      action: "Answered packaging query",
      time: "10:15 AM",
      avatar: "💬",
      details: "Explained CUIN calculation method"
    }
  ];

  const currentTasks = [
    {
      title: "Monthly Packaging Report",
      status: "In progress",
      progress: 75,
      time: "2h",
      statusColor: "bg-orange-500",
      icon: "📋"
    },
    {
      title: "AI Analysis for SKU Batch",
      status: "On hold",
      progress: 30,
      time: "4h",
      statusColor: "bg-yellow-500",
      icon: "🔍"
    },
    {
      title: "Order Optimization Review",
      status: "Done",
      progress: 100,
      time: "6h",
      statusColor: "bg-green-500",
      icon: "✅"
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
          <Button
            variant="ghost"
            className={`w-full justify-start ${activeView === "projects" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveView("projects")}
          >
            <Package className="h-4 w-4 mr-3" />
            Projects
            <Plus className="h-4 w-4 ml-auto" />
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${activeView === "upload" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveView("upload")}
          >
            <Upload className="h-4 w-4 mr-3" />
            Upload Data
            <Plus className="h-4 w-4 ml-auto" />
          </Button>
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
            className={`w-full justify-start ${activeView === "team" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveView("team")}
          >
            <User className="h-4 w-4 mr-3" />
            Team
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
            <h4 className="font-semibold text-gray-900 mb-2">Upgrade to Pro</h4>
            <p className="text-sm text-gray-600 mb-3">Get 1 month free and unlock advanced features</p>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              Upgrade
            </Button>
          </div>
        </div>

        {/* Help & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50">
            <MessageSquare className="h-4 w-4 mr-3" />
            Help & Information
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50">
            <span className="w-4 h-4 mr-3 flex items-center justify-center">⚪</span>
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Hello, Manager</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  16 May, 2023
                </div>
              </div>
              <p className="text-gray-600">Track packaging optimization here. You almost reach a goal!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold text-gray-900">QuantiPack User</div>
                <div className="text-sm text-gray-500">@quantipack</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">Q</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  📞
                </Button>
                <Button variant="outline" size="sm">
                  💬
                </Button>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          {activeView === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Stats & Performance */}
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

                {/* Performance Chart */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Performance</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">01-07 May</span>
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 flex items-end justify-center pb-8">
                        <div className="flex items-end space-x-2">
                          {[3, 5, 2, 7, 4, 6, 8, 3, 5].map((height, i) => (
                            <div
                              key={i}
                              className="bg-gradient-to-t from-blue-400 to-blue-600 rounded-t"
                              style={{ width: '20px', height: `${height * 20}px` }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-center z-10">
                        <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <p className="text-gray-500">Performance visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Tasks */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Current Tasks</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Done 75%</span>
                        <Button variant="ghost" size="sm">Week</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border">
                            <span className="text-sm">{task.icon}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${task.statusColor}`}></div>
                              <span className="text-xs text-gray-500">{task.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">{task.time}</span>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Activity Feed */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Activity</CardTitle>
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
                          <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Message Input */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Ask AI about packaging optimization..."
                        className="flex-1 px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        🎤
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === "upload" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Order Data</h2>
                <p className="text-gray-600">Upload your order history to start the optimization process</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>File Upload</CardTitle>
                  <CardDescription>
                    Upload CSV or Excel files containing your order data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your files here, or <span className="text-blue-600 cursor-pointer">browse</span>
                    </p>
                    <p className="text-gray-500">
                      Supports CSV, Excel files up to 10MB
                    </p>
                    <Button className="mt-4">
                      Select Files
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required Fields</CardTitle>
                  <CardDescription>
                    Ensure your data contains these fields for optimal results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-600">Required</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Order ID</li>
                        <li>• Product Description</li>
                        <li>• Quantity</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-600">Optional (will be estimated)</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Length (L)</li>
                        <li>• Width (W)</li>
                        <li>• Height (H)</li>
                        <li>• CUIN</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === "reports" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
                <p className="text-gray-600">Download detailed reports and insights</p>
              </div>

              <Tabs defaultValue="summary" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="summary">Summary Reports</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                  <TabsTrigger value="comparisons">Before/After</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Summary</CardTitle>
                        <CardDescription>Comprehensive monthly packaging report</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Orders Processed</span>
                            <span className="font-semibold">1,247</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Total Savings</span>
                            <span className="font-semibold text-green-600">$12,450</span>
                          </div>
                          <Button className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Raw Data Export</CardTitle>
                        <CardDescription>Export processed order data with recommendations</CardDescription>
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

                <TabsContent value="detailed">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Analysis Coming Soon</CardTitle>
                      <CardDescription>
                        Advanced analytics and detailed breakdowns will be available here
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </TabsContent>

                <TabsContent value="comparisons">
                  <Card>
                    <CardHeader>
                      <CardTitle>Before/After Comparisons Coming Soon</CardTitle>
                      <CardDescription>
                        Visual comparisons of packaging efficiency before and after optimization
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeView === "ai-chat" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Packaging Assistant</h2>
                <p className="text-gray-600">Ask questions about packaging optimization and CUIN calculations</p>
              </div>

              <Card className="h-96">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Chat with AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">AI chatbot interface will be implemented</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Ask about CUIN calculations, packaging recommendations, and optimization strategies
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Ask about packaging optimization..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button>Send</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sample Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                        "How is CUIN calculated?"
                      </li>
                      <li className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                        "What's the best packaging for order #123?"
                      </li>
                      <li className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                        "How do I reduce void space?"
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Explain CUIN and DIM weight calculations</li>
                      <li>• Provide packaging recommendations</li>
                      <li>• Analyze specific orders</li>
                      <li>• Suggest optimization strategies</li>
                    </ul>
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
