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

const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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

  // Pricing data
  const pricingPlans = [
    {
      name: "Starter",
      price: "$39.99",
      period: "/month",
      tokens: "50 tokens/month",
      features: [
        "✓ 50 tokens per month",
        "✓ All applications included", 
        "✓ Email support",
        "✓ Basic analytics",
        "✓ CSV export"
      ],
      cta: "Start Now",
      popular: false
    },
    {
      name: "Professional",
      price: "$99.99", 
      period: "/month",
      tokens: "150 tokens/month",
      features: [
        "✓ 150 tokens per month",
        "✓ All applications included",
        "✓ Priority support", 
        "✓ Advanced analytics",
        "✓ API access",
        "✓ Custom reports"
      ],
      cta: "Start Now",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Contact Us",
      period: "",
      tokens: "Custom",
      features: [
        "✓ Flexible token bundle and pricing",
        "✓ All applications included",
        "✓ Dedicated success manager",
        "✓ API access and advanced support", 
        "✓ Custom integrations",
        "✓ Training and onboarding"
      ],
      cta: "Contact Sales", 
      popular: false
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "QuantiPackAI identified $200K in annual savings we didn't know existed. The Suite Analyzer paid for itself in the first week.",
      author: "Sarah Chen",
      title: "VP of Operations, FreshGoods Inc.",
      rating: 5
    },
    {
      quote: "The Demand Planner eliminated our stockouts completely. We haven't had a packaging shortage in 6 months.",
      author: "Michael Torres", 
      title: "Supply Chain Manager, DirectShip Co.",
      rating: 5
    },
    {
      quote: "The Design Analyzer helped us increase shelf appeal by 40%. Our products finally stand out against competitors.",
      author: "Emily Watson",
      title: "Brand Manager, ConsumerFirst", 
      rating: 5
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How do tokens work?",
      answer: "Each time you run a core function (analysis, spec batch, design compare), you use a token. Tokens reset monthly based on your plan."
    },
    {
      question: "Can I bring my historical data?",
      answer: "Yes. Upload order history and packaging types via CSV/XLSX with our templates. We support most common formats."
    },
    {
      question: "What if I run out of tokens?",
      answer: "You can add tokens anytime or upgrade your plan. We'll notify you when you're running low."
    },
    {
      question: "Is my data secure?", 
      answer: "We encrypt your data in transit and at rest. Your data is never shared and you can delete it anytime."
    },
    {
      question: "Do you offer trials?",
      answer: "We offer a 14-day money-back guarantee on all plans. Book a walkthrough to see the platform in action."
    },
    {
      question: "Can I cancel or change plans?",
      answer: "Yes, you can change or cancel at the end of any billing cycle. No long-term contracts required."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">QuantiPackAI</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#product" className="text-gray-600 hover:text-blue-600 transition-colors">Product</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</a>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/sign-in">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/sign-up">
                <Button className="bg-blue-600 hover:bg-blue-700">Start Now</Button>
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
                <a href="#product" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Product</a>
                <a href="#how-it-works" className="block px-3 py-2 text-gray-600 hover:text-blue-600">How it Works</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Pricing</a>
                <a href="#faq" className="block px-3 py-2 text-gray-600 hover:text-blue-600">FAQ</a>
                <div className="flex flex-col space-y-2 px-3 pt-4">
                  <Link to="/sign-in">
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link to="/sign-up">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Optimize Your Packaging.
              <br />
              <span className="text-blue-600">Maximize Your Savings.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              QuantiPackAI turns your packaging data into profit. Determine your optimal packaging suite, 
              forecast savings, track demand, generate specs, analyze designs, and get answers instantly 
              with our Packaging AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Start Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                View Plans
              </Button>
            </div>
          </div>

          {/* Hero Visual Placeholder */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Dashboard Overview</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Tokens:</span>
                  <Badge className="bg-green-100 text-green-800">127/150</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {toolSteps.slice(0, 5).map((tool, index) => (
                  <Card key={index} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <tool.icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-sm">{tool.name}</h4>
                      </div>
                      <p className="text-xs text-gray-600">Ready to analyze</p>
                    </CardContent>
                  </Card>
                ))}
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-xs font-medium">$47,230</p>
                      <p className="text-xs text-gray-600">Monthly Savings</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
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
      <section id="product" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Slash costs. Reduce waste. Stay ahead.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
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
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {tool.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{tool.name}</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{tool.description}</p>
                </div>
                <div className="flex-1">
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-8">
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <tool.icon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
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
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, token-based plans for any scale
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is included. Each time you run an application (Suite Analyzer, Demand Planner, 
              Spec Generator, Design Analyzer, Chatbot), it uses one token. Choose the token bundle that fits your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-blue-600 font-semibold mt-2">{plan.tokens}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-gray-700">
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.cta === "Contact Sales" ? "/contact" : "/sign-up"} className="block">
                    <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by packaging professionals worldwide
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 text-lg italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-gray-600 text-sm">{testimonial.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">{faq.question}</CardTitle>
                    <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
                {openFAQ === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to make packaging a profit center?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            See how QuantiPackAI finds savings and prevents stockouts in your exact environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-12 py-4">
                Start Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Column 1 - Company */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">QuantiPackAI</span>
              </div>
              <p className="text-gray-400 mb-4">AI-powered packaging optimization</p>
              <p className="text-gray-500 text-sm">© 2024 QuantiPackAI. All rights reserved.</p>
            </div>

            {/* Column 2 - Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Suite Analyzer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demand Planner</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Spec Generator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Design Analyzer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Packaging AI Chatbot</a></li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Column 4 - Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
              </ul>
            </div>

            {/* Column 5 - Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">Stay updated</h4>
              <p className="text-gray-400 text-sm mb-4">Get packaging optimization tips and product updates</p>
              <div className="flex flex-col space-y-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex space-x-6 text-gray-400 text-sm">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  LinkedIn
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">YouTube</span>
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;