import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Package, Zap, ArrowRight, CheckCheck } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import { PRICING_CONFIG, isStripeConfigured } from '@/lib/stripe';
import { toast } from 'sonner';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'starter' | 'professional'>('free');
  
  // Convex actions
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const createFreeTrialSubscription = useMutation(api.subscriptionCRUD.createFreeTrialSubscription);
  const createFreeTrialBalance = useMutation(api.tokenBalance.createFreeTrialBalance);
  const getUserByClerkId = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  
  // Check if user already has a subscription
  const subscriptionStatus = useQuery(api.tokens.getSubscriptionStatus);

  // If user already has active paid subscription, redirect to dashboard
  if (subscriptionStatus?.isActive && (subscriptionStatus.planType === 'starter' || subscriptionStatus.planType === 'professional')) {
    navigate('/dashboard');
    return null;
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      description: 'Perfect for trying out QuantiPackAI with sample analyses',
      price: 'Free',
      period: '5 tokens',
      tokens: 5,
      cta: 'Start Free Trial',
      popular: false,
      includes: [
        'Free includes:',
        '5 analysis tokens',
        'All applications included',
        'Email support',
        'Basic analytics',
        'CSV export'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Great for small businesses and startups looking to get started with AI',
      price: 39.99,
      period: '/month',
      tokens: 50,
      cta: 'Start Now',
      popular: false,
      includes: [
        'Free includes:',
        'Unlimited CSV uploads',
        'Basic reporting & analytics',
        'Email support',
        'Up to 1 organization',
        'Standard templates'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Best value for growing businesses that need more advanced features',
      price: 99.99,
      period: '/month',
      tokens: 150,
      cta: 'Start Now',
      popular: true,
      includes: [
        'Everything in Starter, plus:',
        'Advanced analytics dashboard',
        'Custom report generation',
        'Priority email support',
        'API access for integrations',
        'Up to 5 organizations',
        'Advanced templates'
      ]
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    setLoading(true);
    setSelectedPlan(planId as any);
    
    try {
      if (planId === 'free') {
        // Free trial - create subscription and token balance
        if (!getUserByClerkId) {
          toast.error('User not found');
          setLoading(false);
          return;
        }

        // Create free trial subscription
        await createFreeTrialSubscription({ userId: getUserByClerkId._id });

        // Create token balance
        await createFreeTrialBalance({ userId: getUserByClerkId._id });

        toast.success('Welcome! Your free trial is active with 5 tokens.');
        navigate('/dashboard');
      } else {
        // Paid plan - initiate Stripe checkout
        if (!isStripeConfigured()) {
          toast.error('Payment system is not configured. Please contact support.');
          setLoading(false);
          return;
        }

        if (!user) {
          toast.error('User not found');
          setLoading(false);
          return;
        }

        // Get the price ID based on plan
        const priceId = planId === 'starter'
          ? import.meta.env.VITE_STRIPE_STARTER_PRICE_ID
          : import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID;

        if (!priceId) {
          toast.error('Price configuration is missing');
          setLoading(false);
          return;
        }

        // Create Stripe checkout session
        const session = await createCheckoutSession({
          priceId,
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress || '',
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/onboarding`,
        });

        if (session.url) {
          // Redirect to Stripe checkout
          window.location.href = session.url;
        } else {
          toast.error('Failed to create checkout session');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to process plan selection');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6FF' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 space-y-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#767AFA' }}>
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to QuantiPackAI, {user?.firstName || 'there'}!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your plan to start optimizing your packaging with AI-powered insights.
            Each analysis uses one token.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 py-6 mb-12">
          {plans.map((plan) => (
            <div key={plan.id}>
              <Card
                className={`relative border rounded-3xl ${
                  plan.popular
                    ? "ring-2 ring-[#767AFA] bg-purple-50"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardHeader className="text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    {plan.popular && (
                      <div className="">
                        <span className="bg-[#767AFA] text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline">
                    {typeof plan.price === 'number' ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 ml-1">
                          {plan.period}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-gray-600 ml-1">
                          {plan.period}
                        </span>
                      </>
                    )}
                  </div>
                  {plan.tokens && (
                    <p className="font-semibold mt-2 text-[#767AFA]">
                      {plan.tokens} tokens {plan.id === 'free' ? 'total' : 'per month'}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={loading && selectedPlan === plan.id}
                    className={`w-full p-4 text-lg rounded-3xl font-medium transition-all mb-6 ${
                      plan.popular
                        ? "bg-[#767AFA] hover:opacity-90 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    } ${loading && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading && selectedPlan === plan.id ? 'Processing...' : plan.cta}
                  </button>

                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-2">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <span className="h-5 w-5 bg-white border border-[#767AFA] rounded-full grid place-content-center mt-0.5 mr-3 flex-shrink-0">
                            <CheckCheck className="h-3 w-3 text-[#767AFA]" />
                          </span>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}