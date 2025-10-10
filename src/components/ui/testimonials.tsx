import { Sparkles, Target, TrendingDown, Leaf } from 'lucide-react';

export default function TestimonialSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-12">
            At QuantiPackAI, our mission is to empower people — whether you're growing your career, running a business, or supporting clients — to unlock packaging savings and efficiencies that create real impact.
          </p>
        </div>

        {/* Key mission points in cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant AI Analysis</h3>
            <p className="text-gray-600 text-sm">
              Optimization shouldn't take months. With AI, it's instant, accessible, and actionable.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cut Costs</h3>
            <p className="text-gray-600 text-sm">
              Give you the tools to reduce expenses and make smarter packaging decisions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Leaf className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reduce Waste</h3>
            <p className="text-gray-600 text-sm">
              Create lasting value through sustainable, efficient packaging solutions.
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium shadow-lg">
            <Target className="h-5 w-5" />
            <span>Driving lasting value through smarter packaging</span>
          </div>
        </div>
      </div>
    </section>
  )
}