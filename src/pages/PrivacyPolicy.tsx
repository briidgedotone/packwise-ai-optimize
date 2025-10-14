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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy & Cookies Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: October 13, 2025</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This combined Privacy & Cookies Policy explains how QuantiPack LLC ("Company," "we," "our," or "us") collects, uses, protects, and discloses personal information, and how cookies and similar technologies are used when you access or use the QuantiPackAI platform and related services ("Service").
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              By accessing or using the Service, you agree to the terms of this Policy. If you do not agree, please discontinue use of the Service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4 text-gray-700">We collect and process limited information necessary to operate and improve the Service. This may include:</p>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Account Information</h3>
                <p className="text-gray-700">Name, email address, company name, billing details, and subscription plan.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Usage Data</h3>
                <p className="text-gray-700 mb-2">Non-personal metrics such as login timestamps, token consumption, module access frequency, and general system interactions to ensure platform performance and reliability.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Content Data</h3>
                <p className="text-gray-700 mb-2">Files, datasets, or text you voluntarily upload or input while using the Service.</p>
                <p className="text-gray-700 font-semibold">We do not permanently store this data. Uploaded or generated content is processed in real time during your active session only. Once you close or refresh the session, your data is not retained on our servers.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Technical Information</h3>
                <p className="text-gray-700">IP address, browser type, operating system, and diagnostic logs for debugging and performance monitoring.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Payment Information</h3>
                <p className="text-gray-700">Payment data is securely processed by third-party providers (e.g., Stripe). We do not store full payment card details.</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Information</h2>
            <p className="mb-4 text-gray-700">We use the collected data solely for legitimate business and operational purposes, including:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Operating, maintaining, and improving the Service.</li>
              <li>Providing user support and responding to inquiries.</li>
              <li>Managing account authentication, billing, and subscriptions.</li>
              <li>Monitoring platform performance, analytics, and security.</li>
              <li>Complying with legal and regulatory obligations.</li>
            </ul>
            <p className="text-gray-700 font-semibold mb-6">We do not use user data for advertising, profiling, or resale.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Data Ownership and Retention</h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3.1 User Ownership</h3>
            <p className="text-gray-700 mb-4">You retain full ownership of all content or data you upload or input into the Service.</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3.2 Processing Scope</h3>
            <p className="text-gray-700 mb-4">We process your data only for the purpose of generating requested outputs or reports during your active session. Once your session ends, the data is automatically deleted and is not retrievable by us.</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3.3 Aggregated Insights</h3>
            <p className="text-gray-700 mb-4">We may use de-identified, aggregated data derived from usage metrics to enhance Service performance. These insights do not contain personal or uploaded content.</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3.4 Retention Period</h3>
            <p className="text-gray-700 mb-6">We retain limited account and billing data for compliance and transaction recordkeeping as required by law. No content data is stored after session termination.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Sharing of Information</h2>
            <p className="mb-4 text-gray-700">We do not sell, rent, or trade personal information. Information may be shared only in the following limited circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Service Providers:</strong> With trusted vendors and partners (e.g., hosting providers, Convex, OpenAI, Stripe) that assist in operating the Service under confidentiality and security agreements.</li>
              <li><strong>Legal Compliance:</strong> When required by law, subpoena, or other legal process.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of all or part of our assets.</li>
            </ul>
            <p className="text-gray-700 mb-6">All partners and service providers are contractually obligated to handle data securely and in accordance with this Policy.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies and Tracking Technologies</h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5.1 What Are Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files stored on your device to enable website functionality, improve performance, and analyze user interactions.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5.2 Types of Cookies We Use</h3>
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900">Strictly Necessary Cookies</h4>
                <p className="text-gray-700">Required for login, authentication, and core Service operations.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Performance and Analytics Cookies</h4>
                <p className="text-gray-700">Collect anonymized usage data to measure platform performance.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Functional Cookies</h4>
                <p className="text-gray-700">Remember optional preferences such as language settings.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Security Cookies</h4>
                <p className="text-gray-700">Detect and prevent fraud or unauthorized access.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                <p className="text-gray-700 font-semibold">Currently not in use. If this changes, the Policy will be updated accordingly.</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5.3 Third-Party Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may use cookies or analytics services from trusted third parties such as:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Google Analytics</li>
              <li>Convex Logs</li>
              <li>OpenAI APIs</li>
              <li>Stripe (for payment processing)</li>
            </ul>
            <p className="text-gray-700 mb-6">
              Each third party operates under its own privacy policy.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5.4 Managing Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may disable or manage cookies through your browser settings. Please note that disabling essential cookies may impair some Service features.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard technical, organizational, and administrative security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              These measures include encryption in transit (HTTPS/TLS), secure authentication protocols, access controls, and regular security assessments. Our third-party service providers (Convex, Clerk, Stripe, OpenAI) maintain their own robust security frameworks.
            </p>
            <p className="text-gray-700 mb-6">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service is hosted and operated in the United States. If you access the Service from outside the United States, your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate.
            </p>
            <p className="text-gray-700 mb-6">
              Data protection laws in the United States and other countries may differ from those in your country of residence. By using the Service, you consent to the transfer of your information to the United States and other jurisdictions as necessary to provide the Service. We implement appropriate safeguards for international transfers where required by applicable law.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your jurisdiction, you may have certain rights regarding your personal information under applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
            </p>
            <p className="text-gray-700 mb-4">These rights may include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li><strong>Right to Access:</strong> Request access to and receive a copy of the personal information we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal information.</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your personal information, subject to certain exceptions (e.g., legal obligations, dispute resolution).</li>
              <li><strong>Right to Restriction:</strong> Request that we limit the processing of your personal information in certain circumstances.</li>
              <li><strong>Right to Data Portability:</strong> Receive your personal information in a structured, commonly used format and transmit it to another controller.</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal information for certain purposes, including marketing communications.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on your consent.</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise any of these rights, please contact us at <a href="mailto:knammouz@quantipack.com" className="text-[#767AFA] hover:underline">knammouz@quantipack.com</a>. We will respond to your request in accordance with applicable law, typically within 30 days.
            </p>
            <p className="text-gray-700 mb-6">
              You also have the right to lodge a complaint with a supervisory authority if you believe our processing of your personal information violates applicable law.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18.
            </p>
            <p className="text-gray-700 mb-6">
              If we become aware that we have collected personal information from a child under 18 without parental consent, we will take steps to delete such information as soon as possible. If you believe we have collected information from a child under 18, please contact us immediately at <a href="mailto:knammouz@quantipack.com" className="text-[#767AFA] hover:underline">knammouz@quantipack.com</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to update or modify this Privacy & Cookies Policy at any time to reflect changes in our practices, technology, legal requirements, or other factors.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              When we make material changes to this Policy, we will update the "Last Updated" date at the top of this page and may notify you through the Service or via email. We encourage you to review this Policy periodically to stay informed about how we protect your information.
            </p>
            <p className="text-gray-700 mb-6">
              Your continued use of the Service after any changes to this Policy constitutes your acceptance of the updated terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy & Cookies Policy or our data practices, please contact us at:
            </p>
            <p className="text-gray-700 mb-6">
              <strong>QuantiPack LLC</strong>
              <br />
              Email: <a href="mailto:knammouz@quantipack.com" className="text-[#767AFA] hover:underline">knammouz@quantipack.com</a>
            </p>
            <p className="text-gray-700 mb-6">
              We will respond to your inquiry as promptly as possible, typically within 7 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;