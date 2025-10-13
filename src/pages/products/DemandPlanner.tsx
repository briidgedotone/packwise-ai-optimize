import { TrendingUp, ArrowRight, BarChart3, Calendar, AlertTriangle, Package, FileSpreadsheet, PieChart, History, Calculator, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const DemandPlanner = () => {
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const flowchartSteps = [
    {
      step: 1,
      title: "Upload Historical Usage",
      description: "Past packaging usage by type",
      icon: FileSpreadsheet
    },
    {
      step: 2,
      title: "Proprietary Formulas Calculate Percentages",
      description: "System determines actual mix % for each packaging type from historical data",
      icon: PieChart
    },
    {
      step: 3,
      title: "Rolling Percentage Tracking",
      description: "Percentages are stored and updated quarter after quarter for continuous accuracy",
      icon: History
    },
    {
      step: 4,
      title: "Input Order Forecasts",
      description: "Provide total forecasted orders for upcoming periods",
      icon: Calendar
    },
    {
      step: 5,
      title: "Accurate Packaging Demand Plan",
      description: "Outputs precise demand by package type, aligned to forecast and rolling usage mix",
      icon: BarChart3
    }
  ];

  const supportingPoints = [
    "Upload historical usage data — the system calculates your packaging mix % automatically",
    "Proprietary formulas maintain and adjust rolling usage percentages over time",
    "Combine mix % with forecasted order totals to generate accurate demand by packaging type",
    "Export demand plans for purchasing, inventory management, and vendor planning"
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
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-10 w-10 text-green-600" />
              <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">Demand Planner</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Automatically forecast packaging demand using
              <span className="text-green-600"> your historical usage rates</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Feed in usage data or forecasts to track trends, update demand plans in real-time, 
              and order the right packaging at the right time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Start Planning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline">
                    View Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0">
                  <div className="aspect-video w-full">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src="https://www.youtube.com/embed/dJyQ8qA0kl4?start=380"
                      title="Demand Planner Demo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Flowchart Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Demand Planner Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our 5-step process to forecast your packaging demand accurately
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
                        <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center relative z-10">
                          <Icon className="h-8 w-8 text-green-600" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {step.step}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-sm text-gray-600">{step.description}</p>
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
                  <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
                  <p className="text-gray-600">Forecast Accuracy</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-green-600">40%</div>
                    <p className="text-sm text-gray-600">Less Overstock</p>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-600">0</div>
                    <p className="text-sm text-gray-600">Stockouts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to master your inventory?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join companies who never worry about running out of packaging materials again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
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

export default DemandPlanner;