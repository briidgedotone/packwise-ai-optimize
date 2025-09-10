import { SignIn } from "@clerk/clerk-react";
import { Package } from "lucide-react";
import { designSystem } from '@/lib/design-system';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: designSystem.colors.background }}>
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
            <Package className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">QuantiPackAI</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access your packaging optimization dashboard
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-8">
            <SignIn 
              forceRedirectUrl="/dashboard"
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
              Don't have an account?{" "}
              <a href="/sign-up" className="font-medium hover:opacity-90" style={{ color: designSystem.colors.primary }}>
                Sign up for free
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500">
        © 2024 QuantiPackAI. All rights reserved.
      </footer>
    </div>
  );
}