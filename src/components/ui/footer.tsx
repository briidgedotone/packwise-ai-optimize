"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const navigation = {
  categories: [
    {
      id: "main",
      name: "Main",
      sections: [
        {
          id: "product",
          name: "Product",
          items: [
            { name: "Suite Analyzer", href: "/product/suite-analyzer" },
            { name: "Demand Planner", href: "/product/demand-planner" },
            { name: "Spec Generator", href: "/product/spec-generator" },
            { name: "Design Analyzer", href: "/product/design-analyzer" },
            { name: "Packaging AI Chatbot", href: "/product/packaging-ai-chatbot" },
          ],
        },
        {
          id: "legal",
          name: "Legal",
          items: [
            { name: "Privacy and Cookies Policy", href: "/privacy-policy" },
            { name: "Terms of Service", href: "/terms-of-service" },
          ],
        },
      ],
    },
  ],
};

export default function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="relative mx-auto grid max-w-7xl items-start justify-start gap-8 pb-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img src="/logo.svg" alt="QuantiPackAI Logo" className="h-10" />
            </Link>
            <p className="text-gray-600 mb-4 leading-relaxed">
              AI-powered packaging optimization platform that helps businesses reduce costs, 
              eliminate waste, and maximize efficiency through intelligent analysis and forecasting.
            </p>
            <p className="text-gray-500 text-sm">© 2024 QuantiPackAI. All rights reserved.</p>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-2 md:ml-auto">
            <h4 className="font-semibold mb-4 text-gray-900">Stay updated</h4>
            <p className="text-gray-600 text-sm mb-4">Get packaging optimization tips and product updates</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-3xl"
                disabled
              />
              <Button
                style={{ backgroundColor: '#767AFA' }}
                className="hover:opacity-90 rounded-3xl whitespace-nowrap"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Links Section */}
        <div className="py-8">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12"
            >
              {category.sections.map((section) => (
                <div key={section.name}>
                  <h4 className="font-semibold mb-4 text-gray-900">{section.name}</h4>
                  <ul role="list" className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className="text-gray-600 hover:text-[#767AFA] transition-colors text-sm"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex space-x-6 text-gray-600 text-sm mb-4 md:mb-0">
            <Link to="/privacy-policy" className="hover:text-[#767AFA] transition-colors">Privacy and Cookies Policy</Link>
            <Link to="/terms-of-service" className="hover:text-[#767AFA] transition-colors">Terms of Service</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-[#767AFA] transition-colors">
                <span className="sr-only">LinkedIn</span>
                LinkedIn
              </a>
              <a href="#" className="text-gray-600 hover:text-[#767AFA] transition-colors">
                <span className="sr-only">Twitter</span>
                Twitter
              </a>
              <a href="#" className="text-gray-600 hover:text-[#767AFA] transition-colors">
                <span className="sr-only">YouTube</span>
                YouTube
              </a>
            </div>
            
            {/* Scroll to top button */}
            <button
              onClick={handleScrollTop}
              className="p-2 rounded-full border border-gray-300 hover:border-[#767AFA] transition-colors text-gray-600 hover:text-[#767AFA]"
              aria-label="Scroll to top"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}