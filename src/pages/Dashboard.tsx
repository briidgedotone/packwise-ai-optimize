
import { useState } from "react";
import { Package, Upload, BarChart3, MessageSquare, Settings, FileText, TrendingUp, DollarSign, Boxes, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("overview");

  const stats = [
    {
      title: "Total Savings",
      value: "$12,450",
      change: "+23%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Orders Processed",
      value: "1,247",
      change: "+12%",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Fill Rate Improvement",
      value: "87%",
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Waste Reduction",
      value: "34%",
      change: "+8%",
      icon: Boxes,
      color: "text-orange-600"
    }
  ];

  const recentActivity = [
    { action: "Uploaded order batch #1247", time: "2 hours ago", status: "completed" },
    { action: "Generated packaging report", time: "4 hours ago", status: "completed" },
    { action: "AI analysis for SKU-4821", time: "6 hours ago", status: "completed" },
    { action: "Optimized 45 orders", time: "1 day ago", status: "completed" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">QuantiPackAI Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Corporate Plan
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeView === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("overview")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeView === "upload" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("upload")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Data
            </Button>
            <Button
              variant={activeView === "reports" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("reports")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button
              variant={activeView === "ai-chat" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("ai-chat")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeView === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-green-600 mt-1">
                        {stat.change} from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Packaging Optimization Trends</CardTitle>
                    <CardDescription>
                      Monthly savings and efficiency improvements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Chart visualization will be implemented</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Packaging Mix Analysis</CardTitle>
                    <CardDescription>
                      Current vs optimized packaging distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Pie chart visualization will be implemented</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest processing and optimization activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
