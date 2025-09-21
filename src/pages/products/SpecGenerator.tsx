import { Brain, ArrowRight, FileText, Zap, Calculator, Package, FileInput, Search, Database, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const SpecGenerator = () => {
  const flowchartSteps = [
    {
      step: 1,
      title: "Upload Product Names",
      description: "Text list of products (e.g., 'toothbrush,' 'running shoes')",
      icon: FileInput,
      visual: "Text file with a product list"
    },
    {
      step: 2,
      title: "Proprietary Research Formulas",
      description: "Determine typical product dimensions from curated references",
      icon: Search,
      visual: "Magnifying glass over a database/reference icon"
    },
    {
      step: 3,
      title: "Generate Product Specs",
      description: "Outputs product L × W × H (with sensible bounds if needed)",
      icon: Calculator,
      visual: "Product silhouette with L/W/H callouts"
    },
    {
      step: 4,
      title: "Usable Data Output",
      description: "Delivers structured spec rows in CSV or table format",
      icon: FileText,
      visual: "Tidy table: Product → L × W × H"
    }
  ];

  const supportingPoints = [
    "Quickly generate product dimensions from simple text inputs",
    "Proprietary formulas ensure reliable, reusable specs without manual research",
    "Provides the foundation needed to analyze packaging fits and opportunities"
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
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="h-10 w-10 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Spec Generator</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Turn simple product names into
              <span className="text-purple-600"> reliable product dimensions</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Simply enter product names or short descriptions. Our tool generates estimated product dimensions 
              and volume with explanations of the logic used for accurate packaging planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Generate Specs
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
              How Spec Generator Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our streamlined 4-step process to generate reliable product specifications
            </p>
          </div>

          {/* Horizontal Flowchart */}
          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gray-200"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {flowchartSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center relative z-10">
                          <Icon className="h-8 w-8 text-purple-600" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
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

      {/* Example Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600">
              Transform product names into structured specifications instantly
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Input: Product Names</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div className="space-y-1">
                  <div>• iPhone 14 Pro</div>
                  <div>• Running shoes</div>
                  <div>• Coffee mug</div>
                  <div>• Laptop bag</div>
                  <div>• Wireless headphones</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Output: Product Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-left py-2">L</th>
                      <th className="text-left py-2">W</th>
                      <th className="text-left py-2">H</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr><td>iPhone 14 Pro</td><td>6.1</td><td>2.8</td><td>0.3</td></tr>
                    <tr><td>Running shoes</td><td>12.0</td><td>4.5</td><td>5.0</td></tr>
                    <tr><td>Coffee mug</td><td>4.0</td><td>3.5</td><td>4.0</td></tr>
                    <tr><td>Laptop bag</td><td>16.0</td><td>12.0</td><td>3.0</td></tr>
                    <tr><td>Wireless headphones</td><td>8.0</td><td>7.0</td><td>3.0</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
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
                    <CheckCircle className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">10x</div>
                  <p className="text-gray-600">Faster Than Manual Research</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-purple-600">95%</div>
                    <p className="text-sm text-gray-600">Accuracy Rate</p>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-600">1000+</div>
                    <p className="text-sm text-gray-600">Products/Hour</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to accelerate your workflow?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform hours of manual work into seconds of AI-powered generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
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

export default SpecGenerator;