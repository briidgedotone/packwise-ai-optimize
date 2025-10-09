import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CookiePolicy = () => {
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookies Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: 9/9/2025</p>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This Cookies Policy explains how QuantiPack LLC ("Company," "we," "our," or "us") uses cookies and similar technologies when you visit or use the QuantiPackAI platform ("Service").
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files placed on your device by a website or app. They are widely used to make websites work efficiently, improve user experience, and provide usage information to service operators.
            </p>
            <p className="mb-4">Cookies may be:</p>
            <ul className="list-disc pl-6 space-y-1 mb-6">
              <li><strong>Session cookies:</strong> Deleted once you close your browser.</li>
              <li><strong>Persistent cookies:</strong> Remain until they expire or are deleted.</li>
              <li><strong>First-party cookies:</strong> Placed directly by us.</li>
              <li><strong>Third-party cookies:</strong> Placed by service providers (e.g., analytics tools).</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Types of Cookies We Use</h2>
            
            <div className="space-y-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Strictly Necessary Cookies</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Enable essential functions like login, account authentication, and session management.</li>
                  <li>Without these, the Service may not function properly.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Performance & Analytics Cookies</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Collect information about how users interact with the Service (e.g., most visited features, error logs).</li>
                  <li>Help us improve performance and usability.</li>
                  <li>Example: Google Analytics, Convex logs.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Remember user preferences (e.g., language, saved settings).</li>
                  <li>Enhance your personalized experience.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Security Cookies</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Help detect fraud, abuse, and unauthorized access.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies (if applicable)</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Track activity across services for targeted advertising or remarketing.</li>
                  <li>[Include only if you use marketing/retargeting tools.]</li>
                </ul>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Third-Party Cookies</h2>
            <p className="mb-4">
              We may allow trusted third-party providers to place cookies for analytics, hosting, and platform functionality. These providers include (but are not limited to):
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Hosting and infrastructure providers.</li>
              <li>Analytics providers (e.g., Google Analytics, Mixpanel).</li>
              <li>API partners (e.g., OpenAI, Convex logs, payment processors).</li>
            </ul>
            <p className="mb-6">
              We are not responsible for third-party cookie practices, which are governed by their own privacy policies.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. How to Manage Cookies</h2>
            <p className="mb-4">
              You can manage or disable cookies by adjusting your browser settings. Please note:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-6">
              <li>Disabling strictly necessary cookies may impair Service functionality.</li>
              <li>You can also opt out of certain analytics tools directly (e.g., via Google Analytics opt-out).</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Updates to This Policy</h2>
            <p className="mb-6">
              We may update this Cookies Policy to reflect changes in technology or applicable law. Updates will be posted on this page with a revised "Last Updated" date.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
            <p className="mb-6">
              For questions about this Cookies Policy, contact:
              <br />
              <strong>QuantiPack LLC</strong>
              <br />
              <a href="mailto:knammouz@quantipack.com" className="text-[#767AFA] hover:underline">
                knammouz@quantipack.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;