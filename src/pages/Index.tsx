
import { ArrowRight, Package, TrendingUp, Zap, BarChart3, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: "Smart Packaging Optimization",
      description: "AI-powered analysis of your order data to reduce DIM weight charges and packaging waste"
    },
    {
      icon: TrendingUp,
      title: "Cost Savings Analytics",
      description: "Real-time insights into potential savings with detailed ROI calculations"
    },
    {
      icon: Zap,
      title: "Automated Spec Generation",
      description: "GPT-powered dimension estimation for missing product specifications"
    },
    {
      icon: BarChart3,
      title: "Advanced Reporting",
      description: "Comprehensive dashboards with exportable reports in PDF and Excel formats"
    }
  ];

  const plans = [
    {
      name: "Individual",
      price: "$49",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 100 orders/month",
        "Basic packaging optimization",
        "PDF reports",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Corporate",
      price: "$149",
      period: "/month",
      description: "Ideal for growing e-commerce businesses",
      features: [
        "Up to 500 orders/month",
        "Advanced AI analytics",
        "PDP shelf-appeal analyzer",
        "Priority support",
        "Custom integrations"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited orders",
        "Dedicated account manager",
        "Custom AI training",
        "White-label options",
        "SLA guarantee"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">QuantiPackAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <Button variant="outline" onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/signup')}>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-4 w-4 mr-1" />
            AI-Powered Packaging Intelligence
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Order Data Into
            <span className="text-blue-600 block">Packaging Savings</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Reduce DIM weight charges, eliminate packaging waste, and optimize your supply chain 
            with AI-driven insights from your existing order history.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/signup')}>
              Start Saving Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-600">30%</div>
              <div className="text-gray-600">Average DIM Savings</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-600">$50K+</div>
              <div className="text-gray-600">Annual Cost Reduction</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-purple-600">85%</div>
              <div className="text-gray-600">Fill Rate Improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Intelligent Packaging Optimization
            </h2>
            <p className="text-xl text-gray-600">
              Leverage AI to transform your packaging strategy and maximize efficiency
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Optimization Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start saving on packaging costs today with plans that scale with your business
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} hover:shadow-xl transition-all`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Shield className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate('/signup')}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Optimize Your Packaging Strategy?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of e-commerce brands already saving thousands on packaging costs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-semibold">QuantiPackAI</span>
            </div>
            <div className="text-gray-400">
              © 2024 QuantiPack LLC. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
