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
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>('starter');
  
  // Convex actions and queries
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const subscriptionStatus = useQuery(api.tokens.getSubscriptionStatus);

  const plans = [
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
    setSelectedPlan(planId as 'starter' | 'professional');
    
    try {
      // All plans are now paid plans - initiate Stripe checkout
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
            {subscriptionStatus?.planType === 'free'
              ? `Your free trial has ended, ${user?.firstName || 'there'}!`
              : `Welcome to QuantiPackAI, ${user?.firstName || 'there'}!`
            }
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subscriptionStatus?.planType === 'free'
              ? 'Please choose a plan to continue using QuantiPackAI and access all your previous analyses. Each plan includes unlimited access to all AI-powered features.'
              : 'Choose your plan to start optimizing your packaging with AI-powered insights. Each analysis uses one token.'
            }
          </p>
        </div>

        {/* Migration Notice for Free Trial Users */}
        {subscriptionStatus?.planType === 'free' && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Upgrade Required
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Your free trial access has ended. To continue using QuantiPackAI and access all your previous analyses,
                    please choose one of our paid plans below. All your data and previous work will be preserved.
                  </p>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• All your previous analyses will remain accessible</li>
                    <li>• No data will be lost during the upgrade</li>
                    <li>• Choose the plan that best fits your business needs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 py-6 mb-12 max-w-4xl mx-auto px-4">
          {plans.map((plan) => (
            <div key={plan.id}>
              <Card
                className={`relative border rounded-3xl h-full ${
                  plan.popular
                    ? "ring-2 ring-[#767AFA] bg-purple-50"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardHeader className="text-left pb-4">
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

                <CardContent className="pt-0 flex flex-col h-full">
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