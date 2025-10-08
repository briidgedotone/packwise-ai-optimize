import { SignUp } from "@clerk/clerk-react";
import { Package, CheckCircle, Zap, Shield, BarChart3 } from "lucide-react";
import { designSystem } from '@/lib/design-system';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

export default function SignUpPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const features = [
    {
      icon: BarChart3,
      title: "Packaging Analysis",
      description: "AI-powered optimization for your packaging suite"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get actionable insights in seconds, not hours"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data stays private and secure with enterprise-grade protection"
    }
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: designSystem.colors.background }}>
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between" style={{ backgroundColor: designSystem.colors.primary }}>
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">QuantiPackAI</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Transform Your Packaging Strategy
              </h1>
              <p className="text-xl text-white/80">
                Join thousands of brands using AI to optimize packaging, reduce costs, and improve sustainability.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-sm text-white/80">
          "QuantiPackAI helped us reduce packaging costs by 23% while improving our sustainability metrics."
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">QuantiPackAI</span>
          </div>
        </header>

        {/* Sign Up Content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Get Started
              </h1>
              <p className="text-gray-600">
                Create your account and start optimizing your packaging today
              </p>
            </div>

            {/* Policy Agreement Checkbox */}
            <div className="mb-6">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Checkbox
                  id="terms-agreement"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-1"
                />
                <label
                  htmlFor="terms-agreement"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms-of-service"
                    target="_blank"
                    className="font-medium hover:opacity-90 underline"
                    style={{ color: designSystem.colors.primary }}
                  >
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    className="font-medium hover:opacity-90 underline"
                    style={{ color: designSystem.colors.primary }}
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {!agreedToTerms && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Please accept the terms to continue with sign-up
                </p>
              )}
            </div>

            <div className="bg-white lg:bg-transparent rounded-3xl lg:rounded-none border lg:border-none border-gray-200 p-8 lg:p-0 relative">
              {/* Overlay when terms not agreed */}
              {!agreedToTerms && (
                <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-sm rounded-3xl lg:rounded-none z-10 cursor-not-allowed" />
              )}

              <SignUp
                forceRedirectUrl="/onboarding"
                appearance={{
                  elements: {
                    formButtonPrimary: `bg-[${designSystem.colors.primary}] hover:opacity-90 text-white font-medium rounded-full`,
                    card: "shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-gray-500",
                    formFieldInput: `border-gray-200 focus:border-[${designSystem.colors.primary}] focus:ring-[${designSystem.colors.primary}] rounded-3xl`,
                    footerActionLink: `text-[${designSystem.colors.primary}] hover:opacity-90`,
                  },
                  layout: {
                    socialButtonsPlacement: "top",
                  },
                }}
              />
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/sign-in" className="font-medium hover:opacity-90" style={{ color: designSystem.colors.primary }}>
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}