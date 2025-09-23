import { useUser } from "@clerk/clerk-react";
import { Loader2, Package, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DashboardProtectedRouteProps {
  children: ReactNode;
}

export function DashboardProtectedRoute({ children }: DashboardProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const subscriptionStatus = useQuery(api.tokens.getSubscriptionStatus);
  // const webhookStatus = useQuery(api.tokens.getWebhookStatus); // Temporarily disabled
  const webhookStatus = null; // Temporary fallback
  const syncSubscription = useAction(api.tokens.syncSubscriptionFromStripe);
  const [searchParams] = useSearchParams();
  const [paymentProcessingTime, setPaymentProcessingTime] = useState(0);
  const [showManualRefresh, setShowManualRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Create a comprehensive name from available Clerk data
      const fullName = user.fullName ||
                      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '') ||
                      user.firstName ||
                      user.lastName ||
                      user.username ||
                      'User';

      createOrUpdateUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: fullName,
      }).catch(console.error);
    }
  }, [isLoaded, isSignedIn, user, createOrUpdateUser]);

  // Check if user is returning from successful payment
  const isReturningFromPayment = searchParams.get('payment') === 'success';

  // Handle payment success flow with webhook wait time
  useEffect(() => {
    if (isReturningFromPayment) {
      // Start tracking processing time
      const startTime = Date.now();
      const interval = setInterval(() => {
        setPaymentProcessingTime(Date.now() - startTime);
      }, 1000);

      // Show manual refresh option after 15 seconds if still waiting
      const refreshTimeout = setTimeout(() => {
        setShowManualRefresh(true);
      }, 15000);

      // If subscription becomes active, redirect immediately
      if (subscriptionStatus?.isActive) {
        clearTimeout(refreshTimeout);
        clearInterval(interval);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment');
        window.location.replace(newUrl.pathname + newUrl.search);
      }

      return () => {
        clearTimeout(refreshTimeout);
        clearInterval(interval);
      };
    }
  }, [isReturningFromPayment, subscriptionStatus?.isActive]);

  // Manual refresh subscription status
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await syncSubscription();
      if (result.success) {
        toast.success(result.message);
        // Reload to get updated subscription status
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.message);
        setIsRefreshing(false);
      }
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      toast.error('Failed to refresh subscription status');
      setIsRefreshing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading QuantiPackAI...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirect to sign in page using React Router
    return <Navigate to="/sign-in" replace />;
  }

  // If subscription status is loading, show loading state
  if (subscriptionStatus === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Checking subscription...</span>
          </div>
        </div>
      </div>
    );
  }

  // If returning from payment, show loading state and bypass subscription check
  if (isReturningFromPayment) {
    const seconds = Math.floor(paymentProcessingTime / 1000);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
            <span className="text-lg font-medium text-gray-900">Payment successful!</span>
          </div>
          <p className="text-gray-600 mb-6">
            We're setting up your account and processing your subscription...
          </p>

          {/* Webhook Status */}
          {webhookStatus && (
            <div className={`rounded-lg p-4 mb-4 ${
              webhookStatus.status === 'completed' ? 'bg-green-50 border border-green-200' :
              webhookStatus.status === 'failed' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {webhookStatus.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : webhookStatus.status === 'failed' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
                <span className={`text-sm font-medium ${
                  webhookStatus.status === 'completed' ? 'text-green-700' :
                  webhookStatus.status === 'failed' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {webhookStatus.status === 'completed' ? 'Payment Processed' :
                   webhookStatus.status === 'failed' ? 'Payment Processing Failed' :
                   'Processing Payment'}
                </span>
              </div>
              {webhookStatus.message && (
                <p className={`text-xs ${
                  webhookStatus.status === 'completed' ? 'text-green-600' :
                  webhookStatus.status === 'failed' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {webhookStatus.message}
                </p>
              )}
            </div>
          )}

          {seconds > 3 && !webhookStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                Processing payment confirmation... ({seconds}s)
              </p>
              {seconds > 10 && (
                <p className="text-xs text-blue-600 mt-1">
                  This usually takes a few seconds, but can take up to 30 seconds during peak times.
                </p>
              )}
            </div>
          )}

          {(showManualRefresh || (webhookStatus && webhookStatus.status === 'failed')) && (
            <div className={`border rounded-lg p-4 ${
              webhookStatus && webhookStatus.status === 'failed' ?
              'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <p className={`text-sm mb-3 ${
                webhookStatus && webhookStatus.status === 'failed' ?
                'text-red-700' : 'text-yellow-700'
              }`}>
                {webhookStatus && webhookStatus.status === 'failed' ?
                  'Payment processing failed. You can manually sync your subscription from Stripe.' :
                  'Taking longer than expected? You can manually refresh to check your subscription status.'}
              </p>
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="w-full"
                variant="outline"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Syncing from Stripe...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Subscription from Stripe
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If user has no active subscription (not even free trial), redirect to onboarding
  if (subscriptionStatus && !subscriptionStatus.isActive) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}