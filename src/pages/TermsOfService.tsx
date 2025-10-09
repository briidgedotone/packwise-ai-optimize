import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">Last Updated: 9/9/2025</p>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              These Terms & Conditions ("Terms") govern access to and use of the QuantiPackAI platform ("Service"), operated by QuantiPack LLC ("Company," "we," "our," or "us"). By creating an account, subscribing, or otherwise using the Service, you ("User," "you," or "Customer") agree to these Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Definitions</h2>
            <div className="space-y-2 mb-6">
              <p><strong>Service:</strong> The QuantiPackAI software-as-a-service platform, including modules such as Suite Analyzer, Demand Planner, Design Analyzer, Spec Generator, and any future modules.</p>
              <p><strong>Tokens:</strong> Units of access purchased under a subscription plan, consumed when running a function within the Service.</p>
              <p><strong>Content:</strong> Data, files, or materials uploaded, processed, or generated through the Service.</p>
              <p><strong>Third-Party Providers:</strong> External platforms, APIs, and infrastructure (e.g., Convex, OpenAI, hosting providers, frontend frameworks).</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Eligibility & Accounts</h2>
            <div className="space-y-2 mb-6">
              <p><strong>2.1</strong> You must be at least 18 years old to use the Service.</p>
              <p><strong>2.2</strong> You are responsible for maintaining the confidentiality of your account credentials and all activity under your account.</p>
              <p><strong>2.3</strong> Accounts may be created on behalf of a business entity. In that case, you represent you are authorized to bind the entity to these Terms.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Use of Service</h2>
            <div className="space-y-2 mb-6">
              <p><strong>3.1</strong> You may use the Service solely for lawful purposes and in accordance with these Terms.</p>
              <p><strong>3.2</strong> You may not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Reverse engineer, resell, or provide unauthorized access to the Service.</li>
                <li>Use the Service to process unlawful, harmful, or infringing data.</li>
                <li>Attempt to bypass technical or security measures.</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Subscription & Tokens</h2>
            <div className="space-y-2 mb-6">
              <p><strong>4.1</strong> Subscription plans allocate a set number of Tokens each month. Tokens restock on a monthly basis and do not roll over.</p>
              <p><strong>4.2</strong> Tokens have no monetary value and cannot be transferred, refunded, or exchanged.</p>
              <p><strong>4.3</strong> Upon cancellation of a subscription, all unused Tokens are immediately void.</p>
              <p><strong>4.4</strong> Pricing, Token allotments, and subscription tiers may be updated by the Company at its discretion.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data & Content</h2>
            <div className="space-y-2 mb-6">
              <p><strong>5.1</strong> You retain ownership of your uploaded Content.</p>
              <p><strong>5.2</strong> By using the Service, you grant the Company a non-exclusive, worldwide license to process Content for the purpose of operating the Service.</p>
              <p><strong>5.3</strong> The Company may collect and analyze aggregated and anonymized usage data (e.g., features used, frequency of use, performance metrics) for the purposes of improving the Service, analytics, and security monitoring.</p>
              <p><strong>5.4</strong> The Company will not sell your personal or confidential business data.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. AI & Output Disclaimer</h2>
            <div className="space-y-2 mb-6">
              <p><strong>6.1</strong> The Service leverages third-party AI models (e.g., GPT API). Outputs may be inaccurate, incomplete, or biased.</p>
              <p><strong>6.2</strong> You acknowledge that you are solely responsible for reviewing and validating any outputs before relying on them.</p>
              <p><strong>6.3</strong> The Company provides no warranties that outputs are fit for a particular purpose.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Third-Party Providers</h2>
            <div className="space-y-2 mb-6">
              <p><strong>7.1</strong> The Service depends on third-party platforms (including Convex, OpenAI, hosting and frontend frameworks).</p>
              <p><strong>7.2</strong> The Company is not responsible for downtime, outages, performance issues, or data handling practices of these providers.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Suspension & Termination</h2>
            <div className="space-y-2 mb-6">
              <p><strong>8.1</strong> The Company reserves the right to suspend or terminate access immediately if:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You breach these Terms.</li>
                <li>Your account is involved in misuse, security risk, or unlawful activity.</li>
              </ul>
              <p><strong>8.2</strong> The Company may discontinue the Service or any part of it at any time with reasonable notice.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Intellectual Property</h2>
            <div className="space-y-2 mb-6">
              <p><strong>9.1</strong> The Service, including its code, design, trademarks, and proprietary algorithms, is owned by the Company.</p>
              <p><strong>9.2</strong> You may not copy, distribute, or create derivative works of the Service without written consent.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Warranties & Disclaimers</h2>
            <div className="space-y-2 mb-6">
              <p><strong>10.1</strong> The Service is provided "as is" and "as available" without warranties of any kind.</p>
              <p><strong>10.2</strong> The Company disclaims all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Limitation of Liability</h2>
            <div className="space-y-2 mb-6">
              <p><strong>11.1</strong> To the fullest extent permitted by law, the Company shall not be liable for indirect, incidental, consequential, punitive, or special damages.</p>
              <p><strong>11.2</strong> The Company's total liability shall not exceed the amount paid by you to the Company in the twelve (12) months preceding the claim.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Indemnification</h2>
            <p className="mb-6">
              You agree to indemnify and hold harmless the Company from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of third-party rights.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Governing Law & Jurisdiction</h2>
            <p className="mb-6">
              These Terms are governed by the laws of South Carolina or California (at the Company's election), without regard to conflict of law principles. You agree to the exclusive jurisdiction of courts located in Los Angeles, CA or Greenville, SC.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. Changes to Terms</h2>
            <p className="mb-6">
              The Company may update these Terms from time to time. Continued use of the Service constitutes acceptance of the revised Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">15. Contact</h2>
            <p className="mb-6">
              For questions regarding these Terms, contact:
              <br />
              <strong>QuantiPack LLC</strong>
              <br />
              <a href="mailto:Knammouz@quantipack.com" className="text-[#767AFA] hover:underline">
                Knammouz@quantipack.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;