'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: "How do tokens work?",
    answer: "Each time you run a core feature (Suite Analyzer, Demand Planner, Designer Analyzer, Spec Generator) you use one token. Tokens reset monthly based on your plan. Unused tokens don't roll over."
  },
  {
    question: "What happens if I run out of tokens?",
    answer: "You'll get low-balance alerts. You can upgrade your plan or contact us for a custom token amount."
  },
  {
    question: "Can I bring my historical data?",
    answer: "Yes. Upload order history, packaging types, or product lists via CSV/XLSX. We provide simple templates and support common formats."
  },
  {
    question: "What can I export?",
    answer: "Results from each feature can be exported — CSV for data-driven outputs (e.g., demand plans, packaging recommendations) or PDF for qualitative results (e.g., design comparisons, shelf-readiness reports)."
  },
  {
    question: "Is my data secure?",
    answer: "Yes—data is encrypted in transit and at rest. We don't share your data, and you can request deletion at any time."
  },
  {
    question: "Can I cancel or change plans?",
    answer: "Yes. You can change or cancel at the end of any billing cycle. If you cancel, remaining tokens are forfeited."
  },
  {
    question: "How does onboarding work?",
    answer: "The platform uses a step-by-step guided method that explains and walks you through each feature as you go—no heavy training required."
  },
  {
    question: "What makes QuantiPackAI different?",
    answer: "Proprietary formulas convert your real order and product data into clear actions—helping you right-size packaging, cut cost, reduce waste, and plan demand accurately."
  },
  {
    question: "Does QuantiPackAI integrate with my tools?",
    answer: "We support easy CSV exports for ERP/PLM/vendor workflows. If you need something specific, reach out—enterprise plans can accommodate custom needs."
  }
]

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  return (
    <section id="faq" className="pt-20 pb-2 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about QuantiPackAI and how it can transform your packaging operations.
          </p>
        </div>
        
        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full text-left px-8 py-6 focus:outline-none focus:ring-2 focus:ring-[#767AFA] focus:ring-offset-2 rounded-3xl"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                aria-expanded={openFAQ === index}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown 
                      className="h-5 w-5 text-gray-500"
                      style={{ color: openFAQ === index ? '#767AFA' : undefined }}
                    />
                  </motion.div>
                </div>
              </button>
              
              <AnimatePresence>
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6 pt-0">
                      <div className="h-px bg-gray-100 mb-4"></div>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-20">
          <div className="bg-white rounded-3xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help you get the most out of QuantiPackAI.
            </p>
            <a
              href="mailto:knammouz@quantipack.com"
              className="inline-block bg-[#767AFA] hover:opacity-90 text-white px-8 py-3 rounded-3xl font-medium transition-opacity"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}