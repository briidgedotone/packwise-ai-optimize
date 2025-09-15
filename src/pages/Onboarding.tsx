import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Package, Zap, ArrowRight } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import { stripePromise, PRICING_CONFIG, isStripeConfigured } from '@/lib/stripe';
import { toast } from 'sonner';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'starter' | 'professional'>('free');
  
  // Check if user already has a subscription
  const subscriptionStatus = useQuery(api.tokens.getSubscriptionStatus);

  // If user already has active subscription, redirect to dashboard
  if (subscriptionStatus?.isActive && subscriptionStatus.planType !== 'free') {
    navigate('/dashboard');
    return null;
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: 'Free',
      period: '14 days',
      tokens: 5,
      features: [
        '5 analysis tokens',
        'All features included',
        'Email support',
        '14-day trial period'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '$39.99',
      period: '/month',
      tokens: 50,
      features: [
        '50 tokens per month',
        'All features included',
        'Priority support',
        'CSV exports'
      ],
      cta: 'Subscribe Now',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$99.99',
      period: '/month',
      tokens: 150,
      features: [
        '150 tokens per month',
        'All features included',
        'Priority support',
        'API access',
        'Custom reports'
      ],
      cta: 'Subscribe Now',
      popular: true
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    setLoading(true);
    
    try {
      if (planId === 'free') {
        // Free trial - just redirect to dashboard
        toast.success('Welcome! Your free trial is active with 5 tokens.');
        navigate('/dashboard');
      } else {
        // Paid plan - initiate Stripe checkout
        if (!isStripeConfigured()) {
          toast.error('Payment system is not configured. Please contact support.');
          setLoading(false);
          return;
        }

        const stripe = await stripePromise;
        if (!stripe) {
          toast.error('Failed to load payment system');
          setLoading(false);
          return;
        }

        // For now, just show a message
        // TODO: Implement actual Stripe checkout
        toast.info('Stripe checkout will be implemented in the next step');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to process plan selection');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to QuantiPackAI, {user?.firstName || 'there'}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your plan to start optimizing your packaging with AI-powered insights.
            Each analysis uses one token.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'ring-2 ring-blue-600' : ''} ${selectedPlan === plan.id ? 'bg-blue-50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <div className="mt-2 text-blue-600 font-medium">
                  {plan.tokens} tokens {plan.id === 'free' ? 'total' : 'per month'}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handlePlanSelection(plan.id)}
                  disabled={loading}
                >
                  {loading && selectedPlan === plan.id ? (
                    'Processing...'
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <Zap className="h-12 w-12 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">How Tokens Work</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Each time you run an analysis (Suite Analyzer, Spec Generator, Demand Planner, or PDP Analyzer), 
            it uses one token. Tokens reset monthly on paid plans. Start with a free trial to explore all features!
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}