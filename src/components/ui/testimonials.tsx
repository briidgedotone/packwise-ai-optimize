import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

export default function TestimonialSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'VP of Operations, FreshGoods Inc.',
      stars: 5,
      avatar: '/api/placeholder/40/40', // Placeholder for now
      content:
        "QuantiPackAI identified $200K in annual savings we didn't know existed. The Suite Analyzer paid for itself in the first week.",
    },
    {
      name: 'Michael Torres',
      role: 'Supply Chain Manager, DirectShip Co.',
      stars: 5,
      avatar: '/api/placeholder/40/40', // Placeholder for now
      content:
        'The Demand Planner eliminated our stockouts completely. We haven\'t had a packaging shortage in 6 months.',
    },
    {
      name: 'Emily Watson',
      role: 'Brand Manager, ConsumerFirst',
      stars: 5,
      avatar: '/api/placeholder/40/40', // Placeholder for now
      content:
        'The Design Analyzer helped us increase shelf appeal by 40%. Our products finally stand out against competitors.',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F6F9' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by packaging professionals worldwide
          </h2>
        </div>
        
        {/* 1 col (xs) → 2 cols (sm ≥640px) → 3 cols (lg ≥1024px) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex gap-1 mb-6" aria-label={`${t.stars} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < t.stars
                        ? 'fill-black stroke-black'
                        : 'fill-gray-200 stroke-transparent'
                    )}
                  />
                ))}
              </div>

              <blockquote className="text-gray-700 mb-6 text-lg italic">
                "{t.content}"
              </blockquote>

              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-gray-100">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                    {t.name.split(' ').map(n => n.charAt(0)).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-gray-600 text-sm">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}