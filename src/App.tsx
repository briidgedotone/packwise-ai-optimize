
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConvexClerkProvider } from "@/providers/ConvexClerkProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SuiteAnalysisResults from "./pages/SuiteAnalysisResults";
import SuiteAnalysisLoading from "./pages/SuiteAnalysisLoading";
import PDPAnalysisResults from "./pages/PDPAnalysisResults";
import DesignComparisonResults from "./pages/DesignComparisonResults";
import NotFound from "./pages/NotFound";

const App = () => (
  <ErrorBoundary>
    <ConvexClerkProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/suite-analysis/:analysisId" 
            element={
              <ProtectedRoute>
                <SuiteAnalysisResults />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/suite-analysis/:analysisId/loading" 
            element={
              <ProtectedRoute>
                <SuiteAnalysisLoading />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pdp-analysis/results" 
            element={
              <ProtectedRoute>
                <PDPAnalysisResults />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/design-comparison/results" 
            element={
              <ProtectedRoute>
                <DesignComparisonResults />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ConvexClerkProvider>
  </ErrorBoundary>
);

export default App;
