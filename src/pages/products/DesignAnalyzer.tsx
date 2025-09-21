import { Eye, ArrowRight, Camera, Award, Target, Package, Upload, Search, FileText, CheckCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const DesignAnalyzer = () => {
  const flowchartSteps = [
    {
      step: 1,
      title: "Upload Designs",
      description: "Your packaging designs + competitor designs",
      icon: Upload,
      visual: "Two thumbnails — 'Your Design' and 'Competitor'"
    },
    {
      step: 2,
      title: "Proprietary Evaluation Formulas",
      description: "Assess structure, branding, layout, and shelf presence",
      icon: Search,
      visual: "Magnifying glass over a package mockup"
    },
    {
      step: 3,
      title: "Grading & Scoring",
      description: "Receive grades across key criteria (visibility, clarity, sustainability, usability)",
      icon: Award,
      visual: "Report card with numeric or letter scores"
    },
    {
      step: 4,
      title: "Insights & Recommendations",
      description: "Identify areas to improve design for shelf impact",
      icon: Lightbulb,
      visual: "Checklist of recommendations next to a package"
    },
    {
      step: 5,
      title: "Shelf-Readiness Report",
      description: "Compare your design vs competitor benchmark with clear action steps",
      icon: FileText,
      visual: "'Your Design vs Competitor' comparison chart"
    }
  ];

  const supportingPoints = [
    "Upload your packaging designs alongside competitor examples for direct comparison",
    "Proprietary formulas grade design effectiveness and shelf-readiness",
    "Receive actionable insights to improve visibility, clarity, and impact",
    "Benchmark against competitors to ensure your product gets picked first"
  ];

  const criteria = [
    "Brand Visibility",
    "Premium Appeal", 
    "Shelf Impact",
    "Color Harmony",
    "Typography",
    "Layout Balance",
    "Information Hierarchy",
    "Target Audience Fit",
    "Market Differentiation",
    "Professional Presentation"
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
                <Button className="bg-[#767AFA] hover:bg-[#767AFA]/90">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Eye className="h-10 w-10 text-orange-600" />
              <span className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Design Analyzer</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Grade your packaging design against competitors
              <span className="text-orange-600"> and get insights to stand out on the shelf</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Upload artwork, dielines, or competitor packaging. Our AI grades your design, 
              highlights strengths and weaknesses, and compares it against competitors to ensure shelf standout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Analyze Design
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
              How Design Analyzer Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our 5-step process to optimize your packaging design
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
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-4 flex items-center justify-center relative z-10">
                          <Icon className="h-8 w-8 text-orange-600" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
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

      {/* Scoring Criteria Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              10-Criterion Scoring System
            </h2>
            <p className="text-xl text-gray-600">
              Rigorous analysis methodology focusing on what matters most for packaging success
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {criteria.map((criterion, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm font-medium text-gray-900">{criterion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supporting Points Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Key Benefits & Features
              </h2>
              <div className="space-y-4">
                {supportingPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">8.7/10</div>
                  <p className="text-gray-600">Average Design Score Improvement</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-orange-600">92%</div>
                    <p className="text-sm text-gray-600">Shelf Visibility</p>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-600">85%</div>
                    <p className="text-sm text-gray-600">Brand Appeal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to win on the shelf?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get professional design analysis that helps your products stand out and convert browsers to buyers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Start Free Trial
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

export default DesignAnalyzer;