import { useUser } from "@clerk/clerk-react";
import { Loader2, Package } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardProtectedRouteProps {
  children: ReactNode;
}

export function DashboardProtectedRoute({ children }: DashboardProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
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

  // Check if user is returning from successful payment - if so, redirect to dashboard immediately
  const isReturningFromPayment = searchParams.get('payment') === 'success';
  
  useEffect(() => {
    if (isReturningFromPayment) {
      // Immediately redirect to dashboard without payment parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('payment');
      window.location.replace(newUrl.pathname + newUrl.search);
    }
  }, [isReturningFromPayment]);

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

  return <>{children}</>;
}