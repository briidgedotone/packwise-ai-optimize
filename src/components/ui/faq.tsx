'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: "How do tokens work?",
    answer: "Each time you run a core function (analysis, spec batch, design compare), you use a token."
  },
  {
    question: "Can I bring my historical data?",
    answer: "Yes. Upload order history and packaging types via CSV/XLSX with our templates."
  },
  {
    question: "What if I run out of tokens?",
    answer: "Add tokens or upgrade your plan anytime."
  },
  {
    question: "Is my data secure?",
    answer: "We encrypt your data in transit and at rest."
  },
  {
    question: "Do you offer trials?",
    answer: "We're all paid plans. Book a walkthrough or view plans to get started."
  },
  {
    question: "Can I cancel or change plans?",
    answer: "Yes, at the end of any billing cycle."
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