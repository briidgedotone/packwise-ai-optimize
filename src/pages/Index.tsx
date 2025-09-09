
import { useState } from "react";
import { ArrowRight, Package, Brain, TrendingUp, Eye, Shield, CheckCircle, Upload, BarChart3, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState("core");

  const features = [
    {
      icon: Package,
      title: "Packaging Suite Analyzer",
      subtitle: "Fix your packaging mix. Save big.",
      description: "Upload your order history and packaging types. Instantly see how each order should've been packed, where you're losing money, and what changes would drive efficiency.",
      users: "Logistics, Operations, Packaging, Procurement",
      delivers: [
        "Optimized packaging allocation",
        "Fill rate analysis", 
        "Cost, volume, and material savings",
        "Packaging improvement suggestions",
        "Executive export (CSV/PDF)"
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Brain,
      title: "Spec Generator",
      subtitle: "No dimensions? No delay.",
      description: "Upload a product list. QuantiPackAI uses industry logic + your size range to generate realistic packaging specs instantly.",
      users: "Packaging, Design, Sourcing, Analytics",
      delivers: [
        "AI-estimated L×W×H and CUIN",
        "Notes on each estimate",
        "Clean spec table (CSV/PDF)",
        "Ready for modeling, quoting, planning"
      ],
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: TrendingUp,
      title: "Packaging Demand Planner",
      subtitle: "Know exactly how much packaging you need.",
      description: "Upload your forecasted product volumes — QuantiPackAI calculates packaging quantities based on fit, volume, and efficiency.",
      users: "Fulfillment, DCs, 3PLs, Supply Chain",
      delivers: [
        "Quantity needed per package type",
        "Fill rate + cost efficiency",
        "Packaging waste + material impact",
        "Forecast-ready demand report"
      ],
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Eye,
      title: "Design Analyzer",
      subtitle: "Win on shelf. Beat the competition.",
      description: "Upload your principal display panel and compare it against competitors. QuantiPackAI scores and explains your design's strengths — and tells you exactly how to improve it.",
      users: "Brand, Creative, Packaging Design, Marketing",
      delivers: [
        "0–10 visual performance scores",
        "Competitor benchmarking",
        "Heatmap + radar visuals",
        "GPT-backed design fixes",
        "Shareable PDF report"
      ],
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const plans = [
    {
      name: "Individual",
      price: "$49",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "100 orders/month analysis",
        "Basic packaging optimization",
        "CSV/PDF exports",
        "Email support"
      ]
    },
    {
      name: "Corporate",
      price: "$199",
      period: "/month",
      description: "For growing companies with higher volumes",
      features: [
        "500 orders/month analysis",
        "Advanced AI recommendations",
        "Priority support",
        "Custom reporting",
        "API access"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited order analysis",
        "White-label solutions",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantees"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">QuantiPackAI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/sign-in">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/sign-up">
                <Button className="bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            The World's First Packaging Analysis AI
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The Smartest Packaging
            <br />
            <span className="text-blue-600">Decisions You've Ever Made</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            QuantiPackAI uses AI to analyze, generate, and forecast packaging strategies that cut cost, reduce waste, and give you an edge from warehouse to shelf.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                Start Saving Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Core Value Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              One Platform. Four Powerful Functions. All Results.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-700">
                    {feature.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Used by:</p>
                    <p className="text-sm text-blue-600">{feature.users}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Delivers:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {feature.delivers.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Make Every Packaging Decision a Sustainability Win
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Reduce excess volume. Cut material waste. Improve fit.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Eliminate packaging bloat",
              "Lower packaging emissions", 
              "Track real waste reduction in CUIN, lbs, and dollars",
              "Meet your packaging sustainability goals — with proof"
            ].map((benefit, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-700">{benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Privacy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Data Stays Private. Always.
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Your data is your IP — and we treat it that way.
              </p>
              <ul className="space-y-4">
                {[
                  "We never sell, share, or scrape your files",
                  "Every recommendation is explainable and logic-driven",
                  "We believe in AI that works for you, not behind your back"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Shield className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <div className="text-center">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Enough to Handle Messy Data</h3>
                <p className="text-gray-600">
                  Don't have perfect specs? No problem. QuantiPackAI fills in missing fields using industry benchmarks, real-world product logic, and your reference dimensions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Smarter Packaging Starts Now
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your packaging optimization needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.name === 'Corporate' ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}>
                {plan.name === 'Corporate' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/sign-up" className="block mt-6">
                    <Button className={`w-full ${plan.name === 'Corporate' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                      {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Packaging Strategy?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of brands already saving money and reducing waste with QuantiPackAI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">QuantiPackAI</span>
              </div>
              <p className="text-gray-400">
                The world's first AI-powered packaging analysis platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Suite Analyzer</li>
                <li>Spec Generator</li>
                <li>Demand Planner</li>
                <li>Design Analyzer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QuantiPackAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
