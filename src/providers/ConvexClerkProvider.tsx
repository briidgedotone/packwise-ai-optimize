import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// Safe environment variable access
const getEnvVar = (viteKey: string, nextKey: string, fallback = "") => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[viteKey] || fallback;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[nextKey] || fallback;
  }
  return fallback;
};

const convexUrl = getEnvVar('VITE_CONVEX_URL', 'NEXT_PUBLIC_CONVEX_URL', '');
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

interface ConvexClerkProviderProps {
  children: ReactNode;
}

function DevModeUI() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">QP</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">QuantiPackAI</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            <strong>Development Mode:</strong> Missing Clerk API keys
          </p>
          <p className="text-yellow-700 text-xs mt-2">
            Add your Clerk publishable key to .env.local to enable authentication
          </p>
        </div>
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Continue to Dashboard (Dev Mode)
          </button>
          <p className="text-xs text-gray-500">
            This will skip authentication for development
          </p>
        </div>
      </div>
    </div>
  );
}

export function ConvexClerkProvider({ children }: ConvexClerkProviderProps) {
  const publishableKey = getEnvVar('VITE_CLERK_PUBLISHABLE_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_placeholder');

  // For development, provide fallback UI if keys are missing
  if (!publishableKey || publishableKey === 'pk_test_placeholder' || publishableKey === 'pk_test_your_key_here') {
    return <DevModeUI />;
  }

  // If Convex is not configured, just use Clerk without Convex
  if (!convex) {
    return (
      <ClerkProvider 
        publishableKey={publishableKey}
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            card: "shadow-lg",
          },
        }}
      >
        {children}
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          card: "shadow-lg",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}