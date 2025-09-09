import { useState } from "react";
import { 
  ArrowRight, 
  Package, 
  Brain, 
  TrendingUp, 
  Eye, 
  MessageSquare,
  DollarSign,
  BarChart3,
  Zap,
  Trophy,
  HeadphonesIcon,
  Activity,
  ChevronDown,
  Star,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import PricingSection from "@/components/ui/pricing";
import TestimonialSection from "@/components/ui/testimonials";
import Footer from "@/components/ui/footer";
import FAQSection from "@/components/ui/faq";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Benefits data
  const benefits = [
    {
      icon: DollarSign,
      title: "Eliminate Waste and Slash Packaging Costs",
      description: "Cut unnecessary material spend, right-size your packaging, and lower overall carrier billing by shipping more efficiently—all while improving sustainability.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: BarChart3,
      title: "Never Be Caught Short", 
      description: "Forecast packaging demand with precision so you always have the right materials in stock, avoiding costly delays or over-ordering.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Zap,
      title: "Clean and Accelerate Your Data",
      description: "Instantly generate accurate product dimensions and volume estimates to replace messy or incomplete data, speeding up vendor handoffs, analysis, and planning.",
      color: "text-purple-600", 
      bgColor: "bg-purple-50"
    },
    {
      icon: Trophy,
      title: "Dominate the Shelf",
      description: "Grade your packaging design and compare it to competitors so your products stand out and win more customers.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: HeadphonesIcon,
      title: "Your Packaging Expert, On-Call",
      description: "Get instant answers to technical and strategic packaging questions anytime with the built-in Packaging AI Chatbot.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Activity,
      title: "Measure Impact Instantly",
      description: "Track your optimization progress with real-time dashboards showing cost savings, sustainability improvements, and efficiency gains.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  // How it works data
  const toolSteps = [
    {
      step: 1,
      name: "Suite Analyzer",
      description: "Upload your order history and packaging list, and the AI finds your optimal packaging mix, forecasting cost and sustainability savings you can actually measure. It also compares your current packaging mix to a baseline, highlighting gaps and inefficiencies, and recommends improved packaging dimensions to increase fill rates so you can see exactly where to improve and how to pack out more effectively.",
      icon: Package
    },
    {
      step: 2, 
      name: "Demand Planner",
      description: "Feed in usage data or forecasts (by quantity or percentage). The AI tracks trends, updates demand plans in real time, and helps you order the right packaging at the right time.",
      icon: TrendingUp
    },
    {
      step: 3,
      name: "Spec Generator", 
      description: "Simply enter product names or short descriptions. The tool generates estimated product dimensions and volume, along with a note explaining the logic it used, so you can plan packaging more accurately and clean up incomplete data.",
      icon: Brain
    },
    {
      step: 4,
      name: "Design Analyzer",
      description: "Upload artwork, dielines, or competitor packaging. The AI grades your design, highlights strengths and weaknesses, and compares it against competitors or alternative concepts so you can make sure your packaging stands out on the shelf.",
      icon: Eye
    },
    {
      step: 5,
      name: "Packaging AI Chatbot",
      description: "Ask questions about the platform or packaging best practices. It's your on-demand expert for quick answers and training support.",
      icon: MessageSquare
    }
  ];




  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <header className="backdrop-blur-sm sticky top-0 z-50" style={{ backgroundColor: 'rgba(247, 246, 249, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#767AFA' }}>
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">QuantiPackAI</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#product" className="text-gray-600 hover:text-[#767AFA] transition-colors">Product</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#767AFA] transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#767AFA] transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-[#767AFA] transition-colors">FAQ</a>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/sign-in">
                <Button variant="ghost" className="rounded-full">Login</Button>
              </Link>
              <Link to="/sign-up">
                <Button style={{ backgroundColor: '#767AFA' }} className="hover:opacity-90 rounded-full">Start Now</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#product" className="block px-3 py-2 text-gray-600 hover:text-[#767AFA]">Product</a>
                <a href="#how-it-works" className="block px-3 py-2 text-gray-600 hover:text-[#767AFA]">How it Works</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-[#767AFA]">Pricing</a>
                <a href="#faq" className="block px-3 py-2 text-gray-600 hover:text-[#767AFA]">FAQ</a>
                <div className="flex flex-col space-y-2 px-3 pt-4">
                  <Link to="/sign-in">
                    <Button variant="ghost" className="w-full rounded-full">Login</Button>
                  </Link>
                  <Link to="/sign-up">
                    <Button className="w-full hover:opacity-90 rounded-full" style={{ backgroundColor: '#767AFA' }}>Start Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F6F9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8" style={{ lineHeight: '1.3' }}>
              Optimize Your Packaging.
              <br />
              <span style={{ color: '#767AFA' }}>Maximize Your Savings.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              QuantiPackAI turns your packaging data into profit. Determine your optimal packaging suite, 
              forecast savings, track demand, generate specs, analyze designs, and get answers instantly 
              with our Packaging AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button size="lg" className="text-lg px-8 py-4 hover:opacity-90 rounded-full" style={{ backgroundColor: '#767AFA' }}>
                  Start Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 rounded-full">
                View Plans
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="p-8 md:p-12 max-w-6xl mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-center relative z-10">
              {/* Left Panel */}
              <div className="lg:col-span-3 space-y-6 bg-white rounded-3xl p-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#767AFA20' }}>
                  <Package className="h-6 w-6" style={{ color: '#767AFA' }} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Your packaging costs today
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Optimize costs, reduce waste,<br />
                    and maximize efficiency<br />
                    with AI-powered insights.
                  </p>
                </div>
              </div>

              {/* Center Panel */}
              <div className="lg:col-span-4 text-center space-y-6 bg-white rounded-3xl p-6">
                {/* Impact Visualization */}
                <div className="space-y-4">
                  {/* Main Savings Number with Growth Indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+23% this month</span>
                    </div>
                    <div className="text-6xl md:text-7xl font-bold text-gray-900">
                      $147K
                    </div>
                    <p className="text-gray-600 text-lg">Potential annual savings</p>
                  </div>

                  {/* Progress Visualization */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Current efficiency</span>
                      <span className="font-medium text-gray-700">67%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full relative overflow-hidden" 
                        style={{ backgroundColor: '#767AFA', width: '67%' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-xs text-gray-500">Target:</span>
                      <span className="text-xs font-medium" style={{ color: '#767AFA' }}>85% efficiency</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Metrics */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="flex flex-col items-center justify-center px-4 py-3 bg-green-50 rounded-2xl">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">35%</div>
                      <div className="text-xs text-green-600">cost reduction</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center px-4 py-3 bg-blue-50 rounded-2xl">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-700">42%</div>
                      <div className="text-xs text-blue-600">less waste</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Badges */}
              <div className="lg:col-span-3 space-y-4 bg-white rounded-3xl p-6">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#767AFA' }}>
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">AI-POWERED</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-2xl border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">REAL-TIME</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">DATA-DRIVEN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F6F9' }}>
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-8">
            Trusted by packaging professionals at
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 h-12 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Logo {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="product" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F6F9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Slash costs. Reduce waste. Stay ahead.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 ${benefit.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F6F9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              All-in-one tools, each built for a different job
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              QuantiPackAI isn't one-size-fits-all. Each application works differently to give you 
              exactly what you need—from analytics to planning to design checks.
            </p>
          </div>
          
          <div className="space-y-16">
            {toolSteps.map((tool, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#767AFA' }}>
                      {tool.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{tool.name}</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{tool.description}</p>
                </div>
                <div className="flex-1">
                  <Card className="bg-white">
                    <CardContent className="p-8">
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <tool.icon className="h-16 w-16 mx-auto mb-4" style={{ color: '#767AFA' }} />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{tool.name} Interface</h4>
                        <p className="text-gray-600 text-sm">Screenshot placeholder</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <TestimonialSection />

      {/* FAQ Section */}
      <FAQSection />


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;