import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, Check, Zap, AlertCircle, ArrowRight,
  Sparkles, Crown, Building, Star, Shield
} from 'lucide-react';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface PlanCardProps {
  plan: {
    name: string;
    planId: string;
    price: number;
    tokensPerMonth: number;
    features: string[];
    description: string;
  };
  currentPlan: string;
  onSelect: () => void;
  isPopular?: boolean;
}

const PlanCard = ({ plan, currentPlan, onSelect, isPopular }: PlanCardProps) => {
  const isCurrentPlan = currentPlan === plan.planId;
  const isFree = plan.planId === 'free';
  const isEnterprise = plan.planId === 'enterprise';

  const getIcon = () => {
    switch (plan.planId) {
      case 'free': return <Zap className="h-6 w-6" />;
      case 'starter': return <Sparkles className="h-6 w-6" />;
      case 'professional': return <Crown className="h-6 w-6" />;
      case 'enterprise': return <Building className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''} ${isCurrentPlan ? 'bg-blue-50 border-blue-200' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white">Most Popular</Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="outline" className="bg-white">Current Plan</Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
            {getIcon()}
          </div>
          {plan.tokensPerMonth < 999999 && (
            <Badge variant="secondary">{plan.tokensPerMonth} tokens/mo</Badge>
          )}
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">
            {isFree ? 'Free' : isEnterprise ? 'Custom' : `$${plan.price / 100}`}
          </span>
          {!isFree && !isEnterprise && <span className="text-gray-500">/month</span>}
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan || isFree}
          onClick={onSelect}
        >
          {isCurrentPlan ? 'Current Plan' : isEnterprise ? 'Contact Sales' : 'Upgrade'}
          {!isCurrentPlan && !isEnterprise && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </CardContent>
    </Card>
  );
};

export const Billing = () => {
  const { user } = useUser();
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const plans = useQuery(api.subscriptions.getSubscriptionPlans);
  const setStripeCustomerId = useMutation(api.subscriptions.setStripeCustomerId);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planId: 'starter' | 'professional') => {
    if (!user?.emailAddresses[0]?.emailAddress) {
      toast.error('Please verify your email address first');
      return;
    }

    setIsLoading(true);
    
    try {
      await createCheckoutSession(
        planId,
        user.emailAddresses[0].emailAddress,
        `${window.location.origin}/settings?tab=billing&success=true`,
        `${window.location.origin}/settings?tab=billing`
      );
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      await createPortalSession(`${window.location.origin}/settings?tab=billing`);
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for success parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Subscription updated successfully!');
      // Remove the success parameter from URL
      params.delete('success');
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  if (!subscription || !plans) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const usagePercentage = (subscription.tokensUsed / subscription.tokensLimit) * 100;
  const isNearLimit = usagePercentage > 80;
  const hasReachedLimit = usagePercentage >= 100;

  return (
    <div className="space-y-6">
      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>
            Your token usage for {subscription.billingCycle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tokens Used</span>
              <span className="text-sm text-gray-500">
                {subscription.tokensUsed} / {subscription.tokensLimit}
              </span>
            </div>
            
            <Progress 
              value={Math.min(usagePercentage, 100)} 
              className={`h-2 ${hasReachedLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : ''}`}
            />
            
            {hasReachedLimit && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  You've reached your token limit for this month. Upgrade to continue using QuantiPackAI.
                </AlertDescription>
              </Alert>
            )}
            
            {isNearLimit && !hasReachedLimit && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  You're approaching your token limit. Consider upgrading for uninterrupted access.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tokens Remaining</span>
                <span className="font-semibold text-lg">
                  {subscription.tokensRemaining}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Token Usage by Analysis Type</CardTitle>
          <CardDescription>
            Each analysis type consumes a different number of tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Suite Analyzer</span>
              <Badge variant="secondary">10 tokens</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Spec Generator</span>
              <Badge variant="secondary">15 tokens</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Demand Planner</span>
              <Badge variant="secondary">8 tokens</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">PDP Analyzer</span>
              <Badge variant="secondary">5 tokens</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Subscription Plans</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.planId}
              plan={plan}
              currentPlan={subscription.plan}
              isPopular={plan.planId === 'professional'}
              onSelect={() => {
                if (plan.planId === 'enterprise') {
                  window.open('mailto:sales@quantipackai.com?subject=Enterprise Plan Inquiry', '_blank');
                } else if (plan.planId === 'starter' || plan.planId === 'professional') {
                  handleUpgrade(plan.planId);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Manage Subscription */}
      {subscription.plan !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Update payment method, download invoices, or cancel subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              variant="outline"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};