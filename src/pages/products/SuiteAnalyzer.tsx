import { Package, ArrowRight, TrendingUp, DollarSign, BarChart3, Upload, Database, Calculator, ChartBar, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const SuiteAnalyzer = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const flowchartSteps = [
    {
      step: 1,
      title: "Upload Order Data",
      description: "Order ID + Total Order Volume (CUIN)",
      icon: FileSpreadsheet,
      visual: "CSV with order IDs and volumes"
    },
    {
      step: 2,
      title: "Upload Packaging Suite",
      description: "Package Types + Dimensions (L×W×H), Cost per package, Package weight, Baseline usage % per type",
      icon: Package,
      visual: "Stack of boxes (S, M, L) with cost, weight, usage tags"
    },
    {
      step: 3,
      title: "Proprietary Formulas",
      description: "QuantiPackAI Logic to match orders with the most efficient packaging",
      icon: Calculator,
      visual: "Formula routing orders to different box sizes"
    },
    {
      step: 4,
      title: "Fill Rate & Performance Insights",
      description: "See how efficiently each order fits. Identify packaging types with low fill rates or overuse",
      icon: ChartBar,
      visual: "Bar chart comparing fill % across package sizes"
    },
    {
      step: 5,
      title: "Cost & Waste Analysis",
      description: "Compare baseline vs optimized suite: Material waste eliminated, Cost savings achieved, Packaging mix efficiency gains",
      icon: BarChart3,
      visual: "Current Suite vs Optimized Suite dashboard"
    }
  ];

  const supportingPoints = [
    "Optimize packaging allocation using proprietary formulas based on real order volumes",
    "Factor in costs, weights, and usage rates for accurate, business-ready results",
    "Show clear wins: compare baseline vs optimized cost and waste reduction",
    "Export results: download optimized suite and insights in CSV or spec format"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#767AFA] flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">QuantiPackAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/sign-in">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/sign-up">
                <Button className="bg-[#767AFA] hover:bg-[#767AFA]/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#767AFA]/5 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Package className="h-10 w-10 text-[#767AFA]" />
              <span className="text-sm font-semibold text-[#767AFA] uppercase tracking-wide">Suite Analyzer</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Find your optimal packaging suite and
              <span className="text-[#767AFA]"> compare it against your current baseline</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Upload your order history and packaging list to discover your optimal packaging mix, 
              forecasting measurable cost and sustainability savings while identifying inefficiencies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button size="lg" className="bg-[#767AFA] hover:bg-[#767AFA]/90">
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Flowchart Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Suite Analyzer Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our 5-step process to optimize your packaging suite
            </p>
          </div>

          {/* Horizontal Flowchart */}
          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gray-200"></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {flowchartSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-[#767AFA]/10 rounded-2xl mx-auto mb-4 flex items-center justify-center relative z-10">
                          <Icon className="h-8 w-8 text-[#767AFA]" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#767AFA] text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {step.step}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 italic">{step.visual}</p>
                        </div>
                      </CardContent>
                    </Card>
                    {index < flowchartSteps.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-24 -right-6 h-6 w-6 text-gray-400 z-20" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Supporting Points Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Key Benefits & Features
              </h2>
              <div className="space-y-4">
                {supportingPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">-20%</div>
                  <p className="text-gray-600">Average Cost Reduction</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-green-600">-15%</div>
                    <p className="text-sm text-gray-600">Material Waste</p>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-600">+85%</div>
                    <p className="text-sm text-gray-600">Fill Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#767AFA]/5 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to optimize your packaging suite?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using QuantiPackAI to reduce costs, 
            eliminate waste, and maximize packaging efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-[#767AFA] hover:bg-[#767AFA]/90">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuiteAnalyzer;