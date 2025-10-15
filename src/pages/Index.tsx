import { useState, useEffect, useRef } from "react";
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import PricingSection from "@/components/ui/pricing";
import TestimonialSection from "@/components/ui/testimonials";
import Footer from "@/components/ui/footer";
import FAQSection from "@/components/ui/faq";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [dropdownPinned, setDropdownPinned] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductDropdownOpen(false);
        setDropdownPinned(false);
      }
    };

    if (productDropdownOpen && dropdownPinned) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [productDropdownOpen, dropdownPinned]);

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
      description: "Upload your order history and packaging list. AI finds your optimal packaging mix and forecasts measurable cost and sustainability savings.",
      icon: Package
    },
    {
      step: 2, 
      name: "Demand Planner",
      description: "Feed in usage data or forecasts. AI tracks trends, updates demand plans in real time, and helps you order the right packaging at the right time.",
      icon: TrendingUp
    },
    {
      step: 3,
      name: "Spec Generator", 
      description: "Simply enter product names or descriptions. AI generates estimated dimensions and volume with explanations to clean up incomplete data.",
      icon: Brain
    },
    {
      step: 4,
      name: "Design Analyzer",
      description: "Upload artwork, dielines, or competitor packaging. AI grades your design and compares it against competitors to ensure shelf standout.",
      icon: Eye
    },
    {
      step: 5,
      name: "Packaging AI Chatbot",
      description: "Ask questions about the platform or packaging best practices. Your on-demand expert for quick answers and training support.",
      icon: MessageSquare
    }
  ];




  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6FF', fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Hero Section with Navigation */}
      <section className="bg-cover bg-center bg-no-repeat relative" style={{ backgroundColor: '#F7F6F9', backgroundImage: 'url(/bg.png)' }}>
        {/* Gradient fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, transparent, #F6F6FF)' }}></div>
        {/* Navigation Bar */}
        <header className="backdrop-blur-sm sticky top-0 z-50 relative" style={{ backgroundColor: 'transparent' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <img src="/quantipack logo.png" alt="QuantiPackAI Logo" className="h-12" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                <div
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => !dropdownPinned && setProductDropdownOpen(true)}
                  onMouseLeave={() => !dropdownPinned && setProductDropdownOpen(false)}
                >
                  <button
                    className="flex items-center text-gray-600 hover:text-[#767AFA] transition-colors"
                    onClick={() => {
                      if (dropdownPinned) {
                        // If already pinned, unpin and close
                        setDropdownPinned(false);
                        setProductDropdownOpen(false);
                      } else {
                        // If not pinned, pin and open
                        setDropdownPinned(true);
                        setProductDropdownOpen(true);
                      }
                    }}
                  >
                    Product
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {productDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                      <div className="p-2">
                        {toolSteps.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <Link
                              key={tool.step}
                              to={`/product/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#767AFA]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#767AFA]/20 transition-colors">
                                <Icon className="h-4 w-4 text-[#767AFA]" />
                              </div>
                              <span className="font-medium text-gray-900 text-sm">{tool.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => setShowVideoDialog(true)} className="text-gray-600 hover:text-[#767AFA] transition-colors">How it Works</button>
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
                  {/* Mobile Product Dropdown */}
                  <div>
                    <button 
                      onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                      className="flex items-center justify-between w-full px-3 py-2 text-gray-600 hover:text-[#767AFA]"
                    >
                      Product
                      <ChevronDown className={`h-4 w-4 transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {productDropdownOpen && (
                      <div className="pl-4 space-y-1">
                        {toolSteps.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <Link
                              key={tool.step}
                              to={`/product/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-[#767AFA] hover:bg-gray-50 rounded-lg"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{tool.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowVideoDialog(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block px-3 py-2 text-gray-600 hover:text-[#767AFA] w-full text-left"
                  >
                    How it Works
                  </button>
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

        {/* Hero Content */}
        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
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
              <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 rounded-full">
                    How it Works
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0">
                  <div className="aspect-video w-full">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src="https://www.youtube.com/embed/dJyQ8qA0kl4"
                      title="How QuantiPackAI Works - Founder Explanation"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
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
                      <span className="text-gray-500">Current Fill Rate</span>
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
                      <span className="text-xs font-medium" style={{ color: '#767AFA' }}>85% Fill Rate</span>
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
        </div>
      </section>


      {/* Benefits Section */}
      <section id="product" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'transparent' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Slash costs. Reduce waste. Stay ahead.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 border border-gray-200">
                <div className={`w-12 h-12 ${benefit.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'transparent' }}>
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
          
          <div className="space-y-20">
            {toolSteps.map((tool, index) => (
              <div key={index} className={`flex flex-col items-center gap-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                <div className="w-full lg:w-1/2 max-w-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#767AFA' }}>
                      {tool.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{tool.name}</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">{tool.description}</p>
                  <Link to={`/product/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button className="bg-[#767AFA] hover:bg-[#767AFA]/90">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="w-80 h-80 bg-white rounded-3xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-center w-full h-full" style={{ backgroundColor: '#FEFEFB' }}>
                      <img 
                        src={`/box-${tool.step}.png`} 
                        alt={`${tool.name} visualization`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
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