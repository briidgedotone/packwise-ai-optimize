import { MessageSquare, ArrowRight, Lightbulb, Clock, BookOpen, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const PackagingAiChatbot = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const features = [
    {
      icon: Lightbulb,
      title: "Expert Knowledge",
      description: "Tap into vast packaging expertise and best practices from industry professionals and data."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Get instant answers to packaging questions anytime, without waiting for human experts."
    },
    {
      icon: BookOpen,
      title: "Training Support",
      description: "Learn packaging fundamentals and advanced concepts through interactive Q&A sessions."
    }
  ];

  const benefits = [
    "Ask questions about platform features and functionality",
    "Get expert advice on packaging best practices",
    "Instant answers to technical packaging questions", 
    "Interactive training and learning support",
    "Access to comprehensive packaging knowledge base",
    "24/7 availability for immediate assistance"
  ];

  const exampleQuestions = [
    "What's the optimal box size for my product?",
    "How do I reduce packaging costs?",
    "What materials are best for sustainability?",
    "How do I calculate packaging efficiency?",
    "What are the latest packaging regulations?",
    "How do I improve my packaging design?"
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
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-8 w-8 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">AI Chatbot</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Your Packaging Expert,
                <span className="text-indigo-600"> On-Demand</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Ask questions about the platform or packaging best practices. Get instant answers 
                and expert guidance whenever you need it with our AI-powered packaging assistant.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-up">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    Start Chatting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">Unlimited</div>
                  <p className="text-gray-600">Questions Per Month</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-indigo-600">24/7</div>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-600">0</div>
                    <p className="text-sm text-gray-600">Tokens Used</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Your AI Packaging Assistant
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get expert guidance and instant answers to all your packaging questions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Example Questions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ask Anything About Packaging
            </h2>
            <p className="text-xl text-gray-600">
              Here are some examples of questions you can ask our AI assistant
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleQuestions.map((question, index) => (
              <div key={index} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium">{question}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                What You Get
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to get expert answers?
              </h3>
              <p className="text-gray-600 mb-6">
                Start chatting with our AI assistant and get the packaging expertise you need, when you need it.
              </p>
              <Link to="/sign-up">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Start Asking Questions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PackagingAiChatbot;