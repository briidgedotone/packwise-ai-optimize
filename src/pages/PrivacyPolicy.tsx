import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy and Cookies Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: 9/9/2025</p>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              QuantiPack LLC ("Company," "we," "our," or "us") values your privacy. This Privacy Policy explains how we collect, use, and protect personal information when you use the QuantiPackAI platform ("Service").
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              By accessing or using the Service, you consent to the practices described in this Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect the following categories of information:</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Account Information</h3>
                <p className="text-gray-700">Name, email address, company name, billing details, and subscription plan.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Usage Data</h3>
                <p className="text-gray-700">Logs of how you interact with the Service (e.g., modules accessed, frequency of use, Token consumption).</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Content Data</h3>
                <p className="text-gray-700">Files, datasets, and other materials you upload or input into the Service.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Technical Information</h3>
                <p className="text-gray-700">IP address, device/browser type, operating system, and system logs.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Payment Information</h3>
                <p className="text-gray-700">Processed through secure third-party providers (e.g., Stripe). We do not store full payment card details.</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Information</h2>
            <p className="mb-4">We use collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1 mb-6">
              <li>To operate, maintain, and improve the Service.</li>
              <li>To provide support, respond to inquiries, and send service updates.</li>
              <li>To manage subscriptions, billing, and account authentication.</li>
              <li>To monitor and analyze trends, usage, and security.</li>
              <li>To comply with legal obligations and enforce our Terms & Conditions.</li>
              <li>To conduct research and analytics using aggregated and anonymized data only.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Data Ownership & Processing</h2>
            <div className="space-y-2 mb-6">
              <p><strong>3.1</strong> You retain ownership of all Content you upload.</p>
              <p><strong>3.2</strong> We process Content solely to provide the Service.</p>
              <p><strong>3.3</strong> We may generate aggregated or anonymized insights from usage data for analytics and improvement. These outputs contain no personally identifiable information (PII).</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Sharing of Information</h2>
            <p className="mb-4">We do not sell or rent your personal information. We may share information in limited cases:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Service Providers:</strong> With third-party vendors (e.g., hosting providers, Convex, OpenAI, payment processors) who help us operate the Service.</li>
              <li><strong>Legal Compliance:</strong> If required by law, subpoena, or regulatory request.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              This Cookies Policy explains how QuantiPack LLC ("Company," "we," "our," or "us") uses cookies and similar technologies when you visit or use the QuantiPackAI platform ("Service").
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5.1 What Are Cookies?</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files placed on your device by a website or app. They are widely used to make websites work efficiently, improve user experience, and provide usage information to service operators.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">Cookies may be:</p>
            <ul className="list-disc pl-6 space-y-1 mb-6">
              <li><strong>Session cookies:</strong> Deleted once you close your browser.</li>
              <li><strong>Persistent cookies:</strong> Remain until they expire or are deleted.</li>
              <li><strong>First-party cookies:</strong> Placed directly by us.</li>
              <li><strong>Third-party cookies:</strong> Placed by service providers (e.g., analytics tools).</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5.2 Types of Cookies We Use</h3>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900">Strictly Necessary Cookies</h4>
                <p className="text-gray-700">Enable essential functions like login, account authentication, and session management. Without these, the Service may not function properly.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Performance & Analytics Cookies</h4>
                <p className="text-gray-700">Collect information about how users interact with the Service (e.g., most visited features, error logs). Help us improve performance and usability. Example: Google Analytics, Convex logs.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Functional Cookies</h4>
                <p className="text-gray-700">Remember user preferences (e.g., language, saved settings). Enhance your personalized experience.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Security Cookies</h4>
                <p className="text-gray-700">Help detect fraud, abuse, and unauthorized access.</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5.3 Third-Party Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may allow trusted third-party providers to place cookies for analytics, hosting, and platform functionality. These providers include (but are not limited to):
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Hosting and infrastructure providers.</li>
              <li>Analytics providers (e.g., Google Analytics, Mixpanel).</li>
              <li>API partners (e.g., OpenAI, Convex logs, payment processors).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              We are not responsible for third-party cookie practices, which are governed by their own privacy policies.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5.4 How to Manage Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can manage or disable cookies by adjusting your browser settings. Please note:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-6">
              <li>Disabling strictly necessary cookies may impair Service functionality.</li>
              <li>You can also opt out of certain analytics tools directly (e.g., via Google Analytics opt-out).</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Security</h2>
            <p className="mb-6">
              We use reasonable technical, organizational, and administrative measures to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. International Data Transfers</h2>
            <p className="mb-6">
              If you access the Service from outside the United States, your information may be transferred to and processed in the United States. We implement safeguards for international transfers where required by law.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Data Retention</h2>
            <p className="mb-6">
              We retain your information only as long as necessary to provide the Service, fulfill legal obligations, or enforce our rights. Upon account closure, we may retain limited information for compliance and security purposes.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have rights under applicable law (e.g., GDPR, CCPA), including:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Right to access and receive a copy of your data.</li>
              <li>Right to correct or update inaccurate information.</li>
              <li>Right to request deletion of your data.</li>
              <li>Right to opt out of certain processing (e.g., marketing communications).</li>
              <li>Right to data portability.</li>
            </ul>
            <p className="mb-6">
              To exercise these rights, contact us at <a href="mailto:knammouz@quantipack.com" className="text-[#767AFA] hover:underline">knammouz@quantipack.com</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Children's Privacy</h2>
            <p className="mb-6">
              The Service is not intended for individuals under 18. We do not knowingly collect data from minors.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to This Policy</h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised "Last Updated" date. Continued use of the Service constitutes acceptance of the revised Policy.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
            <p className="mb-6">
              For privacy-related questions, contact:
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

export default PrivacyPolicy;