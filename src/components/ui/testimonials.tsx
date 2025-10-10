export default function TestimonialSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Our Mission
          </h2>
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 shadow-lg border-2 border-gray-200 relative overflow-hidden">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#767AFA' }}></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#767AFA' }}></div>

            <p className="text-xl text-gray-700 leading-relaxed relative z-10">
              At QuantiPackAI, our mission is to empower people — whether you're growing your career, running a business, or supporting clients — to unlock packaging savings and efficiencies that create real impact. We believe optimization shouldn't take months of complex analysis. With AI, it can be instant, accessible, and actionable. Our goal is simple: give you the tools to cut costs, reduce waste, and make smarter packaging decisions that drive lasting value.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}