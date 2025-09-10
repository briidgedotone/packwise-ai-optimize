import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { designSystem } from '@/lib/design-system';
import { Package, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: designSystem.colors.background }}>
      <div className="text-center max-w-md mx-auto px-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primaryLight }}>
            <Package className="h-8 w-8" style={{ color: designSystem.colors.primary }} />
          </div>
          <h1 className="text-6xl font-bold mb-4 text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: designSystem.colors.primary }}
          >
            <Home className="h-4 w-4" />
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
