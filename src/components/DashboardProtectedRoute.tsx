import { useUser } from "@clerk/clerk-react";
import { Loader2, Package } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardProtectedRouteProps {
  children: ReactNode;
}

export function DashboardProtectedRoute({ children }: DashboardProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const subscriptionStatus = useQuery(api.tokens.getSubscriptionStatus);
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.username || "Anonymous User",
      }).catch(console.error);
    }
  }, [isLoaded, isSignedIn, user, createOrUpdateUser]);

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

  // Check if user is returning from successful payment
  const isReturningFromPayment = searchParams.get('payment') === 'success';

  // If user has no active subscription (not even free trial) and is not returning from payment, redirect to onboarding
  if (subscriptionStatus && !subscriptionStatus.isActive && !isReturningFromPayment) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is returning from payment but still no active subscription, wait a bit for webhook to process
  if (subscriptionStatus && !subscriptionStatus.isActive && isReturningFromPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
            <span className="text-gray-600">Processing your payment...</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Please wait while we activate your subscription</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}